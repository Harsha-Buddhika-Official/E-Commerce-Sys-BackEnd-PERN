/**
 * Cleans raw AI markdown response into plain, human-readable text.
 * Removes markdown symbols and normalizes spacing.
 */
export function cleanAIResponseText(rawText) {
  if (!rawText) return "";

  return rawText
    .replace(/\*\*(.*?)\*\*/g, "$1")   // remove **bold**
    .replace(/\*(.*?)\*/g, "$1")       // remove *italic*
    .replace(/#{1,6}\s?/g, "")         // remove markdown headings (#, ##, etc.)
    .replace(/^- /gm, "")              // remove bullet dashes at line start
    .replace(/\n{3,}/g, "\n\n")        // collapse excessive newlines
    .trim();
}

/**
 * Splits cleaned text into an array of paragraph strings.
 * Useful for frontend rendering (map over paragraphs → <p> tags).
 */
export function splitIntoParagraphs(cleanedText) {
  return cleanedText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Full formatter: raw AI text -> structured response object for frontend.
 */
export function formatAIResponse(rawText) {
  const cleaned = cleanAIResponseText(rawText);
  const paragraphs = splitIntoParagraphs(cleaned);

  return {
    // text: cleaned,          // full clean text (single string, if needed)
    paragraphs,              // array of paragraphs (for <p> rendering)
  };
}