import User from "../models/User.js";
import Chatbot from "../models/Chatbot.js";

export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 15);
    const skip = (page - 1) * limit;
    const filter = { role: { $ne: "admin" } };

    const [users, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page, hasMore: skip + users.length < total });
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getAllChatbots = async (req, res) => {
  try {
    const chatbots = await Chatbot.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(chatbots);
  } catch {
    res.status(500).json({ error: "Failed to fetch chatbots" });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: { $ne: "admin" } },
      { $set: { isSuspended: true } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ error: "Failed to suspend user" });
  }
};

export const reactivateUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: { $ne: "admin" } },
      { $set: { isSuspended: false } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ error: "Failed to reactivate user" });
  }
};

