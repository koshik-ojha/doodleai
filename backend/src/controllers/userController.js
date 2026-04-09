import User from "../models/User.js";
import Chat from "../models/Chat.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    const chatCounts = await Chat.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);
    const chatMap = {};
    chatCounts.forEach((c) => { chatMap[c._id.toString()] = c.count; });

    const result = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      chats: chatMap[u._id.toString()] || 0
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
