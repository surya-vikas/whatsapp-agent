import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { users } from "../models/User"

const router = Router()

// ======================
// SIGNUP
// ======================
router.post("/signup", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" })
  }

  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  users.push({
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    wa_connected: false
  })

  res.json({ message: "Signup successful" })
})


// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" })
  }

  const user = users.find(u => u.email === email)
  if (!user) {
    return res.status(400).json({ error: "User not found" })
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return res.status(400).json({ error: "Invalid password" })
  }

  const token = jwt.sign(
    { id: user.id },
    "secret",
    { expiresIn: "1d" }
  )

  res.json({ token })
})


// ======================
// GET CURRENT USER
// ======================
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" })
  }

  const parts = authHeader.split(" ")

  if (parts.length !== 2 || !parts[1]) {
    return res.status(401).json({ error: "Invalid auth format" })
  }

  const token: string = parts[1]

  try {
    const decoded = jwt.verify(token, "secret")

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("id" in decoded)
    ) {
      return res.status(401).json({ error: "Invalid token structure" })
    }

    const user = users.find(u => u.id === (decoded as any).id)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      email: user.email,
      wa_connected: user.wa_connected
    })

  } catch {
    res.status(401).json({ error: "Invalid token" })
  }
})

export default router