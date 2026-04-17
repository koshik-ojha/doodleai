import Chatbot from "../models/Chatbot.js";
import { getAIResponse } from "../services/aiService.js";

const sessions = new Map();
const MAX_HISTORY = 10; // keep last 10 turns (5 pairs)
const KNOWLEDGE_CHAR_LIMIT = 5000; // safe for small context models

const FALLBACK_REPLY = "I'm sorry, I can only answer questions related to this service. For further help, please contact our support team.";

/**
 * Given a large knowledge base and the user's question, return only the
 * most relevant chunks — so we stay within the model's context window.
 */
function retrieveRelevant(knowledgeBase, query) {
  if (!knowledgeBase) return "";
  if (knowledgeBase.length <= KNOWLEDGE_CHAR_LIMIT) return knowledgeBase;

  // Split on page separators (from crawler) or blank lines
  const chunks = knowledgeBase
    .split(/(?=--- Page:)|\n{3,}/)
    .map((c) => c.trim())
    .filter((c) => c.length > 40);

  // Score each chunk by how many query words appear in it
  const queryWords = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);

  const scored = chunks.map((chunk) => {
    const lower = chunk.toLowerCase();
    const score = queryWords.reduce(
      (s, w) => s + (lower.includes(w) ? lower.split(w).length - 1 : 0),
      0
    );
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Fill up to KNOWLEDGE_CHAR_LIMIT, best matches first
  let result = "";
  for (const { chunk } of scored) {
    if (result.length + chunk.length + 2 > KNOWLEDGE_CHAR_LIMIT) break;
    result += chunk + "\n\n";
  }

  // If nothing matched (generic greeting etc.) include the first chunks
  if (!result.trim()) {
    result = chunks
      .slice(0, 6)
      .join("\n\n")
      .slice(0, KNOWLEDGE_CHAR_LIMIT);
  }

  return result.trim();
}

const buildSystemPrompt = (chatbot, userQuery = "") => {
  const hasKnowledge = chatbot.knowledgeBase?.trim() || chatbot.faqs?.length > 0;

  if (!hasKnowledge) {
    return `You are "${chatbot.botName}", a helpful assistant for this website. The knowledge base is currently empty. Politely let users know you don't have specific information yet and suggest they contact support directly.`;
  }

  let prompt = `You are "${chatbot.botName}", a helpful assistant. The KNOWLEDGE BASE below contains content from this website — use it to answer visitor questions accurately and naturally.\n\nIf the answer is in the knowledge base, answer it directly. If not covered, say you don't have that specific detail and suggest contacting support. Keep responses concise.\n\nKNOWLEDGE BASE:\n${"─".repeat(50)}\n`;

  if (chatbot.knowledgeBase?.trim()) {
    const relevant = retrieveRelevant(chatbot.knowledgeBase.trim(), userQuery);
    prompt += relevant + "\n\n";
  }

  if (chatbot.faqs?.length > 0) {
    prompt += `FAQs:\n`;
    chatbot.faqs.forEach((faq) => {
      prompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
    });
  }

  prompt += "─".repeat(50);
  return prompt;
};

const normalizeDomain = (d) =>
  d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase().trim();

export const widgetMessage = async (req, res) => {
  try {
    const { message, sessionId, botId, domain } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    let systemPrompt = `You are a customer support assistant. Only answer questions related to this service. For anything else, reply: "${FALLBACK_REPLY}"`;
    let chatbot = null;
    if (botId) {
      chatbot = await Chatbot.findById(botId).catch(() => null);
      if (chatbot) {
        if (domain && chatbot.allowedDomains?.length > 0) {
          const allowed = chatbot.allowedDomains.some((d) => normalizeDomain(d) === normalizeDomain(domain));
          if (!allowed) return res.status(403).json({ error: "Domain not allowed" });
        }
        systemPrompt = buildSystemPrompt(chatbot, message);
      }
    }

    const id = sessionId || crypto.randomUUID();
    let history = sessions.get(id) || [];
    history.push({ role: "user", content: message });

    // Keep only recent turns to stay within context limits
    if (history.length > MAX_HISTORY) {
      history = history.slice(history.length - MAX_HISTORY);
    }

    const aiReply = await getAIResponse(history, systemPrompt, chatbot);

    history.push({ role: "assistant", content: aiReply });
    sessions.set(id, history);

    if (sessions.size > 500) {
      const firstKey = sessions.keys().next().value;
      sessions.delete(firstKey);
    }

    res.json({ reply: aiReply, sessionId: id });
  } catch (error) {
    console.error("Widget error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get response" });
  }
};
