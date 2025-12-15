import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSubscriptions,
  addSubscription,  
  updateSubscription,
  deleteSubscription,
  autoDetectSubscriptions
} from "../controllers/subscriptionController.js";
import { subscriptionAlertController } from "../controllers/subscriptionAlertController.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", getSubscriptions);
router.post("/", addSubscription);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);
router.get("/detect/scan", autoDetectSubscriptions);
router.get("/alerts/renewals", subscriptionAlertController);

export default router;
