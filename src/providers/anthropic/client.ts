import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';

export interface AnthropicClientInterface {
  sendMessage: (message: string, model?: string) => Promise<string>;
}

export class AnthropicClient implements AnthropicClientInterface {
  private client: Anthropic;
  private readonly defaultModel: string;

  constructor(apiKey: string, defaultModel: string) {
    this.client = new Anthropic({ apiKey });
    this.defaultModel = defaultModel;
  }

  async sendMessage(message: string, model?: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    const useModel = model || this.defaultModel;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: useModel,
          max_tokens: 4096,
          messages: [{ role: 'user', content: message }],
        });

        const textBlock = response.content.find((block) => block.type === 'text');
        if (textBlock && textBlock.type === 'text') {
          return textBlock.text;
        }

        return '';
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Anthropic attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new AppError(`Anthropic request failed after ${maxRetries} attempts: ${lastError}`);
  }
}

export const createAnthropicClient = (apiKey: string, model: string): AnthropicClientInterface => {
  return new AnthropicClient(apiKey, model);
};
