import Chatbot from "../models/Chatbot.js";
import { crawlSite } from "../services/crawlService.js";
import { encryptBotId } from "../utils/embedToken.js";
import { getAIResponse } from "../services/aiService.js";

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

    const [chatbots, total] = await Promise.all([
      Chatbot.find(query)
        .populate(isAdmin ? { path: "userId", select: "name email" } : "")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Chatbot.countDocuments(query),
    ]);

    res.json({ chatbots, total, page, hasMore: skip + chatbots.length < total });
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
      { knowledgeBase: "", crawledSources: [] },
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
    const chatbot = await Chatbot.findById(req.params.id).select("-userId");
    if (!chatbot) return res.status(404).json({ error: "Not found" });

    if (!isDomainAllowed(chatbot.allowedDomains, req.query.domain)) {
      return res.status(403).json({ error: "Domain not allowed" });
    }

    res.json(chatbot);
  } catch {
    res.status(500).json({ error: "Failed to fetch chatbot" });
  }
};
