// src/pages/Dashboard.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import { getExpenses } from "../api/expenses";
import { getGoals } from "../api/goals";
import { getBudgets } from "../api/budgets";
import { getSubscriptions } from "../api/subscriptions";
import { fetchInsights, fetchSubscriptionAdvice } from "../api/ai"; // fetchSubscriptionAdvice optional

import PieChartExpenses from "../components/PieChartExpenses";
import LineChartDaily from "../components/LineChartDaily";
import ExpenseBudgetDonut from "../components/ExpenseBudgetDonut";
import ExpenseForecastDonut from "../components/ExpenseForecastDonut";
import SubscriptionPieChart from "../components/SubscriptionPieChart";
import AnimateFade from "../components/AnimateFade";

export default function Dashboard() {
  const { token, user } = useContext(AuthContext);
  const nav = useNavigate();


  // --- state ---
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [insights, setInsights] = useState("");
  const [subAdvice, setSubAdvice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // redirect if not logged in
  useEffect(() => {
    if (!user) {
      nav("/login");
      return <p className="p-6 text-sm">Loading Dashboard...</p>;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);

    try {
      // fetch core data in parallel
      const [expRes, goalRes, budRes, subRes] = await Promise.allSettled([
        getExpenses(token),
        getGoals(token),
        getBudgets(token),
        getSubscriptions(token),
      ]);

      if (expRes.status === "fulfilled") setExpenses(expRes.value.data || []);
      else {
        console.error("Failed to load expenses:", expRes.reason);
        setExpenses([]);
      }

      if (goalRes.status === "fulfilled") setGoals(goalRes.value.data || []);
      else setGoals([]);

      if (budRes.status === "fulfilled") setBudgets(budRes.value.data || []);
      else setBudgets([]);

      if (subRes.status === "fulfilled") setSubscriptions(subRes.value.data || []);
      else setSubscriptions([]);

      // fetch insights separately so charts load even if AI fails
      setInsightsLoading(true);
      try {
        const ins = await fetchInsights(token);
        setInsights(ins.data?.insights || "");
      } catch (err) {
        console.warn("Insights error:", err?.message || err);
        setInsights("");
      } finally {
        setInsightsLoading(false);
      }

      // optional: subscription advice (non-fatal)
      // try {
      //   if (typeof fetchSubscriptionAdvice === "function") {
      //     const adv = await fetchSubscriptionAdvice(token);
      //     setSubAdvice(adv.data?.advice || null);
      //   }
      // } catch (err) {
      //   console.warn("Subscription advice not available or failed:", err?.message || err);
      //   setSubAdvice(null);
      // }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------
     Time helpers - define ONCE
     ------------------------ */
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth(); // 0-based
  const thisMonthKey = `${thisYear}-${String(thisMonth + 1).padStart(2, "0")}`; // "YYYY-MM"

  const isSameMonth = (d, year = thisYear, month = thisMonth) => {
    if (!d) return false;
    const dt = new Date(d);
    return dt.getFullYear() === year && dt.getMonth() === month;
  };

  /* ------------------------
     Basic aggregations
     ------------------------ */
  const totalSpend = useMemo(
    () => (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses]
  );

  const categoryData = useMemo(() => {
    const m = new Map();
    (expenses || []).forEach((e) => {
      const k = e.category || "Other";
      m.set(k, (m.get(k) || 0) + Number(e.amount || 0));
    });
    return Array.from(m.entries()).map(([category, amount]) => ({ category, amount }));
  }, [expenses]);

  const dailyData = useMemo(() => {
    const nowDate = new Date();
    const cutoff = new Date(nowDate);
    cutoff.setDate(nowDate.getDate() - 29);

    const byDay = new Map();
    (expenses || []).forEach((e) => {
      const d = new Date(e.date);
      if (d < cutoff) return;
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) || 0) + Number(e.amount || 0));
    });

    return Array.from(byDay.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, amount]) => ({ date, amount }));
  }, [expenses]);

  /* ------------------------
     Monthly / Today aggregates
     ------------------------ */
  const monthlyExpenseTotal = useMemo(
    () =>
      (expenses || [])
        .filter((e) => isSameMonth(e.date))
        .reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses]
  );

  const todayExpenseTotal = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    return (expenses || [])
      .filter((e) => new Date(e.date).toISOString().slice(0, 10) === todayKey)
      .reduce((s, e) => s + Number(e.amount || 0), 0);
  }, [expenses]);

  const topCategoryThisMonth = useMemo(() => {
    const m = new Map();
    (expenses || []).forEach((e) => {
      if (!isSameMonth(e.date)) return;
      const k = e.category || "Other";
      m.set(k, (m.get(k) || 0) + Number(e.amount || 0));
    });
    if (m.size === 0) return null;
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1])[0]; // [category, amount]
  }, [expenses]);

  /* ------------------------
     Budgets (one card per category) - budgets filtered for current month
     budgets schema expected: { category, limitAmount, currentSpent, month: "YYYY-MM" }
     ------------------------ */
  const budgetsThisMonth = useMemo(() => {
    if (!Array.isArray(budgets)) return [];
    return budgets.filter((b) => String(b.month) === String(thisMonthKey));
  }, [budgets, thisMonthKey]);

  // map for quick lookups and budget card rendering
  const budgetsMap = useMemo(() => {
    const map = new Map();
    (budgetsThisMonth || []).forEach((b) => {
      map.set(b.category || "Other", {
        limitAmount: Number(b.limitAmount || 0),
        currentSpent: Number(b.currentSpent || 0),
      });
    });
    return map;
  }, [budgetsThisMonth]);

  /* ------------------------
     Subscriptions: upcoming renewals (next 3)
     subs schema assumed: { name, amount, renewalDate, isActive }
     ------------------------ */
  const upcomingRenewals = useMemo(() => {
    if (!Array.isArray(subscriptions)) return [];
    const future = subscriptions
      .filter((s) => s.renewalDate && s.isActive !== false)
      .map((s) => ({ ...s, renewalTs: new Date(s.renewalDate).getTime() }))
      .filter((s) => !Number.isNaN(s.renewalTs))
      .sort((a, b) => a.renewalTs - b.renewalTs)
      .slice(0, 3)
      .map((s) => ({ ...s, renewalDateFormatted: new Date(s.renewalDate).toLocaleDateString() }));
    return future;
  }, [subscriptions]);

  /* ------------------------
     Budget vs Spend data for dual-ring donut
     uses categories present in budgetsThisMonth, fallback to expense categories
     ------------------------ */
  const budgetVsSpendData = useMemo(() => {
    const spendByCat = new Map();
    (expenses || []).forEach((e) => {
      if (!isSameMonth(e.date)) return;
      const cat = e.category || "Other";
      spendByCat.set(cat, (spendByCat.get(cat) || 0) + Number(e.amount || 0));
    });

    if (budgetsThisMonth.length > 0) {
      return budgetsThisMonth.map((b) => {
        const cat = b.category || "Other";
        return {
          category: cat,
          limitAmount: Number(b.limitAmount || 0),
          spendAmount: Number(spendByCat.get(cat) || 0),
        };
      });
    }

    // fallback to categories found in spend
    return Array.from(spendByCat.entries()).map(([category, spend]) => ({
      category,
      limitAmount: 0,
      spendAmount: spend,
    }));
  }, [budgetsThisMonth, expenses]);

  /* ------------------------
     Forecast: deterministic projection (daily average * days in month)
     ------------------------ */
  const monthlySpend = monthlyExpenseTotal;
  const forecastSpend = useMemo(() => {
    const nowDate = new Date();
    const dayOfMonth = nowDate.getDate() || 1;
    const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
    const dailyAvg = monthlySpend / dayOfMonth;
    return dailyAvg * daysInMonth;
  }, [monthlySpend, thisYear, thisMonth]);

  /* ------------------------
     Enrichment mapping for sunburst (use e.aiData if present; fallback to description)
     This produces an array of { category, subcategory, vendor, amount, _id }
     ------------------------ */
  const enrichedMapped = useMemo(() => {
    return (expenses || []).map((e) => {
      const ai = e.aiData || {};
      return {
        _id: e._id,
        category: e.category || "Other",
        subcategory: ai.subcategory || e.category || "Other",
        vendor: ai.vendor || e.description || "Unknown",
        amount: Number(e.amount || 0),
      };
    });
  }, [expenses]);

  /* ------------------------
     Subscription pie data (simple mapping)
     ------------------------ */

  const subscriptionPieData = useMemo(() => {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) return [];
    return subscriptions.map((s) => ({ name: s.name, amount: Number(s.amount || 0) }));
  }, [subscriptions]);

  /* ------------------------
     Recent expenses for small table
     ------------------------ */
  const recentExpenses = useMemo(() => (expenses || []).slice(0, 7), [expenses]);

  /* ------------------------
     Render
     ------------------------ */

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Greeting + quick stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-3 sm:p-4 md:col-span-2">
          <p className="text-sm text-[var(--color-text-muted)]">Hello {user?.name ?? "there"} 👋</p>
          <h2 className="text-lg sm:text-xl font-semibold mt-1">Here’s a snapshot of your month.</h2>

          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/expenses" className="px-3 py-2 rounded-full bg-[var(--color-accent)] text-black text-sm">+ Add expense</Link>
            <Link to="/goals" className="px-3 py-2 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-accent-strong)] text-sm">Manage goals</Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-soft)]
