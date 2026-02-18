import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import { logger } from "../../utils/logger"

export interface WhatsAppConnection {
  sock: any
  close: () => Promise<void>
}

/* =========================
   Global State
========================= */

let latestQR: string | null = null
let isConnected = false

export const getLatestQR = () => latestQR
export const getConnectionStatus = () => isConnected

/* =========================
   Create Connection
========================= */

export const createConnection = async (): Promise<WhatsAppConnection> => {
  logger.info("Initializing WhatsApp connection...")

  const { state, saveCreds } = await useMultiFileAuthState("auth_info")

  const sock = makeWASocket({
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update: any) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      latestQR = qr
      isConnected = false
      logger.info("QR generated")
    }

    if (connection === "open") {
      latestQR = null
      isConnected = true
      logger.info("WhatsApp connected successfully!")
    }
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as any)?.output?.statusCode !==
        DisconnectReason.loggedOut
    
      if (!shouldReconnect) {
        isConnected = false
      }
    }
  })

  const close = async () => {
    logger.info("Closing WhatsApp connection...")
    process.exit(0)
  }

  return { sock, close }
}