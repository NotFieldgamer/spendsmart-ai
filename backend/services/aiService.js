import { GoogleGenerativeAI } from "@google/generative-ai";

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

/**
 * Generate natural-language insights from expenses
 */
export const generateInsights = async (expenses) => {
  try {
    if (!expenses.length) return "No expenses found for insights.";

    const prompt = `
You are an AI financial analyst. Analyze these expenses and provide insights:

${expenses
  .map(
    (e) =>
      `• ${e.category} — ₹${e.amount} on ${new Date(e.date).toLocaleDateString()} (${e.description})`
  )
  .join("\n")}

Include: overspending warnings, spending trends, category highlights.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("AI insight error:", err);
    return "AI could not generate insights.";
  }
};

/**
 * Enrich each expense with AI metadata:
 * - subcategory
 * - vendor
 * - confidence
 */
export const enrichExpenseData = async (expenses) => {
  try {
    const enriched = [];

    for (const e of expenses) {
      const text = `${e.description || ""} ${e.rawText || ""}`.trim();

      const prompt = `
Classify this expense:

"${text}"

Return JSON like:
{
  "subcategory": "string",
  "vendor": "string",
  "confidence": number
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      let meta = {};
      try {
        meta = JSON.parse(response);
      } catch {
        meta = {
          subcategory: "General",
          vendor: "Unknown",
          confidence: 0.4,
        };
      }

      enriched.push({
        ...e.toObject(),
        subcategory: meta.subcategory,
        vendor: meta.vendor,
        confidence: meta.confidence,
      });
    }

    return enriched;
  } catch (err) {
    console.error("AI enrichment error:", err);
    return expenses; // return plain if AI fails
  }
};
