import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import { sendPush } from "./pushService.js";

export async function evaluateBudgets(userId, month) {
  const budgets = await Budget.find({ userId, month });
  const expenses = await Expense.find({
    userId,
    date: {
      $gte: new Date(`${month}-01`),
      $lt: new Date(`${month}-31`)
    }
  });

  for (const budget of budgets) {
    const spent = expenses
      .filter(e => e.category === budget.category)
      .reduce((s, e) => s + e.amount, 0);

    const pct = spent / budget.limitAmount;

    // ✅ 80% warning
    if (pct >= 0.8 && !budget.warned80) {
      await sendPush(userId, {
        title: "Budget Warning",
        body: `${budget.category} has crossed 80% of budget`
      });

      budget.warned80 = true;
    }

    // ❌ Overspent
    if (pct >= 1 && !budget.warned100) {
      await sendPush(userId, {
        title: "Budget Exceeded",
        body: `${budget.category} exceeded its budget`
      });

      budget.warned100 = true;
    }

    await budget.save();
  }
}
