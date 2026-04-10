import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { getAIResponse } from "../services/aiService.js";

export const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({ userId: req.user.id, title: "New Chat" });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to create chat" });
  }
};

export const getChats = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const query = isAdmin ? {} : { userId: req.user.id };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 15);
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      Chat.find(query)
        .populate(isAdmin ? { path: "userId", select: "name email" } : "")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Chat.countDocuments(query),
    ]);

    const chatIds = chats.map((c) => c._id);
    const msgCounts = await Message.aggregate([
      { $match: { chatId: { $in: chatIds } } },
      { $group: { _id: "$chatId", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    msgCounts.forEach((m) => { countMap[m._id.toString()] = m.count; });

    const result = chats.map((c) => ({
      ...c.toObject(),
      messageCount: countMap[c._id.toString()] || 0,
    }));

    res.json({ chats: result, total, page, hasMore: skip + result.length < total });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const renameChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: req.user.id },
      { title },
      { new: true }
    );
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to rename chat" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.deleteOne({ _id: chatId, userId: req.user.id });
    await Message.deleteMany({ chatId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete chat" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });

    const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    await Message.create({ chatId, role: "user", content: message });

    const count = await Message.countDocuments({ chatId });
    if (count === 1 && chat.title === "New Chat") {
      chat.title = message.slice(0, 40);
      await chat.save();
    }

    const history = await Message.find({ chatId }).sort({ createdAt: 1 });
    const formatted = history.map(msg => ({ role: msg.role, content: msg.content }));

    const aiReply = await getAIResponse(formatted);

    const assistantMessage = await Message.create({
      chatId,
      role: "assistant",
      content: aiReply
    });

    res.json({ success: true, reply: assistantMessage });
  } catch (error) {
    const detail = error.response?.data || error.message;
    console.error("AI response error:", JSON.stringify(detail, null, 2));
    res.status(500).json({ error: "Failed to get AI response", detail });
  }
};
