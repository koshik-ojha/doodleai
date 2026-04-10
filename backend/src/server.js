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

dotenv.config();

const app = express();

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

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));