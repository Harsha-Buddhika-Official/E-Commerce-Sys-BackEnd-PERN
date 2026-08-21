// src/modules/chat/chat.service.js
import { askAIWithHistory } from "../../services/ai/openRouterClient.js";
import { buildChatSystemMessage } from "../../services/ai/prompts/chat.prompt.js";

export async function chat(history = [], newMessage, comparisonResult = null) {
  if (!newMessage || !newMessage.trim()) {
    throw new Error("Message text is required.");
  }

  // Strip out any role: 'system' the frontend might send (basic prompt-injection guard)
  const sanitizedHistory = (history || []).filter(
    (m) => m.role === "user" || m.role === "assistant"
  );

  const systemMessage = {
    role: "system",
    content: buildChatSystemMessage(comparisonResult),
  };

  const messages = [
    systemMessage,
    ...sanitizedHistory,
    { role: "user", content: newMessage.trim() },
  ];

  const aiReply = await askAIWithHistory(messages);
  // console.log("AI Reply:", aiReply);
  
  return { reply: aiReply };
}



/*
// src/modules/chat/chat.service.js
import { askAIWithHistory, askAI } from "../../services/ai/openRouterClient.js";
import { buildChatSystemMessage } from "../../services/ai/prompts/chat.prompt.js";
import { buildFilterExtractionPrompt } from "../../services/ai/prompts/filterExtraction.prompt.js";
import { buildProductAnswerPrompt } from "../../services/ai/prompts/productAnswer.prompt.js";
import { getCatalogMeta, searchProducts } from "./chat.repository.js";

function safeParseAIJson(rawText) {
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI JSON:", err.message, rawText);
    throw new Error("AI returned an invalid response format.");
  }
}

function looksLikeProductQuestion(message) {
  const keywords = [
    "laptop", "monitor", "keyboard", "mouse", "gpu", "graphic card", "cpu", "processor",
    "ram", "ssd", "storage", "price", "cost", "budget", "recommend", "suggest",
    "under", "below", "cheap", "best", "buy", "available", "in stock", "brand",
  ];
  return keywords.some((kw) => message.toLowerCase().includes(kw));
}

export async function chat(history = [], newMessage, comparisonResult = null) {
  if (!newMessage || !newMessage.trim()) {
    throw new Error("Message text is required.");
  }

  const trimmed = newMessage.trim();

  // --- Product search flow (two-step AI) ---
  if (looksLikeProductQuestion(trimmed)) {
    const catalogMeta = await getCatalogMeta();

    const filterPrompt = buildFilterExtractionPrompt(trimmed, catalogMeta);
    const filterRaw = await askAI(filterPrompt, false);
    const filters = safeParseAIJson(filterRaw);

    if (filters.isProductSearch === false) {
      // Fall through to normal conversational chat below
    } else {
      const matchedProducts = await searchProducts(filters);

      const answerPrompt = buildProductAnswerPrompt(trimmed, matchedProducts);
      const answerRaw = await askAI(answerPrompt, false);
      const answerData = safeParseAIJson(answerRaw);

      return {
        type: "product_search",
        reply: answerData.answer,
        productIds: answerData.productIds || [],
      };
    }
  }

  // --- Normal conversational chat (fallback) ---
  const sanitizedHistory = (history || []).filter(
    (m) => m.role === "user" || m.role === "assistant"
  );

  const systemMessage = {
    role: "system",
    content: buildChatSystemMessage(comparisonResult),
  };

  const messages = [
    systemMessage,
    ...sanitizedHistory,
    { role: "user", content: trimmed },
  ];

  const aiReply = await askAIWithHistory(messages);
  return { type: "chat", reply: aiReply };
}
*/