/**
 * dsh-prompt-polish — Host half.
 *
 * Registers a same-origin HTTP route `POST /prompt-polish` on the web server.
 * The browser half (lib/client.js) posts the current composer draft here; the
 * route rewrites it through the already-connected LLM and returns the polished
 * text. The browser then replaces the draft so the user can review before
 * sending.
 *
 * The request body is `{ text, style? }` where `style` picks one of three
 * rewrite modes:
 *   - 'concise'  — tight, punchy, no fluff
 *   - 'detailed' — expanded, structured, self-contained
 *   - 'code'     — programming-task oriented: code, commands, file paths kept
 *                 verbatim, explicit inputs/outputs/constraints
 *   - absent     — balanced professional rewrite (the default)
 *
 * The route resolves the model from the agent default selection first, then
 * falls back to the plugin's own provider/model config. The connected
 * credentials come from the same settings the web Models page writes.
 *
 * @module dsh-prompt-polish
 */

import { createUserMessage } from '@deepseek-ai/dsh-llm'
import s from '@deepseek-ai/schemastery'

/** Maximum request body we accept (16 KiB is ample for a prompt draft). */
const MAX_BODY_BYTES = 16 * 1024

/** Shared preamble: every mode is an expert prompt engineer. */
const ENGINEER = [
  'You are an expert prompt engineer for a coding agent.',
  "Rewrite the user's input prompt into a better prompt while keeping the user's original intent and language.",
  'Return ONLY the rewritten prompt as plain text — no explanations, no preamble, no quoting, no Markdown fences.',
].join('\n')

/** Balanced professional rewrite (the default when no style is given). */
const SYSTEM_BALANCED = [
  ENGINEER,
  'Make the prompt more professional, precise, and easier for an AI assistant to understand.',
  'Make it self-contained: state the goal, the required inputs, the expected output format, and any constraints explicitly.',
].join('\n')

/** Tight and punchy: strip redundancy, keep every requirement, no filler. */
const SYSTEM_CONCISE = [
  ENGINEER,
  'Make the prompt concise and direct: remove redundant words, hedging, and filler while keeping every requirement.',
  'Prefer short imperative sentences and compact lists. Keep it scannable in a few lines.',
].join('\n')

/** Expanded and structured: fuller context, explicit steps, thorough constraints. */
const SYSTEM_DETAILED = [
  ENGINEER,
  'Make the prompt detailed and self-contained: expand background, break the task into explicit numbered steps, and spell out inputs, outputs, edge cases, and acceptance criteria.',
  'The result may be long; completeness matters more than brevity.',
].join('\n')

/** Programming-task oriented: code, commands, and paths stay verbatim. */
const SYSTEM_CODE = [
  ENGINEER,
  'This is a programming task prompt. Rewrite it so an AI coding agent can act on it precisely.',
  'Keep all code, commands, file paths, language names, and technical identifiers verbatim.',
  'Make explicit: the goal, the files or inputs involved, the expected output or change, constraints (e.g. standard library only), and how to verify success.',
  'If the prompt already asks for a specific implementation, keep the request concrete and unambiguous.',
].join('\n')

/** Mode -> system instruction table; unknown modes fall back to balanced. */
const SYSTEM_BY_STYLE = {
  balanced: SYSTEM_BALANCED,
  concise: SYSTEM_CONCISE,
  detailed: SYSTEM_DETAILED,
  code: SYSTEM_CODE,
}

/** Valid `style` wire values (also the config override key). */
const STYLE_KEYS = ['balanced', 'concise', 'detailed', 'code']

/** The plugin's own copy overrides; both default to the shared instruction. */
const Config = s.object({
  system: s.string(),
  provider: s.string(),
  model: s.string(),
  maxTokens: s.number(),
  style: s.union(['balanced', 'concise', 'detailed', 'code']),
})

/**
 * Read the request body with a size cap.
 * @param req - the HTTP request.
 * @returns the decoded UTF-8 body.
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

/** Send one JSON response. */
function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(body)
}

/**
 * Stream one LLM rewrite and return the assembled text.
 * @param llm - the ctx.llm service.
 * @param route - the resolved provider/model route.
 * @param system - the rewrite instruction.
 * @param text - the draft to rewrite.
 * @param maxTokens - output-token cap.
 * @returns the assembled polished text.
 */
async function polishText(llm, route, system, text, maxTokens) {
  const chunks = []
  for await (const chunk of llm.stream({
    provider: route.provider,
    model: route.model,
    system,
    messages: [createUserMessage({
      content: [{ type: 'text', text }],
      source: { kind: 'user' },
    })],
    maxTokens,
    ...(route.reasoningEffort === undefined ? {} : { reasoningEffort: route.reasoningEffort }),
  })) {
    if (chunk.type === 'text-delta') chunks.push(chunk.text)
    else if (chunk.type === 'finish' && chunk.reason.kind !== 'stop') {
      throw new Error(`prompt-polish: model finished with ${chunk.reason.kind}`)
    }
  }
  const polished = chunks.join('').trim()
  if (polished.length === 0) {
    throw new Error('prompt-polish: model returned an empty rewrite')
  }
  return polished
}

/** Plugin entry: mount the route. */
const name = 'prompt-polish'
const inject = ['webServer', 'llm', 'agentDefaultModel']

function apply(ctx, config = {}) {
  const maxTokens = config.maxTokens ?? 2048

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/prompt-polish',
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'method not allowed' })
        return
      }
      try {
        const raw = await readBody(req)
        const payload = JSON.parse(raw)
        const text = typeof payload?.text === 'string' ? payload.text.trim() : ''
        if (text.length === 0) {
          sendJson(res, 400, { ok: false, error: 'empty draft' })
          return
        }
        // Resolve the rewrite mode: request style wins, then the config
        // default, then balanced.
        const style = STYLE_KEYS.includes(payload?.style)
          ? payload.style
          : STYLE_KEYS.includes(config.style)
            ? config.style
            : 'balanced'
        const system = config.system ?? SYSTEM_BY_STYLE[style]
        let route
        if (config.provider !== undefined && config.model !== undefined) {
          route = { provider: config.provider, model: config.model }
        } else {
          const selection = ctx.agentDefaultModel.currentSelection()
          route = {
            provider: selection.provider,
            model: selection.model,
            ...(selection.reasoningEffort === undefined
              ? {}
              : { reasoningEffort: selection.reasoningEffort }),
          }
        }
        const polished = await polishText(ctx.llm, route, system, text, maxTokens)
        sendJson(res, 200, { ok: true, text: polished, style })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        sendJson(res, 500, { ok: false, error: message })
      }
    },
  }), 'prompt-polish: route')
}

export { Config, apply, inject, name };
