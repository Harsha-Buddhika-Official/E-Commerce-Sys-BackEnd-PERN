// src/services/ai/utils/formatProductForPrompt.js

/**
 * Safely flattens a single attribute value object into a readable string.
 * Handles common shapes like { value, unit }, { attribute_value }, etc.
 */
function flattenAttributeValue(attr) {
  if (attr === null || attr === undefined) return null;

  // If it's already a primitive (string/number), just return it
  if (typeof attr !== "object") return String(attr);

  // Try common field names in order of likelihood
  const possibleValue =
    attr.value ?? attr.attribute_value ?? attr.name ?? attr.label ?? null;

  const possibleUnit = attr.unit ?? attr.attribute_unit ?? "";

  if (possibleValue !== null) {
    return possibleUnit ? `${possibleValue} ${possibleUnit}`.trim() : String(possibleValue);
  }

  // Fallback: pull any string/number fields from the object and join them
  const fallbackParts = Object.values(attr).filter(
    (v) => typeof v === "string" || typeof v === "number"
  );

  return fallbackParts.length > 0 ? fallbackParts.join(" ") : null;
}

/**
 * Converts the raw `attributes` object from DB into a clean "Key: Value" text block.
 */
function formatAttributes(attributes) {
  if (!attributes || typeof attributes !== "object") return "No specifications available.";

  const lines = Object.entries(attributes)
    .map(([key, value]) => {
      const readableKey = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const readableValue = flattenAttributeValue(value);
      return readableValue ? `- ${readableKey}: ${readableValue}` : null;
    })
    .filter(Boolean);

  return lines.length > 0 ? lines.join("\n") : "No specifications available.";
}

/**
 * Converts a single raw product record from the DB into a clean text block for the AI prompt.
 */
export function formatProductForPrompt(product, index) {
  const price = product.discounted_price && parseFloat(product.discounted_price) > 0
    ? product.discounted_price
    : product.selling_price;

  const originalPrice = product.discounted_price ? product.selling_price : null;

  return `Product ${index + 1}: ${product.name}
- Brand: ${product.brand?.name || "N/A"}
- Category: ${product.category?.name || "N/A"}
- Price: Rs. ${price}${originalPrice ? ` (Original: Rs. ${originalPrice})` : ""}
- Stock: ${product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
- Warranty: ${product.warranty_months} months
- Description: ${product.description || "N/A"}
- Specifications:
${formatAttributes(product.attributes)}`;
}