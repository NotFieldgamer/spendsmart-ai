import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#22c55e",
  "#0ea5e9",
  "#eab308",
  "#ec4899",
  "#a855f7",
  "#14b8a6",
  "#f97316",
  "#f43f5e",
];

export default function ExpenseBudgetDonut({ data }) {
  if (!data.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-4">
        <h3 className="text-sm font-semibold mb-1">Budget vs Spend</h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Create budgets and add expenses to see comparison.
        </p>
      </div>
    );
  }

  const budgetData = data.map((d) => ({
    name: d.category,
    value: d.limitAmount,
  }));

  const spendData = data.map((d) => ({
    name: d.category,
    value: d.spendAmount,
  }));

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-4">
      <h3 className="text-sm font-semibold mb-3">Budget vs Spend (per category)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          {/* Outer: budget */}
          <Pie
            data={budgetData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            innerRadius={70}
            paddingAngle={2}
          >
            {budgetData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.35} />
            ))}
          </Pie>
          {/* Inner: actual spend */}
          <Pie
            data={spendData}
            dataKey="value"
            nameKey="name"
            outerRadius={70}
            innerRadius={40}
            paddingAngle={2}
            label={(entry) =>
              entry.value > 0
                ? `${entry.name}: ₹${entry.value.toFixed(0)}`
                : ""
            }
          >
            {spendData.map((d, i) => {
              const over =
                d.value > (budgetData[i]?.value || 0) && (budgetData[i]?.value || 0) > 0;
              return (
                <Cell
                  key={i}
                  fill={over ? "#f97373" : COLORS[i % COLORS.length]}
                />
              );
            })}
          </Pie>

          <Tooltip
            contentStyle={{
              background: "var(--color-surface-soft)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "8px",
            }}
            formatter={(v, name) => [`₹${v}`, name]}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => (
              <span className="text-xs text-[var(--color-text-muted)]">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
