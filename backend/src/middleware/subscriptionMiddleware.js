import Subscription from "../models/Subscription.js";
import Chatbot from "../models/Chatbot.js";
import User from "../models/User.js";

export const checkChatbotLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("role maxChatbots forceAllocatedChatbots");
    if (!user) return res.status(401).json({ error: "User not found" });

    if (user.role === "admin") return next();

    // If admin force-allocated a specific limit, use it directly (admin override).
    // Otherwise, use the subscription's plan limit (ignoring user.maxChatbots).
    let limit;
    if (user.forceAllocatedChatbots) {
      // Admin override - use admin-set limit
      limit = user.maxChatbots;
    } else {
      // Plan-based - check for active or authenticated subscription
      const sub = await Subscription.findOne({ userId, status: { $in: ["active", "authenticated"] } });
      limit = sub ? sub.chatbotLimit : 1; // Default trial limit is 1 if no subscription
    }
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
