import Chatbot from "../models/Chatbot.js";
import User from "../models/User.js";
import { crawlSite } from "../services/crawlService.js";
import { encryptBotId } from "../utils/embedToken.js";
import { getAIResponse } from "../services/aiService.js";
import { getChatbotLimit } from "../middleware/subscriptionMiddleware.js";

async function generateQuickReplies(text) {
  try {
    const snippet = text.slice(0, 4000);
    const reply = await getAIResponse(
      [{
        role: "user",
        content:
          "Based on the website content below, generate exactly 5 short questions a visitor would commonly ask. " +
          "Return ONLY a valid JSON array of strings, no explanation, no markdown. " +
          'Example: ["What services do you offer?","How do I contact you?"]\n\nContent:\n' + snippet,
      }],
      ""
    );
    const match = reply.match(/\[[\s\S]*?\]/);
    if (match) {
      const arr = JSON.parse(match[0]);
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.slice(0, 5).map((q) => ({ question: String(q), answer: "" }));
      }
    }
  } catch (e) {
    console.warn("Quick reply generation failed:", e.message);
  }
  return [];
}

const normalizeDomain = (d) =>
  d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase().trim();

const isDomainAllowed = (allowedDomains, requestDomain) => {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  if (!requestDomain) return false;
  const req = normalizeDomain(requestDomain);
  return allowedDomains.some((d) => normalizeDomain(d) === req);
};

export const getChatbots = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const query = isAdmin ? {} : { userId: req.user.id };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    let q = Chatbot.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    if (isAdmin) q = q.populate("userId", "name email");

    const [chatbots, total] = await Promise.all([q, Chatbot.countDocuments(query)]);

    res.json({ chatbots, total, page, hasMore: skip + chatbots.length < total });
  } catch {
    res.status(500).json({ error: "Failed to fetch chatbots" });
  }
};

export const createChatbot = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: "User not found" });
    
    // Use plan-based limit with admin extra allocation
    const { totalLimit, planKey } = await getChatbotLimit(req.user.id);
    const count = await Chatbot.countDocuments({ userId: req.user.id });
    
    if (count >= totalLimit) {
      return res.status(403).json({
        error: `You've reached your limit of ${totalLimit} chatbot${totalLimit !== 1 ? "s" : ""}. Please upgrade your plan to create more.`,
        limitReached: true,
        limit: totalLimit,
        count,
        planKey,
      });
    }
    const chatbot = await Chatbot.create({ ...req.body, userId: req.user.id });
    res.status(201).json(chatbot);
  } catch {
    res.status(500).json({ error: "Failed to create chatbot" });
  }
};

export const getChatbot = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const filter = isAdmin ? { _id: req.params.id } : { _id: req.params.id, userId: req.user.id };
    const chatbot = await Chatbot.findOne(filter);
    if (!chatbot) return res.status(404).json({ error: "Not found" });
    res.json(chatbot);
  } catch {
    res.status(500).json({ error: "Failed to fetch chatbot" });
  }
};

export const updateChatbot = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const filter = isAdmin ? { _id: req.params.id } : { _id: req.params.id, userId: req.user.id };

    const updateBody = { ...req.body };
    if (!isAdmin && "botIconUrl" in updateBody) {
      const owner = await User.findById(req.user.id).select("canChangeIcon");
      if (!owner?.canChangeIcon) delete updateBody.botIconUrl;
    }

    const chatbot = await Chatbot.findOneAndUpdate(filter, { $set: updateBody }, { new: true, runValidators: false });
    if (!chatbot) return res.status(404).json({ error: "Not found" });
    res.json(chatbot);
  } catch (err) {
    console.error("updateChatbot error:", err.message);
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

export const crawlChatbotSite = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const chatbot = await Chatbot.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chatbot) return res.status(404).json({ error: "Not found" });

    const result = await crawlSite(url);

    // Append crawled text and record the source
    const newKnowledge = chatbot.knowledgeBase
      ? chatbot.knowledgeBase + "\n\n" + result.text
      : result.text;

    const source = { url, pages: result.pages, siteName: result.siteName, crawledAt: new Date() };

    // Generate quick replies from crawled content (runs in parallel with save)
    const quickReplies = await generateQuickReplies(result.text);

    await Chatbot.findByIdAndUpdate(req.params.id, {
      $set: {
        knowledgeBase: newKnowledge,
        ...(quickReplies.length > 0 && { quickReplies }),
      },
      $push: { crawledSources: source },
    });

    res.json({ pages: result.pages, siteName: result.siteName, source, quickReplies });
  } catch (error) {
    console.error("Crawl error:", error.message);
    res.status(500).json({ error: error.message || "Failed to crawl website" });
  }
};

export const clearCrawledData = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { knowledgeBase: "", crawledSources: [] } },
      { new: true }
    );
    if (!chatbot) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to clear crawled data" });
  }
};

export const getEmbedToken = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({ _id: req.params.id, userId: req.user.id });
    if (!chatbot) return res.status(404).json({ error: "Not found" });
    const token = encryptBotId(req.params.id);
    res.json({ token });
  } catch (err) {
    console.error("Embed token error:", err.message);
    res.status(500).json({ error: "Failed to generate embed token" });
  }
};

export const getPublicChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.findById(req.params.id);
    if (!chatbot) return res.status(404).json({ error: "Not found" });

    if (!isDomainAllowed(chatbot.allowedDomains, req.query.domain)) {
      return res.status(403).json({ error: "Domain not allowed" });
    }

    // Hide widget entirely if owner's account is suspended or trial expired
    const TRIAL_MS = 14 * 24 * 60 * 60 * 1000;
    const owner = await User.findById(chatbot.userId).select("isSuspended role adminActivated createdAt");
    if (owner) {
      const trialExpired = owner.role === "user" && !owner.adminActivated &&
        Date.now() > new Date(owner.createdAt).getTime() + TRIAL_MS;
      if (owner.isSuspended || trialExpired) {
        return res.status(403).json({ error: "Chatbot unavailable" });
      }
    }

    const { userId: _uid, ...publicData } = chatbot.toObject();
    res.json(publicData);
  } catch {
    res.status(500).json({ error: "Failed to fetch chatbot" });
  }
};
