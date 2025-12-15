import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../api/expenses";

import MagicInput from "../components/MagicInput";

export default function Expenses() {
  const { token } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [rawText, setRawText] = useState("");

  // Single source of truth for the form
  const [form, setForm] = useState({
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10), // default: today
    source: "manual",
  });

  // Load expenses
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const load = async () => {
    const res = await getExpenses(token);
    setExpenses(res.data || []);
  };

  const resetForm = () => {
    setEditingId(null);
    setRawText("");
    setForm({
      category: "",
      amount: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      source: "manual",
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) return;

    const payload = {
      category: form.category,
      amount: Number(form.amount),
      description: form.description,
      date: form.date,
      source: form.source,
      rawText,
    };

    if (editingId) {
      await updateExpense(token, editingId, payload);
    } else {
      await createExpense(token, payload);
    }

    resetForm();
    load();
  };

  const remove = async (id) => {
    await deleteExpense(token, id);
    load();
  };

  const startEdit = (exp) => {
    setEditingId(exp._id);
    setRawText(exp.rawText || "");
    setForm({
      category: exp.category || "",
      amount: exp.amount?.toString() || "",
      description: exp.description || "",
      date: exp.date
        ? new Date(exp.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      source: exp.source || "manual",
    });
  };

  return (
    <div className="space-y-6">
      {/* ============================= */}
      {/* Add Expense Widget           */}
      {/* ============================= */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Expense</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual + AI-backed form */}
          <form onSubmit={submit} className="space-y-4">
            <input
              className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg"
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value, source: "manual" }))
              }
            />

            <input
              className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg"
              placeholder="Amount"
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value, source: "manual" }))
              }
            />

            <input
              className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value, source: "manual" }))
              }
            />

            {/* ✅ Date selection for when expense happened */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-muted)]">
                Expense date
              </label>
              <input
                type="date"
                className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value, source: "manual" }))
                }
              />
            </div>

            <button
              className="bg-[var(--color-accent)] text-black font-semibold px-4 py-2 rounded-lg"
              type="submit"
            >
              {editingId ? "Update Expense" : "Add Expense"}
            </button>
          </form>

          {/* Magic Input (AI OCR) */}
          <MagicInput
            onResult={({ text, aiData }) => {
              // store full OCR text
              setRawText(text);

              // feed AI result into the same form
              setForm((prev) => ({
                ...prev,
                amount: aiData.amount || prev.amount || "",
                category: aiData.category || prev.category || "",
                description:
                  aiData.vendor ||
                  aiData.description ||
                  prev.description ||
                  text.slice(0, 100),
                date:
                  aiData.date ||
                  prev.date ||
                  new Date().toISOString().slice(0, 10),
                source: "ocr-ai",
              }));
            }}
          />
        </div>
      </div>

      {/* ============================= */}
      {/* Expense Table Widget         */}
      {/* ============================= */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Expenses</h2>
        </div>

        <div className="grid grid-cols-4 text-xs font-medium text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)] pb-2">
          <span>Category</span>
          <span>Amount</span>
          <span>Date</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="mt-2 space-y-2">
          {expenses.map((exp) => (
            <div
              key={exp._id}
              className="grid grid-cols-4 py-2 border-b border-[var(--color-border-subtle)]/40 text-sm"
            >
              <span className="truncate">{exp.category}</span>
              <span className="truncate">₹{exp.amount}</span>
              <span className="truncate">
                {exp.date
                  ? new Date(exp.date).toLocaleDateString()
                  : "—"}
              </span>

              <span className="flex gap-3 justify-end text-xs">
                <button
                  onClick={() => startEdit(exp)}
                  className="text-[var(--color-accent-strong)] hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(exp._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </span>
            </div>
          ))}

          {expenses.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)] mt-3">
              No expenses yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
