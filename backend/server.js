import dotenv from "dotenv";
dotenv.config();              // LOAD ENV FIRST

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
import "./cron/renewalChecker.js";
import "./cron/subscriptionReminder.js"
import subscriptionReminder from "./cron/subscriptionReminder.js";
import alertRoutes from "./routes/alertRoutes.js";

const app = express();

app.use(cors({
  origin: "https://spendsmart-ai.vercel.app/",
  credentials:true,
}));
app.use(express.json({ limit: "10mb" }));

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

setInterval(subscriptionReminder , 1000*60*60*12);