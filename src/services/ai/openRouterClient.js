const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.AI_MODEL || "poolside/laguna-s-2.1:free";

// Used by comparison.service.js (unchanged, still works the same)
export async function askAI(prompt, useReasoning = false) {
  return askAIWithHistory([{ role: "user", content: prompt }], useReasoning);
}

// NEW - used by chat.service.js (accepts full message history)
// src/services/ai/openRouterClient.js
export async function askAIWithHistory(messages, useReasoning = false) {
  const body = {
    model: OPENROUTER_MODEL,
    messages,
    max_tokens: 2000,
    temperature: 0.3,
  };

  if (useReasoning) {
    body.reasoning = { enabled: true };
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const choice = result.choices[0];

  if (choice.finish_reason === "length") {
    console.warn("⚠️ AI response was truncated due to max_tokens limit. Consider increasing max_tokens.");
  }

  return choice.message.content;
}