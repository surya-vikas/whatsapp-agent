export const settings = {
  BOT_NAME: process.env.BOT_NAME || 'WhatsApp Agent',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // OpenRouter models (used via OpenCode CLI)
  DEFAULT_MODEL: 'openrouter/moonshotai/kimi-k2.5',
  FALLBACK_MODEL: 'openrouter/arcee-ai/trinity-large-preview:free',

  // Anthropic model (used via SDK directly)
  ANTHROPIC_DEFAULT_MODEL: 'claude-sonnet-4-20250514',

  // Conversation limits
  MAX_HISTORY: 20,
};
