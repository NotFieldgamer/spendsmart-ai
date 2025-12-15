import dotenv from "dotenv";
dotenv.config();
import webpush from "web-push";

// Ensure env is loaded even if imported early

if (!process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) {
  console.error("VAPID KEYS NOT FOUND");
}

webpush.setVapidDetails(
  "mailto:admin@spendsmart.ai",
  process.env.VAPID_PUBLIC?.trim(),
  process.env.VAPID_PRIVATE?.trim()
);

export const sendPush = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    console.error("Push error:", err.message);
  }
};

console.log("Loaded VAPID:", process.env.VAPID_PUBLIC);
