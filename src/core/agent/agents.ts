import { logger } from '../../utils/logger';
import { createOpenCodeClient } from '../../providers/opencode/client';
import { createAnthropicClient } from '../../providers/anthropic/client';
import { getActiveModel } from '../../providers/opencode/resolver';
import { config } from '../../config/env';
import { settings } from '../../config/settings';

// Import new clients
import { infer as opencodeZenInfer } from '../../providers/opencodezen/client';
import { infer as mistralInfer } from '../../providers/mistral/client';

export interface Agent {
  processMessage: (chatId: string, text: string) => Promise<string>;
}

export const createAgent = (): Agent => {
  // Create the right client based on provider selection
  let client: any;

  if (config.inferenceProvider === 'anthropic') {
    client = createAnthropicClient(config.anthropicApiKey!, settings.ANTHROPIC_DEFAULT_MODEL);
  } else if (config.inferenceProvider === 'openrouter') {
    client = createOpenCodeClient(settings.DEFAULT_MODEL);
  } else if (config.inferenceProvider === 'opencodezen') {
    // For opencodezen, we use direct infer function
  } else if (config.inferenceProvider === 'mistral') {
    // For mistral, we use direct infer function
  }

  const conversations = new Map<string, Array<{
    role: 'user' | 'assistant';
    content: string;
  }>>();

  const processMessage = async (chatId: string, text: string): Promise<string> => {
    try {
      if (!conversations.has(chatId)) {
        conversations.set(chatId, []);
      }

      const history = conversations.get(chatId)!;

      // Add user message to history
      history.push({ role: 'user', content: text });

      // Limit history
      if (history.length > settings.MAX_HISTORY) {
        history.splice(0, history.length - settings.MAX_HISTORY);
      }

      let response: string;

      if (config.inferenceProvider === 'anthropic') {
        // Anthropic: use SDK directly
        response = await client.sendMessage(text);
      } else if (config.inferenceProvider === 'openrouter') {
        // OpenRouter: resolve model via OpenCode
        const model = await getActiveModel();
        logger.info('Using model:', model);
        response = await client.sendMessage(text, model);
      } else if (config.inferenceProvider === 'opencodezen') {
        // OpenCode Zen: use direct infer
        response = await opencodeZenInfer(text);
      } else if (config.inferenceProvider === 'mistral') {
        // Mistral: use direct infer
        response = await mistralInfer(text);
      } else {
        throw new Error('Unsupported inference provider');
      }

      // Add assistant response to history
      history.push({ role: 'assistant', content: response });

      return response;
    } catch (error) {
      logger.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  };

  return { processMessage };
};