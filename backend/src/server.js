import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import widgetRoutes from "./routes/widgetRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const app = express();

// Trust reverse proxy (Render, Railway, Heroku, etc.) so rate limiting
// uses the real client IP from X-Forwarded-For instead of the proxy IP
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "https://doodleai-murex.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Single CORS middleware: open for public widget routes, restricted for everything else
app.use((req, res, next) => {
  const isPublic =
    req.path.startsWith("/api/widget") ||
    req.path.startsWith("/api/chatbots/public");

  if (isPublic) {
    cors({ origin: "*", credentials: false })(req, res, next);
  } else {
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })(req, res, next);
  }
});

app.use(express.json());

// Strict rate limit only on auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

async function seedAdmin() {
  const email = "admin@wedoodles.com";
  const existing = await User.findOne({ email });
  if (!existing) {
    const hashed = await bcrypt.hash("Wdinfotech@2k26", 10);
    await User.create({ name: "Admin", email, password: hashed, role: "admin" });
    console.log("Admin user created");
  } else if (existing.role !== "admin") {
    await User.updateOne({ email }, { role: "admin" });
    console.log("Admin role assigned to existing user");
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedAdmin();
  })
  .catch((err) => console.error("MongoDB error:", err.message));

app.get("/", (req, res) => {
  res.json({ success: true, message: "AI Chatbot API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/widget", widgetRoutes);
app.use("/api/chatbots", chatbotRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));