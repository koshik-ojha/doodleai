import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// ── 1. Primary: Google Gemini ─────────────────────────────────────
async function geminiResponse(messages, systemPrompt) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(messages[messages.length - 1].content);
  return result.response.text();
}

// ── 2. Secondary: Groq ────────────────────────────────────────────
async function groqResponse(messages, systemPrompt) {
  const fullMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  const { data } = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    { model: "llama-3.3-70b-versatile", messages: fullMessages },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return data.choices[0].message.content;
}

// ── 3. Tertiary: OpenRouter (free models) ─────────────────────────
const OPENROUTER_MODELS = [
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "mistralai/mistral-7b-instruct:free",
];

async function openRouterResponse(messages, systemPrompt) {
  const fullMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  let lastError;
  for (const model of OPENROUTER_MODELS) {
    try {
      const { data } = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        { model, messages: fullMessages },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return data.choices[0].message.content;
    } catch (err) {
      lastError = err;
      continue;
    }
  }
  throw lastError;
}

// ── Main export ───────────────────────────────────────────────────
export const getAIResponse = async (messages, systemPrompt = "") => {
  try {
    return await geminiResponse(messages, systemPrompt);
  } catch (err) {
    console.warn("Gemini failed:", err.message, "→ trying Groq");
    try {
      return await groqResponse(messages, systemPrompt);
    } catch (err2) {
      console.warn("Groq failed:", err2.message, "→ trying OpenRouter");
      return await openRouterResponse(messages, systemPrompt);
    }
  }
};
