# TASK.md — whatsapp-agent

## Overview
A standalone WhatsApp AI agent built with Bun.js, designed to run inside OpenClaw and leverage OpenClaw's native OpenCode model routing and provider abstraction. No custom LLM transport — uses OpenClaw/OpenCode's SDK conventions directly.

## Architecture
```
src/
├── core/agent/
│   └── agents.ts          # AI agent logic, provider-agnostic, dynamically binds to resolved model
├── providers/opencode/
│   ├── client.ts           # OpenCode model invocation using native patterns
│   └── resolver.ts         # getActiveModel() — resolves model via OpenClaw, handles fallback
├── integrations/whatsapp/
│   ├── connection.ts       # WhatsApp session bootstrap, QR auth, reconnection
│   └── events.ts           # Message event listeners, event bridge
├── config/
│   ├── env.ts              # Environment validation (.env parsing)
│   └── settings.ts         # App configuration constants
├── utils/
│   ├── logger.ts           # Structured debug logging
│   └── errors.ts           # Async-safe error handling utilities
└── main.ts                 # Entry point — wires WhatsApp events → AI agent
```

## Phases

### Phase 1: Scaffolding
- [ ] Initialize Bun project
- [ ] Create folder structure (src/core/agent, src/providers/opencode, src/integrations/whatsapp, src/config, src/utils)
- [ ] Set up .gitignore (node_modules, .env, auth_info, *.log)
- [ ] Create tsconfig.json for Bun
- [ ] Create .env.example
- [ ] Create config/env.ts — environment validation
- [ ] Create config/settings.ts — app constants
- [ ] Create utils/logger.ts — structured logging
- [ ] Create utils/errors.ts — error handling utilities
- [ ] Commit: `chore: initialize bun project with modular architecture`

### Phase 2: OpenClaw/OpenCode Provider Integration
- [ ] Create providers/opencode/client.ts — model invocation using OpenCode's native patterns
- [ ] Create providers/opencode/resolver.ts — getActiveModel() using OpenClaw's model selection
- [ ] Default to Kimi K2.5 via Zen provider
- [ ] Automatic fallback to best available free model if Kimi unavailable
- [ ] Log fallback events without breaking agent logic
- [ ] Commit: `feat: integrate opencode model invocation`

### Phase 3: WhatsApp Integration
- [ ] Install @whiskeysockets/baileys
- [ ] Create integrations/whatsapp/connection.ts — session bootstrap, QR auth, credential storage, reconnection
- [ ] Create integrations/whatsapp/events.ts — message event listeners, event bridge
- [ ] Bun runtime compatible
- [ ] Commit: `feat: add whatsapp event bridge`

### Phase 4: Agent Binding
- [ ] Create core/agent/agents.ts — AI agent that dynamically binds to resolved model
- [ ] Provider-agnostic agent behavior
- [ ] Conversation context management per chat
- [ ] Create main.ts — entry point wiring WhatsApp events → agent
- [ ] Commit: `feat: bind agent to opencode-resolved model`

### Phase 5: Fallback + Resilience
- [ ] Implement automatic model fallback using OpenCode resolver
- [ ] Retry logic with exponential backoff
- [ ] Graceful degradation on provider failures
- [ ] Rate limiting per user
- [ ] Commit: `feat: implement automatic model fallback using opencode`

### Phase 6: Production Hardening
- [ ] Graceful shutdown handling (SIGINT, SIGTERM)
- [ ] Structured error boundaries
- [ ] Config validation on startup
- [ ] Comprehensive README.md (setup, OpenClaw compatibility, model resolution, fallback behavior)
- [ ] Commit: `refactor: isolate config validation` + `docs: document openclaw integration`
