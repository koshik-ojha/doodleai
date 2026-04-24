import Subscription from "../models/Subscription.js";
import Chatbot from "../models/Chatbot.js";
import User from "../models/User.js";

/**
 * Calculate the effective chatbot limit for a user.
 * Limit = Plan Limit + Admin Extra Allocation (if any)
 * - Starter Plan: 1 chatbot
 * - Growth Plan: 3 chatbots
 * - Professional Plan: 5 chatbots
 * - Trial (no subscription): 1 chatbot
 */
export const getChatbotLimit = async (userId) => {
  const user = await User.findById(userId).select("extraChatbotAllocation");
  const extraAllocation = user?.extraChatbotAllocation || 0;
  
  const sub = await Subscription.findOne({ userId, status: { $in: ["active", "authenticated"] } });
  const planLimit = sub ? sub.chatbotLimit : 1; // Default trial limit is 1
  const planKey = sub ? sub.planKey : "trial";
  
  return {
    planLimit,
    extraAllocation,
    totalLimit: planLimit + extraAllocation,
    planKey,
  };
};

export const checkChatbotLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("role extraChatbotAllocation");
    if (!user) return res.status(401).json({ error: "User not found" });

    if (user.role === "admin") return next();

    // Calculate limit: Plan Limit + Extra Allocation (admin override)
    const { totalLimit, planKey } = await getChatbotLimit(userId);
    const count = await Chatbot.countDocuments({ userId });

    if (count >= totalLimit) {
      return res.status(403).json({
        error: `Your ${planKey} plan allows ${totalLimit} chatbot(s). Upgrade your plan to create more.`,
        limitReached: true,
        limit: totalLimit,
        count,
      });
    }

    next();
  } catch (err) {
    console.error("Chatbot limit check error:", err.message);
    res.status(500).json({ error: "Failed to check chatbot limit" });
  }
};
