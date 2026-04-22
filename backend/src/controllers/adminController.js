import User from "../models/User.js";
import Chatbot from "../models/Chatbot.js";
import { clearSuspensionCache } from "../middleware/authMiddleware.js";

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
      { $set: { isSuspended: false, adminActivated: true } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    // Immediately evict from suspension cache so the user regains access
    clearSuspensionCache(req.params.id);
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ error: "Failed to reactivate user" });
  }
};

export const updateIconPermission = async (req, res) => {
  try {
    const { canChangeIcon } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: { $ne: "admin" } },
      { $set: { canChangeIcon: !!canChangeIcon } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ error: "Failed to update icon permission" });
  }
};

export const updateChatbotLimit = async (req, res) => {
  try {
    const maxChatbots = parseInt(req.body.maxChatbots);
    if (isNaN(maxChatbots) || maxChatbots < 0) {
      return res.status(400).json({ error: "Invalid limit value" });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: { $ne: "admin" } },
      { $set: { maxChatbots } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ error: "Failed to update chatbot limit" });
  }
};

