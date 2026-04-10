import Chatbot from "../models/Chatbot.js";
import { crawlSite } from "../services/crawlService.js";

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
    const chatbots = await Chatbot.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(chatbots);
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

    await Chatbot.findByIdAndUpdate(req.params.id, {
      knowledgeBase: newKnowledge,
      $push: { crawledSources: source },
    });

    res.json({ pages: result.pages, siteName: result.siteName, source });
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
