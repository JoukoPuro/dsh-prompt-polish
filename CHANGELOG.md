# Changelog

All notable changes to this plugin are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.1] - 2026-10-17

### Fixed

- **A truncated rewrite failed the whole action.** When the model hit the
  output cap, the stream's `max-tokens` finish reason was treated as an error
  and the host answered HTTP 500, so the user only saw the generic
  "polish failed" toast. `max-tokens` and `tool-calls` finishes now return
  the produced text (a truncated rewrite still beats the raw draft) and log a
  truncation warning; only `error` / `aborted` finishes fail the action, and
  they carry the provider's message. The default output cap is raised from
  2048 to 4096 tokens so detailed rewrites fit without truncation.

## [0.2.0] - 2026-10-17

### Added

- **DSH 0.2.x support.** The plugin now declares its runtime requirement with
  `engines.dsh: ">=0.1.0-rc.6 <0.3.0"`, which DSH 0.2's plugin-compatibility
  gate reads directly (it ignores `peerDependencies` when `engines.dsh` is
  present). One artifact therefore installs on both the 0.1.x and 0.2.x lines.

### Fixed

- **Icons no longer resolve on DSH 0.2.1-rc.1.** That release renamed the whole
  primitives icon set from size suffixes to weight suffixes
  (`IconSparkle16` → `IconSparkleRegular`, `IconChecklistOutline14` →
  `IconChecklistOutlineRegular`, …), so every hard-coded name was `undefined`
  and the button could not render. Icons are now resolved at runtime by probing
  the 0.2 names first and falling back to the 0.1 names; a total miss degrades
  to no icon instead of a crash.

### Notes

- Verified against DSH `0.2.1-rc.1`: the boot row is served, the host route
  answers 200, and the bundle passes the full harness (20 checks, including
  both icon-naming generations and 14 language cases).

## [0.1.1] - 2026-09-11

### Fixed

- **Composer draft was never readable on DSH `0.1.5-rc.2`**, which left the
  polish button permanently disabled. That DSH version dropped the `owner`
  declaration from the `conversation.input.*` slots — owner props are now an
  empty object, so `props.input.draft` was always `undefined`.

  The draft is now read from the standard session kit instead: the `input`
  hook (synthesized to `useInput`) plus the `inputActions` prop. The old
  owner-props path is kept as a fallback for DSH `<= 0.1.0-rc.6`; the branch
  is constant per DSH version, so hook order stays stable.

### Notes

- Verified against DSH `0.1.5-rc.2` (type contract, logic equivalence, served
  bundle) and kept working on `0.1.0-rc.6`.

## [0.1.0] - 2026-08-14

### Added

- Icon-only composer tool-row button (`conversation.input.right`) with a
  sparkle glyph and a loading spinner while a rewrite is in flight.
- Four rewrite styles selectable from an anchored menu: balanced, concise,
  detailed, and code-oriented.
- Multi-language UI (zh, en, ja, ko, fr, de, es, pt, ru, it, tr, vi) detected
  from the browser's language list, falling back to English.
- Host route `POST /prompt-polish` that streams one rewrite through the
  already-connected LLM, resolving the model from `agentDefaultModel` or an
  explicit `provider`/`model` config.
- Optional config: `style`, `maxTokens`, `provider`, `model`, `system`.
