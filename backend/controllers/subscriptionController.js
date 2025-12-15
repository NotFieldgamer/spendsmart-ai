import Subscription from "../models/Subscription.js";
import Expense from "../models/Expense.js";
import { detectSubscriptionFromExpense } from "../services/subscriptionDetector.js";

export const getSubscriptions = async (req, res) => {
  const subs = await Subscription.find({ userId: req.user.id }).sort({
    nextBillingDate: 1,
  });
  res.json(subs);
};

export const addSubscription = async (req, res) => {
  const created = await Subscription.create({
    userId: req.user.id,
    ...req.body,
  });
  res.status(201).json(created);
};

export const updateSubscription = async (req, res) => {
  const updated = await Subscription.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
};

export const deleteSubscription = async (req, res) => {
  await Subscription.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Deleted" });
};

export const autoDetectSubscriptions = async (req, res) => {
  const expenses = await Expense.find({ userId: req.user.id });
  const results = [];

  for (const expense of expenses) {
    const detected = detectSubscriptionFromExpense(expense);
    if (!detected) continue;

    const existing = await Subscription.findOne({
      userId: req.user.id,
      name: detected.name,
    });

    if (existing) {
      existing.amount = detected.amount;
      existing.nextBillingDate = detected.nextBillingDate;
      existing.lastDetected = new Date();
      await existing.save();
      results.push(existing);
    } else {
      const created = await Subscription.create({
        ...detected,
        userId: req.user.id,
        lastDetected: new Date(),
      });
      results.push(created);
    }
  }

  res.json(results);
};