border border-[var(--color-border-subtle)]
rounded-2xl p-5 shadow-sm">

          <p className="text-xs text-[var(--color-text-muted)]">Total Spend</p>
          <p className="text-2xl font-bold mt-1">₹{totalSpend.toFixed(2)}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">AI insights & unusual patterns below.</p>
        </div>
      </section>

      {/* Monthly overview: Expenses / Budgets / Subscriptions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimateFade delay={0.06}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-3 sm:p-4">
            <p className="text-xs text-[var(--color-text-muted)]">This month</p>
            <p className="text-2xl font-bold mt-1">₹{monthlyExpenseTotal.toFixed(2)}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">Today: ₹{todayExpenseTotal.toFixed(2)}</p>
            {topCategoryThisMonth && <p className="text-xs text-[var(--color-text-muted)] mt-1">Top: {topCategoryThisMonth[0]} (₹{topCategoryThisMonth[1].toFixed(0)})</p>}
          </div>
        </AnimateFade>

        <AnimateFade delay={0.10}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-3 sm:p-4">
            <p className="text-xs text-[var(--color-text-muted)]">Budgets (this month)</p>
            <div className="mt-3 space-y-3">
              {budgetsThisMonth.length === 0 && <p className="text-xs text-[var(--color-text-muted)]">No budgets set for this month.</p>}
              {budgetsThisMonth.map((b) => {
                const cat = b.category || "Other";
                const limit = Number(b.limitAmount || 0);
                const used = Number(b.currentSpent || 0);
                const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                const over = limit > 0 && used > limit;
                return (
                  <div key={b._id} className="p-3 bg-[var(--color-surface-soft)] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{cat}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">Used ₹{used.toFixed(0)} / ₹{limit.toFixed(0)}</p>
                      </div>
                      <div className="text-sm font-semibold">{pct}%</div>
                    </div>
                    <div className="w-full bg-[var(--color-surface)] rounded-full h-2 mt-3 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${over
                            ? "bg-red-500"
                            : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
                          }`}
                        style={{ width: `${pct}%` }}
                      />

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimateFade>

        <AnimateFade delay={0.14}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-3 sm:p-4">
            <p className="text-xs text-[var(--color-text-muted)]">Subscriptions (monthly)</p>
            <p className="text-2xl font-bold mt-1">₹{subscriptionPieData.reduce((s, p) => s + p.amount, 0).toFixed(2)}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">{(subscriptions || []).length} active</p>

            <div className="mt-3">
              <h4 className="text-xs font-semibold mb-2">Upcoming renewals</h4>
              {upcomingRenewals.length === 0 && <p className="text-xs text-[var(--color-text-muted)]">No renewals soon.</p>}
              <ul className="space-y-2">
                {upcomingRenewals.map((s) => (
                  <li key={s._id} className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-[var(--color-text-muted)]">{s.renewalDateFormatted}</div>
                    </div>
                    <div className="text-sm font-semibold">₹{Number(s.amount || 0).toFixed(0)}</div>
                  </li>
                ))}
              </ul>

              {subAdvice && (
                <div className="mt-3 text-xs text-[var(--color-text-muted)]">
                  AI suggestion: {String(subAdvice).slice(0, 140)}{String(subAdvice).length > 140 ? "…" : ""}
                </div>
              )}
            </div>
          </div>
        </AnimateFade>
      </section>

      {/* Basic charts row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <div className="space-y-2">
    <h3 className="text-sm font-semibold">Spending by Category</h3>
    <p className="text-xs text-[var(--color-text-muted)]">
      Where your money goes this month
    </p>
    <div className="min-h-[260px] sm:min-h-[300px]">
      <PieChartExpenses data={categoryData} />
    </div>
  </div>

  <div className="space-y-2">
    <h3 className="text-sm font-semibold">Daily Spending Trend</h3>
    <p className="text-xs text-[var(--color-text-muted)]">
      Last 30 days
    </p>
    <div className="min-h-[260px] sm:min-h-[300px]">
    <LineChartDaily data={dailyData} />
    </div>
  </div>
</section>


      {/* Advanced charts row 1: Budget vs Spend + Forecast */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="min-h-[260px] sm:min-h-[300px]">
        <ExpenseBudgetDonut data={budgetVsSpendData} />
        </div>
        <ExpenseForecastDonut monthlyBudget={budgetsThisMonth.reduce((s, b) => s + Number(b.limitAmount || 0), 0)} monthlySpend={monthlySpend} forecastSpend={forecastSpend} />
        {forecastSpend > monthlySpend && forecastSpend > 0 && (
          <p className="text-xs text-red-400 mt-1">
            ⚠ Projected to overshoot this month if spending continues
          </p>
        )}
      </section>



      {/* Goals + AI insights + recent */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Goals Overview</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-accent-strong)]">{goals.length} active</span>
          </div>

          <p className="text-xs text-[var(--color-text-muted)] mb-2">
            {goals.reduce((s, g) => s + Number(g.currentAmount || 0), 0).toFixed(2)} saved towards {goals.reduce((s, g) => s + Number(g.targetAmount || 0), 0).toFixed(2)}.
          </p>

          <ul className="mt-3 space-y-2 max-h-40 overflow-y-auto text-xs">
            {goals.map((g) => {
              const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
              return (
                <li key={g._id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{g.name}</span>
                  <span className="text-[var(--color-text-muted)]">{pct}%</span>
                </li>
              );
            })}
            {goals.length === 0 && <p className="text-[var(--color-text-muted)]">No goals yet.</p>}
          </ul>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">AI Insights</h3>
            {insightsLoading && <span className="text-[10px] text-[var(--color-text-muted)]">Analyzing…</span>}
          </div>

          {insights ? (
            <pre className="text-xs whitespace-pre-wrap text-[var(--color-text-muted)]">{insights}</pre>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">Add expenses to generate personalized insights.</p>
          )}
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Recent Expenses</h3>
            <Link to="/expenses" className="text-[10px] text-[var(--color-accent-strong)]">View all →</Link>
          </div>

          <div className="text-xs text-[var(--color-text-muted)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 mb-1">
              <span>Category</span>
              <span className="text-right">Amount</span>
              <span className="text-right hidden sm:block">Date</span>
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto">
              {recentExpenses.map((e) => (
                <div key={e._id} className="grid grid-cols-2 sm:grid-cols-3 py-1 border-b border-[var(--color-border-subtle)]/40 last:border-none">
                  <span className="truncate">{e.category}</span>
                  <span className="text-right">₹{e.amount}</span>
                  <span className="text-right">{new Date(e.date).toLocaleDateString()}</span>
                </div>
              ))}

              {recentExpenses.length === 0 && <p className="mt-2 text-[var(--color-text-muted)]">No recent expenses.</p>}
            </div>
          </div>
        </div>
      </section>

      {loading && <p className="text-[10px] text-[var(--color-text-muted)]">Loading data…</p>}
    </div>
  );
}
