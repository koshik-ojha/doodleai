import axios from "axios";

const FREE_MODELS = [
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "stepfun/step-3.5-flash:free",
  "minimax/minimax-m2.5:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
];

export const getAIResponse = async (messages, systemPrompt = null) => {
  const fullMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  let lastError;
  for (const model of FREE_MODELS) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        { model, messages: fullMessages },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 429 || code === 503) {
        console.warn(`Model ${model} rate-limited, trying next...`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};
