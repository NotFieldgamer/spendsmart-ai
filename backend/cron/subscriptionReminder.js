import Subscription from "../models/Subscription.js";
import { sendPush } from "../services/pushService.js";

const WARNING_DAYS = [7, 3, 1];

export default async function subscriptionReminder() {
  const today = new Date();

  const subs = await Subscription.find({ isActive: true });

  for (const sub of subs) {
    const diffDays = Math.ceil(
      (new Date(sub.renewalDate) - today) / (1000 * 60 * 60 * 24)
    );

    if (!WARNING_DAYS.includes(diffDays)) continue;
    if (sub.lastNotified.includes(diffDays)) continue;

    // ✅ Save in-app alert (we'll display it later)
    await fetch("http://localhost:5000/api/alerts/internal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: sub.userId,
        title: "Subscription Renewal",
        message: `${sub.name} renews in ${diffDays} day(s).`,
        type: diffDays <= 1 ? "danger" : "warning",
      }),
    });

    // ✅ Optional push
    await sendPush(sub.userId, {
      title: "Subscription Reminder",
      body: `${sub.name} renews in ${diffDays} day(s).`,
    });

    sub.lastNotified.push(diffDays);
    await sub.save();
  }
}
