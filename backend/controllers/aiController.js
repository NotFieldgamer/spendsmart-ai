import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import Subscription from "../models/Subscription.js";

// Gemini OCR + categorization
import { 
  ocrReceipt, 
  categorizeExpenseText, 
  budgetAdvice, 
  subscriptionCancelAdvice,
  classifyExpenseMeta
} from "../services/geminiService.js";

// Gemini Insights + Enrichment
import { 
  generateInsights, 
  enrichExpenseData 
} from "../services/aiService.js";


// ==========================
//  MAGIC INPUT (OCR RECEIPTS)
// ==========================
export const magicInput = async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64)
      return res.status(400).json({ message: "imageBase64 required" });

    const text = await ocrReceipt(imageBase64, mimeType || "image/png");
    const aiData = await categorizeExpenseText(text);

    res.json({ text, aiData });
  } catch (err) {
    console.error("Magic input error:", err);
    res.status(500).json({ error: "Magic input failed" });
  }
};


// ==========================
//  GENERAL AI INSIGHTS
// ==========================
export const getInsights = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });

    const insights = await generateInsights(expenses);

    res.json({ insights });
  } catch (err) {
    console.error("Insights error:", err);
    res.status(500).json({ error: "AI insight generation failed" });
  }
};


// ==========================
//  SUBSCRIPTION CANCEL ADVICE
// ==========================
export const subscriptionAdviceController = async (req, res) => {
  try {
    const [subs, expenses] = await Promise.all([
      Subscription.find({ userId: req.user.id }),
      Expense.find({ userId: req.user.id }).sort({ date: -1 }).limit(200),
    ]);

    const advice = await subscriptionCancelAdvice(subs, expenses);
    res.json({ advice });
  } catch (err) {
    console.error("Subscription advice error:", err);
    res.status(500).json({ error: "Subscription advice failed" });
  }
};


// ==========================
//  BUDGET ADVICE
// ==========================
export const budgetAdviceController = async (req, res) => {
  try {
    const [budgets, expenses] = await Promise.all([
      Budget.find({ userId: req.user.id }),
      Expense.find({ userId: req.user.id }),
    ]);

    const advice = await budgetAdvice(budgets, expenses);
    res.json({ advice });
  } catch (err) {
    console.error("Budget advice error:", err);
    res.status(500).json({ error: "AI budget advice failed" });
  }
};


// ==========================
//  EXPENSE ENRICHMENT (OLDER METHOD)
// ==========================
export const expenseEnrichmentController = async (req, res) => {
  try {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({
      userId: req.user.id,
      date: { $gte: monthStart, $lte: monthEnd },
    }).sort({ date: -1 });

    const enriched = [];
    for (const e of expenses) {
      const meta = await classifyExpenseMeta(e);

      enriched.push({
        ...e.toObject(),
        subcategory: meta.subcategory,
        vendor: meta.vendor,
        confidence: meta.confidence,
      });
    }

    res.json(enriched);
  } catch (err) {
    console.error("Legacy enrichment error:", err);
    res.status(500).json({ error: "Expense enrichment failed" });
  }
};


// ==========================
//  EXPENSE ENRICHMENT (NEW AI-SERVICE METHOD)
// ==========================
export const getEnrichedExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    const enriched = await enrichExpenseData(expenses);

    res.json({ expenses: enriched });
  } catch (err) {
    console.error("Enrichment error:", err);
    res.status(500).json({ error: "AI expense enrichment failed" });
  }
};
