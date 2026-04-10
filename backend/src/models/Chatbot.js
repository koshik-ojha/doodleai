import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const chatbotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, default: "My Chatbot" },
  botName: { type: String, default: "Support Assistant" },
  welcomeMessage: { type: String, default: "Hello! How can I help you today?" },
  primaryColor: { type: String, default: "#7c3aed" },
  position: { type: String, default: "bottom-right" },
  autoOpen: { type: Boolean, default: false },
  whatsappNumber: { type: String, default: "" },
  knowledgeBase: { type: String, default: "" },
  faqs: [faqSchema],
  quickReplies: [{ question: { type: String, required: true }, answer: { type: String, default: "" } }],
  isActive: { type: Boolean, default: true },
  allowedDomains: [{ type: String }],
  crawledSources: [{
    url: { type: String },
    pages: { type: Number },
    siteName: { type: String },
    crawledAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.model("Chatbot", chatbotSchema);
