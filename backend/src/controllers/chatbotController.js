import Chatbot from "../models/Chatbot.js";

export const getChatbots = async (req, res) => {
  try {
    const chatbots = await Chatbot.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(chatbots);
  } catch {
    res.status(500).json({ error: "Failed to fetch chatbots" });
  }
};

export const createChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.create({ ...req.body, userId: req.user.id });
    res.status(201).json(chatbot);
  } catch {
    res.status(500).json({ error: "Failed to create chatbot" });
  }
};

export const getChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chatbot) return res.status(404).json({ error: "Not found" });
    res.json(chatbot);
  } catch {
    res.status(500).json({ error: "Failed to fetch chatbot" });
  }
};

export const updateChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!chatbot) return res.status(404).json({ error: "Not found" });
    res.json(chatbot);
  } catch {
    res.status(500).json({ error: "Failed to update chatbot" });
  }
};

export const deleteChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!chatbot) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete chatbot" });
  }
};

export const getPublicChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.findById(req.params.id).select("-userId");
    if (!chatbot) return res.status(404).json({ error: "Not found" });
    res.json(chatbot);
  } catch {
    res.status(500).json({ error: "Failed to fetch chatbot" });
  }
};
