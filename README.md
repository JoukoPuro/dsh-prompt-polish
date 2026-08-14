# dsh-prompt-polish

English | [中文](README.zh.md)

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) plugin
that adds a ✨ sparkle button to the web composer's tool row. Click it, pick a
rewrite style, and the already-connected LLM rewrites your draft prompt to be
more professional and easier for an AI to understand — then replaces the draft
so you can review before sending.

- **Icon-only button** — a sparkle glyph in the composer tool row; no text,
  tooltip gives the full description.
- **Four rewrite styles** — balanced / concise / detailed / code-oriented.
- **Multi-language UI** — menu copy follows your browser language (zh, en, ja,
  ko, fr, de, es, pt, ru, it, tr, vi; falls back to English).
- **Uses your connected model** — resolves the current default agent model
  (`agentDefaultModel`), or an explicit `provider`/`model` from config.

## Requirements

- DeepSeek Harness (`@deepseek-ai/dsh`) web profile running, with a model
  adapter configured (e.g. the DeepSeek provider with an API key in Settings).

## Install

```sh
# from a checkout of this repository (or the directory containing it)
dsh plugin --profile web add ./dsh-prompt-polish
```

Then restart `dsh web` so the profile picks up the new bundle:

```sh
dsh web
```

Open the web UI, type a draft, and click the sparkle button in the composer
tool row.

## Configuration

The plugin accepts optional config in the profile's `cordis.patch.yml`
(user layer, applied after the bundle layer):

```yaml
- id: prompt-polish
  config:
    provider: deepseek-official   # explicit route (optional)
    model: deepseek-v4-flash      # must be paired with provider
    style: balanced               # default rewrite style: balanced | concise | detailed | code
    maxTokens: 2048               # output cap for the rewrite call
    # system: '...'               # custom rewrite instruction (replaces the built-in per-style prompts)
```

Without `provider`/`model`, the plugin uses
`agentDefaultModel.currentSelection()` — the same default model the session
uses.

## How it works

| Half | File | Role |
|---|---|---|
| Host | `lib/index.js` | Registers `POST /prompt-polish` on the web server; streams one LLM rewrite via `ctx.llm` |
| Browser | `lib/client.js` | Registers the sparkle button into `conversation.input.right`; opens a style menu; posts the draft and replaces it with the polished text |

The bundle's `package.json` declares both faces of the dual-face plugin:

- `dsh.bundle` — the profile patch layer (`cordis.patch.yml`) that inserts the
  `prompt-polish` loader row.
- `dsh.client` — the web boot row; `client-modules` serves `lib/client.js` at
  `/plugins/dsh-prompt-polish/client.js`.

## Development

Edit `lib/index.js` (host) and `lib/client.js` (browser). The browser bundle is
a hand-built closure-factory artifact (`window.__ModuleLoader__.load({ id,
factory })`) — keep externals limited to the platform modules
(`react`, `@deepseek-ai/dsh-client-ui-primitives`) and inline everything else,
matching the loader's module-table rules.

Verify on a scratch port before touching the live profile:

```sh
dsh web --port 3099
curl -s http://127.0.0.1:3099/plugins/dsh-prompt-polish/client.js | head
curl -s -X POST http://127.0.0.1:3099/prompt-polish \
  -H 'content-type: application/json' \
  -d '{"text":"read a.csv and sort by b","style":"code"}'
```

## License

MIT
