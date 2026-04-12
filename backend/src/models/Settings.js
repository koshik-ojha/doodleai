import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  // Chatbot
  botName: { type: String, default: "Support Assistant" },
  welcomeMessage: { type: String, default: "Hello! How can I help you today?" },
  responseDelay: { type: String, default: "instant" },
  language: { type: String, default: "english" },
  // Widget appearance
  position: { type: String, default: "bottom-right" },
  primaryColor: { type: String, default: "#7c3aed" },
  autoOpen: { type: Boolean, default: false },
  // Notifications
  emailNotifications: { type: Boolean, default: true },
  chatAlerts: { type: Boolean, default: true },
  weeklyReports: { type: Boolean, default: false },
  // Telegram Integration
  telegramBotToken: { type: String, default: "" },
  telegramChatId: { type: String, default: "" },
  // Security
  sessionTimeout: { type: String, default: "30" },
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
