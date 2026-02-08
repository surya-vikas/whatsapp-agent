# AGENTS.md — whatsapp-agent

## Stack
- **Runtime:** Bun.js
- **Language:** TypeScript (ES modules)
- **WhatsApp:** @whiskeysockets/baileys
- **AI Provider:** OpenClaw/OpenCode native model routing (NOT custom HTTP wrappers)
- **Default Model:** Kimi K2.5 via Zen provider
- **Fallback:** Best available free model via OpenClaw

## Architecture Principles
- **Separation of concerns:** Each module has a single responsibility
- **Provider-agnostic agents:** Agent logic never depends on specific LLM provider
- **OpenClaw-native:** Uses OpenCode's SDK conventions and model resolution, not custom transport
- **Async-safe:** All error handling is async-aware with proper boundaries
- **No hardcoded secrets:** Environment variables via .env, validated on startup

## Git Conventions
- Conventional commits: feat/fix/docs/chore/refactor
- Granular staging: `git add -p` for atomic commits
- Descriptive messages aligned with TASK.md phases
- Examples:
  - `chore: initialize bun project`
  - `feat: integrate opencode model invocation`
  - `feat: add whatsapp event bridge`
  - `feat: implement automatic model fallback using opencode`
  - `refactor: isolate config validation`
  - `docs: document openclaw integration`

## Commands
- `bun install` — Install dependencies
- `bun run dev` — Start with watch mode
- `bun run src/main.ts` — Start the agent

## Key Design Decisions
- OpenCode's `opencode run` CLI pattern is used for model invocation
- getActiveModel() resolver respects OpenClaw's native model selection mechanism
- Fallback is transparent — logged but never breaks agent flow
- WhatsApp events are bridged to agent via clean event emitter pattern
