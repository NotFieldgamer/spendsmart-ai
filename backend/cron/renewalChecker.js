import cron from "node-cron";
import Subscription from "../models/Subscription.js";
import PushSubscription from "../models/PushSubscription.js";
import { sendPush } from "../services/pushService.js";

cron.schedule("0 */6 * * *", async () => {
  const now = new Date();
  const subs = await Subscription.find();

  for (const s of subs) {
    const next = new Date(s.nextBillingDate);
    const days = Math.round((next - now) / 86400000);

    if (days < 0 || days > 3) continue;

    const userSub = await PushSubscription.findOne({ userId: s.userId });
    if (!userSub) continue;

    await sendPush(userSub, {
      title: "Upcoming Renewal",
      body: `${s.name} renews in ${days} days (₹${s.amount})`,
      url: "/subscriptions",
    });
  }
});
