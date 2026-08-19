// src/modules/comparison/comparison.service.js
import { askAI } from "../../services/ai/openRouterClient.js";
import { buildCompareProductsPrompt } from "../../services/ai/prompts/compareProducts.prompt.js";
import { getProductsByIds } from "./comparison.repository.js";

/**
 * Recursively cleans any leftover markdown/table symbols inside string values
 * of the parsed JSON, as a safety net in case the AI doesn't fully follow the schema.
 */
function sanitizeValue(value) {
  if (typeof value === "string") {
    return value
      .replace(/\|/g, " ")               // remove pipe characters (table syntax)
      .replace(/\\n/g, " ")              // remove literal \n escape sequences
      .replace(/\n/g, " ")               // remove actual newlines
      .replace(/\*\*/g, "")              // remove bold markdown
      .replace(/#{1,6}\s?/g, "")         // remove headings
      .replace(/-{2,}/g, "")             // remove table separator dashes (---)
      .replace(/\s{2,}/g, " ")           // collapse multiple spaces
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const cleaned = {};
    for (const [key, val] of Object.entries(value)) {
      cleaned[key] = sanitizeValue(val);
    }
    return cleaned;
  }

  return value;
}

/**
 * Safely parses and sanitizes the AI's JSON response.
 */
function safeParseAIJson(rawText) {
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI JSON response:", err.message);
    console.error("Raw AI response was:", rawText);

    // If the response looks cut off mid-JSON, it's almost always a max_tokens issue
    const looksLikeTruncation = !cleaned.trim().endsWith("}");
    if (looksLikeTruncation) {
      throw new Error("AI response was cut off before completing. Try comparing fewer products, or increase max_tokens.");
    }

    throw new Error("AI returned an invalid response format.");
  }

  return sanitizeValue(parsed);
}

export async function compareProducts(productIds) {
  const products = await getProductsByIds(productIds);

  // console.log("Retrieved Products:", products);

  if (!products || products.length < 2) {
    throw new Error("At least 2 valid products are required for comparison.");
  }

  const prompt = buildCompareProductsPrompt(products);
  const aiResult = await askAI(prompt, false);

  const formattedResult = safeParseAIJson(aiResult);
  console.log("Formatted AI Result:", formattedResult);

  return formattedResult;
}