export interface Config {
  inferenceProvider: 'openrouter' | 'anthropic' | 'opencodezen' | 'mistral';
  anthropicApiKey?: string;
  openrouterApiKey?: string;
  opencodeApiKey?: string;
  mistralApiKey?: string;
}

const inferenceProvider = (process.env.INFERENCE_PROVIDER || 'openrouter').toLowerCase();

if (!['openrouter', 'anthropic', 'opencodezen', 'mistral'].includes(inferenceProvider)) {
  throw new Error(
    `Invalid INFERENCE_PROVIDER: "${inferenceProvider}". Must be 'openrouter', 'anthropic', 'opencodezen', or 'mistral'.`
  );
}

if (inferenceProvider === 'openrouter' && !process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is required when INFERENCE_PROVIDER=openrouter');
}

if (inferenceProvider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required when INFERENCE_PROVIDER=anthropic');
}

if (inferenceProvider === 'opencodezen' && !process.env.OPENCODE_API_KEY) {
  throw new Error('OPENCODE_API_KEY is required when INFERENCE_PROVIDER=opencodezen');
}

if (inferenceProvider === 'mistral' && !process.env.MISTRAL_API_KEY) {
  throw new Error('MISTRAL_API_KEY is required when INFERENCE_PROVIDER=mistral');
}

export const config: Config = {
  inferenceProvider: inferenceProvider as 'openrouter' | 'anthropic' | 'opencodezen' | 'mistral',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  opencodeApiKey: process.env.OPENCODE_API_KEY,
  mistralApiKey: process.env.MISTRAL_API_KEY,
};