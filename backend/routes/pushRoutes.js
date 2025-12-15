import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import PushSubscription from "../models/PushSubscription.js";

const router = express.Router();

router.post("/subscribe", authMiddleware, async (req, res) => {
  try {
    const exists = await PushSubscription.findOne({
      userId: req.user.id,
    });

    if (exists) {
      exists.subscription = req.body;
      await exists.save();
    } else {
      await PushSubscription.create({
        userId: req.user.id,
        subscription: req.body,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Push subscribe error:", err);
    res.status(500).json({ error: "Push subscription failed" });
  }
});

export default router;
