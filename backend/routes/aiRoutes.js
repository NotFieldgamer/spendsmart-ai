import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  magicInput,
  getInsights,
  budgetAdviceController,
  subscriptionAdviceController,
  getEnrichedExpenses,
} from "../controllers/aiController.js";

const router = express.Router();

/* 🔐 All AI routes are protected */
router.post("/magic", authMiddleware, magicInput);
router.get("/insights", authMiddleware, getInsights);
router.get("/expenses-enriched", authMiddleware, getEnrichedExpenses);
router.get("/budget-advice", authMiddleware, budgetAdviceController);
router.get("/subscription-advice", authMiddleware, subscriptionAdviceController);

export default router;
