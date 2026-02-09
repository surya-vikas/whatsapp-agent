# WhatsApp Agent

A standalone WhatsApp AI agent built with **Bun.js**, designed to run inside **OpenClaw** and leverage OpenCode's native model routing.

## Setup

### Prerequisites
- [Bun](https://bun.sh) installed
- [OpenCode](https://opencode.ai) installed and configured
- OpenRouter API key (free tier works)

### Install

```bash
cd whatsapp-agent
bun install
```

### Configure

```bash
# Set your OpenRouter API key
export OPENROUTER_API_KEY="sk-or-..."
```

### Run

```bash
# Production
bun run start

# Development (auto-reload)
bun run dev
```

On first run, scan the QR code in terminal with WhatsApp to authenticate.

## Architecture

```
src/
├── core/agent/agents.ts           # AI agent — provider-agnostic, manages conversation history
├── providers/opencode/
│   ├── client.ts                   # OpenCode CLI invocation wrapper
│   └── resolver.ts                 # Model resolver with automatic fallback
├── integrations/whatsapp/
│   ├── connection.ts               # Baileys v7 connection, QR auth, reconnection
│   └── events.ts                   # Message event bridge
├── config/
│   ├── env.ts                      # Environment validation
│   └── settings.ts                 # App constants
├── utils/
│   ├── logger.ts                   # Structured logging
│   └── errors.ts                   # Error handling utilities
└── main.ts                         # Entry point
```

## Model Resolution

- **Default:** `openrouter/moonshotai/kimi-k2.5` (Kimi K2.5 via OpenRouter)
- **Fallback:** `openrouter/arcee-ai/trinity-large-preview:free` (free)

The resolver automatically tests the preferred model and falls back if unavailable. All fallback events are logged.

## How It Works

1. WhatsApp message received via Baileys
2. Event bridge extracts text and routes to agent
3. Agent maintains conversation history per chat
4. Agent invokes OpenCode CLI with the resolved model
5. Response sent back to WhatsApp

## OpenClaw Compatibility

This project is designed to run inside OpenClaw's environment:
- Uses `opencode run -m <model>` for model invocation (no custom HTTP)
- Respects OpenClaw's provider abstraction
- Environment variables managed via OpenClaw's config

## Error Handling

- Retry with exponential backoff (3 attempts)
- Graceful shutdown on SIGINT/SIGTERM
- Structured logging at all levels
- Conversation history limited to 20 messages per chat

## License

MIT
