import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import QRCode from "qrcode"

import { createConnection } from "./integrations/whatsapp/connection"
import { createEventBridge } from "./integrations/whatsapp/events"
import { createAgent } from "./core/agent/agents"
import { logger } from "./utils/logger"
import authRoutes from "./routes/authRoutes"

import { getLatestQR } from "./integrations/whatsapp/connection"
import { getConnectionStatus } from "./integrations/whatsapp/connection"

dotenv.config()

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes)
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.send("Server working ✅")
})

/* =========================
   WhatsApp Status API
========================= */

app.get("/api/whatsapp/status", (req, res) => {
  res.json({ connected: getConnectionStatus() })
})

/* =========================
   QR API
========================= */

app.get("/api/qr", async (req, res) => {
  const qr = getLatestQR()

  if (!qr) {
    return res.json({ qr: null })
  }

  const qrImage = await QRCode.toDataURL(qr)
  res.json({ qr: qrImage })
})

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000")
})

/* =========================
   WhatsApp Agent Bootstrap
========================= */

const startAgent = async () => {
  logger.info("Starting WhatsApp Agent...")

  try {
    const { sock } = await createConnection()
    const agent = createAgent()
    const eventBridge = createEventBridge()

    eventBridge.start(sock, async (message) => {
      try {
        const response = await agent.processMessage(
          message.from,
          message.text
        )

        await sock.sendMessage(message.from, { text: response })
        logger.info("Sent response to:", message.from)
      } catch (error) {
        logger.error("Error processing message:", error)
      }
    })

    logger.info("WhatsApp Agent is running...")
  } catch (error) {
    logger.error("Failed to start agent:", error)
    process.exit(1)
  }
}

startAgent()