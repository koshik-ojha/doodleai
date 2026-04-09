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

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

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
