import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import { logger } from '../../utils/logger'

export interface WhatsAppConnection {
  sock: any
  close: () => Promise<void>
}

export const createConnection = async (): Promise<WhatsAppConnection> => {
  logger.info('Initializing WhatsApp connection...')

  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state
    // ❌ removed printQRInTerminal
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update: any) => {
    const { connection, lastDisconnect, qr } = update

    // ✅ Proper QR rendering
    if (qr) {
      logger.info('QR Code received. Scan with WhatsApp:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      logger.info('WhatsApp connected successfully!')
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as any)?.output?.statusCode !==
        DisconnectReason.loggedOut

      logger.warn('Connection closed. Reconnecting:', shouldReconnect)

      if (shouldReconnect) {
        createConnection()
      } else {
        logger.error('Logged out. Delete auth_info folder and restart.')
      }
    }
  })

  const close = async () => {
    logger.info('Closing WhatsApp connection...')
    process.exit(0)
  }

  return { sock, close }
}