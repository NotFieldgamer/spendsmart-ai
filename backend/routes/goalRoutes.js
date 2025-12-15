import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal
} from "../controllers/goalController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createGoal);
router.get("/", getGoals);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
