import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import pushRoutes from "./routes/pushRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

import "./cron/renewalChecker.js";
import "./cron/subscriptionReminder.js";
import subscriptionReminder from "./cron/subscriptionReminder.js";

const app = express();

/* =======================
   ✅ CORS (FIXED)
======================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://spendsmart-psi.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // allow Postman / server-side requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ THIS IS CRITICAL
app.options("/*", cors());

/* =======================
   Middleware
======================= */

app.use(express.json({ limit: "10mb" }));

/* =======================
   Routes
======================= */

app.get("/", (req, res) => {
  res.json({ status: "ok", app: "SpendSmart AI" });
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/alerts", alertRoutes);

/* =======================
   Server
======================= */

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server on " + PORT));
  })
  .catch((err) => {
    console.error("Mongo error:", err);
  });

setInterval(subscriptionReminder, 1000 * 60 * 60 * 12);
