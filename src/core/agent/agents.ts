import { logger } from '../../utils/logger';
import { createOpenCodeClient } from '../../providers/opencode/client';
import { getActiveModel } from '../../providers/opencode/resolver';
import { settings } from '../../config/settings';

export interface Agent {
  processMessage: (chatId: string, text: string) => Promise<string>;
}

export const createAgent = (): Agent => {
  const client = createOpenCodeClient(settings.DEFAULT_MODEL);

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
      history.push({
        role: 'user',
        content: text
      });

      // Limit history to MAX_HISTORY messages
      if (history.length > settings.MAX_HISTORY) {
        history.splice(0, history.length - settings.MAX_HISTORY);
      }

      // Prepare messages for model
      const messages = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get active model
      const model = await getActiveModel();
      if (!model) {
        throw new Error('No available model found');
      }

      logger.info('Processing message with model:', model);

      // Call the model
      const response = await client.sendMessage(text, model);

      // Add assistant response to history
      history.push({
        role: 'assistant',
        content: response
      });

      return response;

    } catch (error) {
      logger.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  };

  return { processMessage };
};