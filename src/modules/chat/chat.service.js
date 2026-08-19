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
  console.log("AI Reply:", aiReply);
  
  return { reply: aiReply };
}