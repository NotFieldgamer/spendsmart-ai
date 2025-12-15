import Subscription from "../models/Subscription.js";
import Expense from "../models/Expense.js";
import { getSubscriptionAlerts } from "../services/subscriptionAlertService.js";
import { detectFreeTrial } from "../services/geminiService.js";

export const subscriptionAlertController = async (req, res) => {
  const subs = await Subscription.find({ userId: req.user.id });

  const alerts = getSubscriptionAlerts(subs);

  // append AI trial detection
  const trialAlerts = [];

  for (const s of subs) {
    // look up latest related expense
    const exp = await Expense.findOne({
      userId: req.user.id,
      description: { $regex: s.name, $options: "i" },
    }).sort({ date: -1 });

    const text = exp?.rawText || exp?.description;

    if (!text) continue;

    const result = await detectFreeTrial(s.name, text);

    if (result.includes("trial")) {
      trialAlerts.push({
        type: "trial",
        name: s.name,
        severity: "medium",
        message: `${s.name} appears to be a free trial and may charge soon.`,
      });
    }
  }

  res.json({ alerts, trialAlerts });
};
