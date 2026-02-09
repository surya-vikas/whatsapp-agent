export interface Config {
  inferenceProvider: 'openrouter' | 'anthropic';
  anthropicApiKey?: string;
  openrouterApiKey?: string;
}

const inferenceProvider = (process.env.INFERENCE_PROVIDER || 'openrouter').toLowerCase();

if (!['openrouter', 'anthropic'].includes(inferenceProvider)) {
  throw new Error(
    `Invalid INFERENCE_PROVIDER: "${inferenceProvider}". Must be 'openrouter' or 'anthropic'.`
  );
}

if (inferenceProvider === 'openrouter' && !process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is required when INFERENCE_PROVIDER=openrouter');
}

if (inferenceProvider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required when INFERENCE_PROVIDER=anthropic');
}

export const config: Config = {
  inferenceProvider: inferenceProvider as 'openrouter' | 'anthropic',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
};
