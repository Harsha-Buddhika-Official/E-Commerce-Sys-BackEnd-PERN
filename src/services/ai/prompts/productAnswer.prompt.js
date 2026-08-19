// src/services/ai/prompts/productAnswer.prompt.js

export function buildProductAnswerPrompt(userQuestion, matchedProducts) {
  if (matchedProducts.length === 0) {
    return `The customer asked: "${userQuestion}"

No matching products were found in our store for this request. Politely let them know, and suggest they try a broader search or contact support. Keep it short, plain, and friendly.

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "answer": "your short, friendly response here",
  "productIds": []
}`;
  }

  const productList = matchedProducts
    .map(
      (p, i) =>
        `${i + 1}. [ID:${p.product_id}] ${p.name} - Rs. ${p.price} - ${p.category_name} - Brand: ${p.brand_name || "N/A"} - ${p.stock_quantity > 0 ? "In Stock" : "Out of Stock"}`
    )
    .join("\n");

  return `You are a helpful assistant at a computer shop. The customer asked: "${userQuestion}"

Here are the matching products from our store:
${productList}

Instructions:
- Answer the customer's question using ONLY the products listed above.
- Mention specific product names and prices naturally in your answer.
- If relevant, briefly note stock availability.
- Keep the tone helpful and conversational, like a knowledgeable salesperson.
- Do not use markdown symbols, tables, or line breaks inside your answer - plain conversational sentences only.
- Keep the response concise (under 120 words).

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "answer": "your conversational answer here",
  "productIds": [123, 456]
}`;
}