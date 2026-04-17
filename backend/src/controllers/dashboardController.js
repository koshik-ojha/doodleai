import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Chatbot from "../models/Chatbot.js";

export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    const [totalChats, totalMessages, totalUsers, formSubmissions, totalChatbots, recentMessages] = await Promise.all([
      Chat.countDocuments(isAdmin ? {} : { userId }),
      Message.countDocuments(),
      User.countDocuments(),
      Submission.countDocuments(isAdmin ? {} : { botId: { $in: await Chatbot.find({ userId }).distinct("_id") } }),
      Chatbot.countDocuments({ userId }),
      Message.find({ role: "user" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({ path: "chatId", select: "title userId" })
    ]);

    const responseRate = totalMessages > 0
      ? Math.round((await Message.countDocuments({ role: "assistant" }) / totalMessages) * 100)
      : 0;

    const recentActivity = recentMessages.map((msg) => ({
      _id: msg._id,
      content: msg.content,
      chatTitle: msg.chatId?.title || "Chat",
      createdAt: msg.createdAt
    }));

    res.json({ totalChats, totalMessages, totalUsers, formSubmissions, totalChatbots, responseRate: `${responseRate}%`, recentActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
