import Expense from "../models/Expense.js";
import Subscription from "../models/Subscription.js";
import { detectSubscriptionFromExpense } from "../services/subscriptionDetector.js";


export const createExpense = async (req, res) => {
  const { category, amount, description, date, source, rawText } = req.body;
  if (!category || amount == null)
    return res.status(400).json({ message: "Category and amount required" });

  const expense = await Expense.create({
  userId: req.user.id,
  category,
  amount,
  description,
  date,
  source,
  rawText,
});

/* 🔍 AUTO SUBSCRIPTION DETECTION */
const subData = detectSubscriptionFromExpense(expense);

if (subData) {
  const exists = await Subscription.findOne({
    userId: req.user.id,
    name: subData.name,
    isActive: true,
  });

  if (!exists) {
    await Subscription.create({
      userId: req.user.id,
      ...subData,
    });
  }
}

res.json(expense);

};

export const getExpenses = async (req, res) => {
  const { from, to } = req.query;
  const q = { userId: req.user.id };

  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
  }

  const expenses = await Expense.find(q).sort({ date: -1 });
  res.json(expenses);
};

export const updateExpense = async (req, res) => {
  const { category, amount, description, date } = req.body;
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { category, amount, description, date },
    { new: true }
  );
  if (!expense) return res.status(404).json({ message: "Not found" });
  res.json(expense);
};

export const deleteExpense = async (req, res) => {
  const deleted = await Expense.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};
