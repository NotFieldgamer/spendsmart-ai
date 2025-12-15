import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAlerts,
  markAlertRead,
  createTestAlert
} from "../controllers/alertController.js";

const router = express.Router();

router.use(authMiddleware);

// ✅ GET all alerts
router.get("/", getAlerts);

// ✅ mark alert as read
router.put("/:id/read", markAlertRead);
router.post("/test",createTestAlert)

// ✅ TEMP TEST ROUTE (for debugging)
router.post("/test", async (req, res) => {
  res.json({ message: "Alerts route working ✅" });
});

export default router;
