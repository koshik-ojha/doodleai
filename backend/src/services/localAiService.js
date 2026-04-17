// Self-contained AI service — uses FAQ matching + knowledge base search
// No external API required

function tokenize(text) {
  return text.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
}

function similarity(a, b) {
  const aSet = new Set(tokenize(a));
  const bSet = new Set(tokenize(b));
  const common = [...aSet].filter((t) => bSet.has(t)).length;
  return common / Math.max(aSet.size, bSet.size, 1);
}

function findFaqMatch(faqs, query) {
  if (!faqs?.length) return null;
  let best = null;
  let bestScore = 0;

  for (const faq of faqs) {
    const score = similarity(query, faq.question);
    if (score > bestScore && score >= 0.25) {
      bestScore = score;
      best = faq;
    }
  }
  return best;
}

function findKnowledgeSnippet(knowledgeBase, query) {
  if (!knowledgeBase?.trim()) return null;

  const paragraphs = knowledgeBase
    .split(/(?=--- Page:)|\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);

  const queryTokens = new Set(tokenize(query));
  let best = null;
  let bestScore = 0;

  for (const para of paragraphs) {
    const paraTokens = tokenize(para);
    const matches = paraTokens.filter((t) => queryTokens.has(t)).length;
    const score = matches / Math.max(queryTokens.size, 1);
    if (score > bestScore) {
      bestScore = score;
      best = para;
    }
  }

  return bestScore >= 0.2 ? best : null;
}

function detectGreeting(text) {
  return /^(hi+|hello+|hey+|good\s*(morning|afternoon|evening)|howdy|greetings|sup|what'?s?\s*up)/i.test(
    text.trim()
  );
}

function detectThanks(text) {
  return /^(thanks|thank\s*you|thx|ty|cheers|appreciated)/i.test(text.trim());
}

function detectBye(text) {
  return /^(bye|goodbye|see\s*you|take\s*care|cya|later)/i.test(text.trim());
}

export async function localGetAIResponse(messages, systemPrompt = "", chatbot = null) {
  const userMessage = messages[messages.length - 1]?.content?.trim() || "";
  const botName = chatbot?.botName || "Support Assistant";

  // Greeting
  if (detectGreeting(userMessage)) {
    return `Hello! I'm ${botName}. How can I help you today?`;
  }

  // Thanks
  if (detectThanks(userMessage)) {
    return "You're welcome! Is there anything else I can help you with?";
  }

  // Bye
  if (detectBye(userMessage)) {
    return "Goodbye! Feel free to reach out anytime. Have a great day!";
  }

  // FAQ exact or close match
  if (chatbot?.faqs?.length) {
    const faqMatch = findFaqMatch(chatbot.faqs, userMessage);
    if (faqMatch) return faqMatch.answer;
  }

  // Knowledge base search
  if (chatbot?.knowledgeBase) {
    const snippet = findKnowledgeSnippet(chatbot.knowledgeBase, userMessage);
    if (snippet) {
      // Strip page headers from the snippet
      const clean = snippet.replace(/^---\s*Page:.*\n?/i, "").trim();
      return clean;
    }
  }

  // Fallback
  return `I'm sorry, I don't have specific information about that. Please contact our support team for further assistance.`;
}
