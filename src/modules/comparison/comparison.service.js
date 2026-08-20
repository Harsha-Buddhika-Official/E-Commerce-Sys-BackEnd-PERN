// src/modules/comparison/comparison.service.js
import { askAI } from "../../services/ai/openRouterClient.js";
import { buildCompareProductsPrompt } from "../../services/ai/prompts/compareProducts.prompt.js";
import { getProductsByIds } from "./comparison.repository.js";

const comparisonCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;

function getCacheKey(productIds) {
  return [...productIds].sort((a, b) => a - b).join("-");
}

function getFromCache(key) {
  const entry = comparisonCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    comparisonCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  comparisonCache.set(key, { data, timestamp: Date.now() });
}

function sanitizeValue(value) {
  if (typeof value === "string") {
    return value
      .replace(/\|/g, " ")
      .replace(/\\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/\*\*/g, "")
      .replace(/#{1,6}\s?/g, "")
      .replace(/-{2,}/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") {
    const cleaned = {};
    for (const [key, val] of Object.entries(value)) cleaned[key] = sanitizeValue(val);
    return cleaned;
  }
  return value;
}

function safeParseAIJson(rawText) {
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI JSON response:", err.message);
    throw new Error("AI returned an invalid response format.");
  }
  return sanitizeValue(parsed);
}

export async function compareProducts(productIds) {
  const cacheKey = getCacheKey(productIds);

  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log("Serving comparison from cache:", cacheKey);
    return cached;
  }

  const products = await getProductsByIds(productIds);

  if (!products || products.length < 2) {
    throw new Error("At least 2 valid products are required for comparison.");
  }

  const prompt = buildCompareProductsPrompt(products);
  const aiResult = await askAI(prompt, false);
  const formattedResult = safeParseAIJson(aiResult);

  setCache(cacheKey, formattedResult);
  return formattedResult;
}