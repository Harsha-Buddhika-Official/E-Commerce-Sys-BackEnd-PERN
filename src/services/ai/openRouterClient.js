const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "poolside/laguna-s-2.1:free";

/**
 * Sends a single comparison prompt to OpenRouter and returns the AI's response.
 * @param {string} prompt - The formatted comparison prompt (built from product data)
 * @param {boolean} useReasoning - Enable step-by-step reasoning for complex comparisons
 */

export async function askAI(prompt, useReasoning = false) {
  const body = {
    model: OPENROUTER_MODEL,
    messages: [
      { role: "user", content: prompt }
    ],
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
  return result.choices[0].message.content;
}