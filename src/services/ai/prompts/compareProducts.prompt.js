// src/services/ai/prompts/compareProducts.prompt.js
import { formatProductForPrompt } from "../utils/formatProductForPrompt.js";

export function buildCompareProductsPrompt(products) {
  const formattedProducts = products
    .map((p, index) => formatProductForPrompt(p, index))
    .join("\n\n");

  const categories = [...new Set(products.map((p) => p.category?.name))];
  const isCrossCategory = categories.length > 1;

  return `You are a knowledgeable computer hardware expert working at a computer shop's e-commerce store.
A customer wants to compare the following products before making a purchase decision.

${formattedProducts}

${isCrossCategory
  ? `Note: These products are from different categories (${categories.join(", ")}). Explain what each is for and only compare directly where relevant.`
  : `These products are from the same category. Compare them directly, spec by spec.`
}

Respond with ONLY valid JSON. No markdown. No tables. No pipe characters (|). No backslashes. No line breaks inside any string value. No text before or after the JSON.

Use this EXACT structure:

{
  "products": [
    {
      "name": "product name",
      "price": "price as plain text, e.g. Rs. 365000",
      "stockStatus": "In Stock or Out of Stock",
      "specs": [
        { "label": "Performance", "value": "short plain sentence" },
        { "label": "Display", "value": "short plain sentence" },
        { "label": "RAM and Storage", "value": "short plain sentence" },
        { "label": "Battery", "value": "short plain sentence" },
        { "label": "Warranty", "value": "short plain sentence" }
      ]
    }
  ],
  "keyDifferences": [
    { "product": "product name", "point": "one short plain sentence" }
  ],
  "recommendation": {
    "bestChoice": "name of recommended product",
    "reason": "1-2 plain sentences, no line breaks"
  }
}

Rules:
- Every string value must be a single plain sentence with no \\n, no |, no markdown symbols (*, #, -).
- "specs" array must have the same "label" set for every product so they can be compared side by side.
- Do not include any product not listed above.
- Do not add extra fields.`;
}