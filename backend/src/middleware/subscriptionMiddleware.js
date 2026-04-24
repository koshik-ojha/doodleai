import Subscription from "../models/Subscription.js";
import Chatbot from "../models/Chatbot.js";
import User from "../models/User.js";

export const checkChatbotLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("role maxChatbots");
    if (!user) return res.status(401).json({ error: "User not found" });

    if (user.role === "admin") return next();

    const sub = await Subscription.findOne({ userId, status: "active" });
    const limit = sub ? sub.chatbotLimit : user.maxChatbots;
    const count = await Chatbot.countDocuments({ userId });

    if (count >= limit) {
      return res.status(403).json({
        error: `Your ${sub ? sub.planKey : "trial"} plan allows ${limit} chatbot(s). Upgrade your plan to create more.`,
        limitReached: true,
        limit,
        count,
      });
    }

    next();
  } catch (err) {
    console.error("Chatbot limit check error:", err.message);
    res.status(500).json({ error: "Failed to check chatbot limit" });
  }
};
