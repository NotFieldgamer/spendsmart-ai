import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const ocrReceipt = async (base64, mimeType = "image/png") => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" });

  const result = await model.generateContent([
    {
      inlineData: { data: base64, mimeType }
    },
    {
      text: "Extract clear readable text from this receipt."
    }
  ]);

  return result.response.text();
};

export const categorizeExpenseText = async (text) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
You are an expense classifier.
Given the receipt text below, infer:
- category (Food, Travel, Groceries, Shopping, Bills, Entertainment, Other)
- description
- total amount in number (no currency symbol).

Return ONLY valid JSON: {"category": "...", "description": "...", "amount": 123.45}

Text:
${text}
`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  return JSON.parse(raw);
};

export const generateInsights = async (expenses) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const summary = expenses
    .map((e) => `${e.category}: ${e.amount}`)
    .join(", ");

  const prompt = `
You are a financial coach AI.
Given these category totals: ${summary}
Return short insights in bullet points about:
- overspending categories
- saving opportunities
- suggested monthly budget adjustments.

Keep it under 200 words.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const budgetAdvice = async (budgets, expenses) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const budgetSummary = budgets
    .map(
      (b) =>
        `${b.month} - ${b.category}: limit ${b.limitAmount}, currentSpent ${b.currentSpent ?? 0}`
    )
    .join("; ");

  const categorySpend = expenses.reduce((acc, e) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
    return acc;
  }, {});

  const expenseSummary = Object.entries(categorySpend)
    .map(([cat, amt]) => `${cat}: ${amt}`)
    .join("; ");

  const prompt = `
You are an AI financial coach.

User budgets:
${budgetSummary || "No budgets defined."}

Actual spending per category:
${expenseSummary || "No expenses yet."}

Give concise, practical advice:
- Where they are overspending vs budget
- Which categories to increase/decrease
- How to adjust next month's budgets
- 3 short bullet recommendations

Keep under 180 words.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const classifySubscriptionAI = async (text) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Determine if the following text describes a subscription or recurring service:
"${text}"

Respond ONLY with:
- "subscription"
- "not subscription"
`;

  const result = await model.generateContent(prompt);
  return result.response.text().toLowerCase();
};

export const subscriptionCancelAdvice = async (subscriptions, expenses) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const subSummary = subscriptions
    .map(
      (s) =>
        `${s.name}: ₹${s.amount}/month, renews ${new Date(
          s.nextBillingDate
        ).toLocaleDateString()}`
    )
    .join("\n");

  const expenseSummary = expenses
    .slice(0, 100)
    .map((e) => `${e.category}: ₹${e.amount}`)
    .join("\n");

  const prompt = `
You are an AI financial advisor.

User recurring subscriptions:
${subSummary || "No subscriptions recorded."}

User recent expenses (to infer usage):
${expenseSummary || "No spending history."}

Give actionable advice:
- Identify subscriptions that might be overkill or overpriced
- Recommend cancellations or downgrades
- Identify low-usage categories based on spending patterns
- Keep it short, max 140 words
- Direct, concise language
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const detectFreeTrial = async (subscriptionName, rawText) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Determine whether this subscription suggests a “free trial” or discounted trial that expires soon.
Subscription: ${subscriptionName}
OCR / Expense Text: ${rawText || "none"}

Respond only:
- "trial"
- "no trial"
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim().toLowerCase();
};

export const classifyExpenseMeta = async (expense) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You will extract structured meta-data from an expense.

Expense:
- Category: ${expense.category || "Unknown"}
- Description: ${expense.description || "None"}
- OCR Raw Text: ${expense.rawText || "None"}

Return a short JSON object with EXACTLY these keys:
{
  "subcategory": "<short subcategory like Restaurants, Groceries, Taxi, Clothing, Subscriptions, Utilities>",
  "vendor": "<short vendor or brand name, e.g. McDonald's, Uber, Netflix; if unknown use 'Other'>",
  "confidence": <number between 0 and 1>
}
No extra text. Only JSON.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const jsonStr = text.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonStr);
    return {
      subcategory: parsed.subcategory || "Other",
      vendor: parsed.vendor || "Other",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
    };
  } catch (err) {
    console.error("Failed to parse expense meta JSON:", text, err);
    return {
      subcategory: expense.category || "Other",
      vendor: "Other",
      confidence: 0.2,
    };
  }
};
