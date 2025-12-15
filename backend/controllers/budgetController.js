import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import Alert from "../models/Alert.js";

export const createBudget = async (req, res) => {
  const { month, category, limitAmount } = req.body;

  if (!month || !category || limitAmount == null) {
    return res
      .status(400)
      .json({ message: "month, category, and limitAmount are required" });
  }

  try {
    const budget = await Budget.create({
      userId: req.user.id,
      month,
      category,
      limitAmount,
    });

    res.status(201).json(budget);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Budget for this category & month already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to create budget" });
  }


  // 🔔 Budget overspend check
const budgets = await Budget.find({
  userId: req.user.id,
  category,
});

for (const b of budgets) {
  const spend = await Expense.aggregate([
    {
      $match: {
        userId: req.user._id,
        category,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const used = spend[0]?.total || 0;
  const pct = (used / b.limitAmount) * 100;

  if (pct >= 100) {
    await Alert.create({
      userId: req.user.id,
      type: "budget",
      severity: "critical",
      title: "Budget exceeded",
      message: `You exceeded your ${category} budget.`,
      meta: { category, used, limit: b.limitAmount },
    });
  } else if (pct >= 80) {
    await Alert.create({
      userId: req.user.id,
      type: "budget",
      severity: "warning",
      title: "Budget warning",
      message: `You’ve used ${Math.round(pct)}% of your ${category} budget.`,
      meta: { category, used, limit: b.limitAmount },
    });
  }
}

};

export const getBudgets = async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  const budgets = await Budget.find({
    userId: req.user.id,
    month,
  });

  const expenses = await Expense.find({
    userId: req.user.id,
    date: {
      $gte: new Date(`${month}-01`),
      $lt: new Date(`${month}-31`),
    },
  });

  const result = budgets.map((b) => {
    const spent = expenses
      .filter((e) => e.category === b.category)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      ...b.toObject(),
      currentSpent: spent,
      remaining: b.limitAmount - spent,
      percentage: Math.min(100, (spent / b.limitAmount) * 100),
    };
  });

  res.json(result);
};

export const updateBudget = async (req, res) => {
  const { month, category, limitAmount, currentSpent } = req.body;

  const update = {};
  if (month != null) update.month = month;
  if (category != null) update.category = category;
  if (limitAmount != null) update.limitAmount = limitAmount;
  if (currentSpent != null) update.currentSpent = currentSpent;

  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true }
    );
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update budget" });
  }
};

export const deleteBudget = async (req, res) => {
  const deleted = await Budget.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!deleted) return res.status(404).json({ message: "Budget not found" });
  res.json({ message: "Deleted" });
};
