import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "../api/budgets";
import { getExpenses } from "../api/expenses";
import { fetchBudgetAdvice } from "../api/ai";
import BudgetAllocationChart from "../components/BudgetAllocationChart";
import AnimateFade from "../components/AnimateFade";

export default function Budgets() {
  const { token } = useContext(AuthContext);

  const [month, setMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`; // YYYY-MM
  });

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [advice, setAdvice] = useState("");
  const [adviceLoading, setAdviceLoading] = useState(false);

  // form
  const [category, setCategory] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [month]);

  const loadData = async () => {
    setLoading(true);

    const [budRes, expRes] = await Promise.all([
      getBudgets(token, month),
      getExpenses(token, monthRangeFromMonth(month)),
    ]);

    setBudgets(budRes.data);
    setExpenses(expRes.data);
    setLoading(false);
  };

  const monthRangeFromMonth = (monthStr) => {
    // monthStr: "YYYY-MM"
    const [y, m] = monthStr.split("-").map(Number);
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0); // last day of month
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  };

  // compute actual spent by category from expenses
  const actualByCategory = useMemo(() => {
    const map = new Map();
    expenses.forEach((e) => {
      const key = e.category || "Other";
      map.set(key, (map.get(key) || 0) + Number(e.amount || 0));
    });
    return map;
  }, [expenses]);

  const totalPlanned = useMemo(
    () => budgets.reduce((sum, b) => sum + Number(b.limitAmount || 0), 0),
    [budgets]
  );

  const totalActual = useMemo(
    () =>
      budgets.reduce(
        (sum, b) =>
          sum + (actualByCategory.get(b.category) || 0),
        0
      ),
    [budgets, actualByCategory]
  );

  const overallPercent =
    totalPlanned > 0
      ? Math.min(100, Math.round((totalActual / totalPlanned) * 100))
      : 0;

  const allocationData = useMemo(
    () => budgets.map((b) => ({ category: b.category, limitAmount: b.limitAmount })),
    [budgets]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !limitAmount) return;

    if (editingId) {
      await updateBudget(token, editingId, {
        month,
        category,
        limitAmount,
      });
    } else {
      await createBudget(token, {
        month,
        category,
        limitAmount,
      });
    }

    setCategory("");
    setLimitAmount("");
    setEditingId(null);

    loadData();
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setCategory(b.category);
    setLimitAmount(b.limitAmount);
  };

  const removeBudget = async (id) => {
    await deleteBudget(token, id);
    loadData();
  };

  const loadAdvice = async () => {
    setAdviceLoading(true);
    const res = await fetchBudgetAdvice(token);
    setAdvice(res.data.advice);
    setAdviceLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Top summary row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimateFade delay={0.05}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-4 flex flex-col justify-between">
            <div className="mb-3">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">
                Month
              </p>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Plan your monthly budgets per category and compare against actual spend.
            </p>
          </div>
        </AnimateFade>

        <AnimateFade delay={0.10}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-4">
            <p className="text-xs text-[var(--color-text-muted)]">
              Total Planned
            </p>
            <p className="text-2xl font-bold mt-1">₹{totalPlanned.toFixed(2)}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Sum of all category limits for {month}.
            </p>
          </div>
        </AnimateFade>

        <AnimateFade delay={0.15}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-4">
            <p className="text-xs text-[var(--color-text-muted)]">
              Actual vs Budget
            </p>
            <p className="text-xl font-semibold mt-1">
              ₹{totalActual.toFixed(2)} / ₹{totalPlanned.toFixed(2)}
            </p>
            <div className="w-full bg-[var(--color-surface-soft)] rounded-full h-2 my-2 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              {overallPercent}% of your planned budget used.
            </p>
          </div>
        </AnimateFade>
      </section>

      {/* Allocation chart + AI Advice */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimateFade delay={0.18}>
          <BudgetAllocationChart data={allocationData} />
        </AnimateFade>

        <AnimateFade delay={0.22}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">AI Budget Advisor</h3>
              <button
                onClick={loadAdvice}
                className="text-xs px-3 py-1 rounded-full bg-[var(--color-accent)] text-black font-medium"
              >
                {adviceLoading ? "Thinking..." : "Ask AI"}
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-2">
              Get suggestions on how to tweak your budgets based on your actual spend.
            </p>
            <div className="flex-1 overflow-y-auto text-xs text-[var(--color-text-muted)] whitespace-pre-wrap">
              {advice || "No advice yet. Click “Ask AI” after you have budgets & expenses."}
            </div>
          </div>
        </AnimateFade>
      </section>

      {/* Form + budget list */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Form */}
        <AnimateFade delay={0.25}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-4">
            <h3 className="text-sm font-semibold mb-3">
              {editingId ? "Edit Budget" : "Create Budget"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg text-sm"
                placeholder="Category (e.g. Food, Transport)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <input
                className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg text-sm"
                placeholder="Limit Amount"
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
              />

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="bg-[var(--color-accent)] text-black font-semibold px-4 py-2 rounded-lg text-sm"
                >
                  {editingId ? "Update Budget" : "Add Budget"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setCategory("");
                      setLimitAmount("");
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500 text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </AnimateFade>

        {/* List */}
        <AnimateFade delay={0.30}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Budgets for {month}</h3>
            </div>

            {budgets.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">
                No budgets yet. Create one to start planning.
              </p>
            )}

            <div className="space-y-3">
              {budgets.map((b) => {
                const actual = actualByCategory.get(b.category) || 0;
                const pct =
                  b.limitAmount > 0
                    ? Math.round((actual / b.limitAmount) * 100)
                    : 0;
                const overspent = actual > b.limitAmount;

                return (
                  <div
                    key={b._id}
                    className="border border-[var(--color-border-subtle)] rounded-xl p-3 bg-[var(--color-surface-soft)] text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{b.category}</span>
                      <span className={overspent ? "text-red-500" : "text-[var(--color-text-muted)]"}>
                        ₹{actual.toFixed(2)} / ₹{b.limitAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-[var(--color-surface)] rounded-full h-2 mb-1 overflow-hidden">
                      <div
                        className={`h-2 ${
                          overspent
                            ? "bg-red-500"
                            : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-muted)]">
                        {pct}% used {overspent && "(overspent)"}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(b)}
                          className="text-[var(--color-accent-strong)] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeBudget(b._id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimateFade>
      </section>

      {loading && (
        <p className="text-[10px] text-[var(--color-text-muted)]">
          Loading budgets…
        </p>
      )}
    </div>
  );
}
