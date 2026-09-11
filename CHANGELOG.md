# Changelog

All notable changes to this plugin are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

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
