// src/services/ai/prompts/filterExtraction.prompt.js
export function buildFilterExtractionPrompt(userQuestion, catalogMeta) {
  return `You are a search-query interpreter for a computer shop's product database.
Convert the customer's question into structured search filters using ONLY the real values listed below.

Available categories: ${catalogMeta.categories.join(", ")}

Available brands: ${catalogMeta.brands.join(", ")}

Available attributes per category:
${Object.entries(catalogMeta.attributesByCategory)
  .map(([cat, attrs]) => `${cat}: ${attrs.join(", ")}`)
  .join("\n")}

Customer question: "${userQuestion}"

Instructions:
- Map the question to real category/brand names from the lists above. Never invent new ones.
- If the customer mentions a spec (e.g. "SSD", "16GB RAM"), match it to the closest attribute name from the list for that category, and put the spec value in "value".
- If the customer describes a USE CASE (e.g. "university work", "gaming", "video editing") rather than a specific spec, map it to the most relevant category only (e.g. "university work" -> Laptops) and leave "keywords" EMPTY - do not put use-case phrases into keywords, since they won't match product names/descriptions literally.
- Only use "keywords" for specific product names or terms likely to appear literally in a product name or description.
- If no category is clearly implied, leave "categories" empty and rely on "keywords" instead.
- If the question is not about searching/filtering products (e.g. general greeting, unrelated question), return "isProductSearch": false.

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "isProductSearch": true,
  "categories": ["exact category name or empty array"],
  "brands": ["exact brand name or empty array"],
  "maxPrice": null,
  "minPrice": null,
  "attributeFilters": [{ "attribute": "exact attribute name", "value": "search term" }],
  "keywords": ["only literal product-name terms, empty if use-case phrase"]
}`;
}