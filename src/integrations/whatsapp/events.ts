import { logger } from '../../utils/logger';

export interface Message {
  id: string;
  from: string;
  text: string;
}

export interface WhatsAppEventBridge {
  start: (sock: any, callback: (message: Message) => void) => void;
  stop: () => void;
}

export const createEventBridge = (): WhatsAppEventBridge => {
  let isRunning = false;

  const start = (sock: any, callback: (message: Message) => void) => {
    if (isRunning) {
      logger.warn('Event bridge already running');
      return;
    }

    isRunning = true;

    sock.ev.on('messages.upsert', ({ messages }: any) => {
      if (!isRunning) return;

      for (const message of messages) {
        if (message.key.fromMe) {
          continue; // Skip own messages
        }

        try {
          let text = '';
          
          if (message.message.conversation) {
            text = message.message.conversation;
          } else if (message.message.extendedTextMessage) {
            text = message.message.extendedTextMessage.text;
          }

          if (text.trim()) {
            const msg: Message = {
              id: message.key.id,
              from: message.key.remoteJid,
              text: text.trim()
            };
            
            callback(msg);
          }
        } catch (error) {
          logger.error('Error processing message:', error);
        }
      }
    });

    logger.info('WhatsApp event bridge started');
  };

  const stop = () => {
    isRunning = false;
    logger.info('WhatsApp event bridge stopped');
  };

  return { start, stop };
};