import mongoose from "mongoose";

const { Schema } = mongoose;

const budgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // month in "YYYY-MM", e.g. "2025-11"
    month: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    limitAmount: { type: Number, required: true, min: 0 },
    // optional manual tracking; we'll mainly compute actual from expenses
    currentSpent: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// prevent duplicate budgets for same user/month/category
budgetSchema.index({ userId: 1, month: 1, category: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
