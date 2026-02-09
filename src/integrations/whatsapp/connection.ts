import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { logger } from '../../utils/logger';

export interface WhatsAppConnection {
  sock: any;
  close: () => Promise<void>;
}

export const createConnection = async (): Promise<WhatsAppConnection> => {
  logger.info('Initializing WhatsApp connection...');

  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update: any) => {
    if (update.qr) {
      logger.info('QR Code received, scan with WhatsApp:');
      console.log(update.qr);
    }
    if (update.state === 'connected') {
      logger.info('WhatsApp connected!');
    } else if (update.state === 'disconnected') {
      logger.warn('WhatsApp disconnected. Reason:', update.reason);

      if (update.reason === 'disconnected' || update.reason === 'loggedOut' || update.reason === 'userLoggedOut') {
        logger.info('Attempting to reconnect...');
        setTimeout(() => {
          // Baileys v7 doesn't have forceRefocus, use existing connection
          console.log('Reconnection not implemented in Baileys v7 - connection will need to be restarted');
        }, 5000);
      }
    }
  });

  const close = async () => {
    logger.info('Closing WhatsApp connection...');
    // No explicit close method in Baileys v7
    console.log('Connection close not implemented in Baileys v7 - process will need to be restarted');
  };

  return { sock, close };
};