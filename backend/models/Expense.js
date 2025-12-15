import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    source: { type: String, enum: ["manual", "ocr-ai"], default: "manual" },
    rawText: { type: String } // raw OCR text if magic input used
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
