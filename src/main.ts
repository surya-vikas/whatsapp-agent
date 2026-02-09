#!/usr/bin/env bun

import { createConnection } from './integrations/whatsapp/connection';
import { createEventBridge } from './integrations/whatsapp/events';
import { createAgent } from './core/agent/agents';
import { logger } from './utils/logger';

const main = async () => {
  logger.info('Starting WhatsApp Agent...');

  try {
    // Create WhatsApp connection
    const { sock } = await createConnection();
    
    // Create agent (single instance to maintain conversation history)
    const agent = createAgent();

    // Create event bridge
    const eventBridge = createEventBridge();
    eventBridge.start(sock, async (message) => {
      try {
        const response = await agent.processMessage(message.from, message.text);
        
        // Send response back via WhatsApp (Baileys v7 format)
        await sock.sendMessage(message.from, { text: response });
        
        logger.info('Sent response to:', message.from);
      } catch (error) {
        logger.error('Error processing message from:', message.from, error);
      }
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down...');
      eventBridge.stop();
      await sock.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    logger.info('WhatsApp Agent is running...');

  } catch (error) {
    logger.error('Failed to start WhatsApp Agent:', error);
    process.exit(1);
  }
};

main();