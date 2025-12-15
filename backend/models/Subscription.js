import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: "Subscription" },
    renewalDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    confidence: { type: Number, default: 0.8 },
    source: { type: String, enum: ["manual", "auto"], default: "manual" },
    lastNotified: {
  type: [Number], // tracks days already notified (7,3,1)
  default: [],
},
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
