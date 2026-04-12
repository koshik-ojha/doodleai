import mongoose from "mongoose";

// Singleton document — only one row ever exists (key: "global")
const siteConfigSchema = new mongoose.Schema({
  key: { type: String, default: "global", unique: true },
  landingBotId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatbot", default: null },
}, { timestamps: true });

export default mongoose.model("SiteConfig", siteConfigSchema);
