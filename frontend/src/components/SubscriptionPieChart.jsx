import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Clean palette for dark UI
const COLORS = [
  "#4ADE80", // green
  "#2DD4BF", // teal
  "#60A5FA", // blue
  "#A78BFA", // purple
  "#F472B6", // pink
  "#FBBF24", // amber
  "#FB7185", // rose
  "#38BDF8", // sky
  "#34D399", // emerald
  "#F87171", // red
];

export default function SubscriptionPieChart({ data }) {
  const formattedData = data.map((item, i) => ({
    name: `${item.name} – ₹${item.amount}`,
    value: Number(item.amount),
  }));

  return (
    <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl">
      <h3 className="text-sm font-semibold mb-3">
        Subscription Cost Breakdown
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            nameKey="name"
            paddingAngle={3}
          >
            {formattedData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              background: "var(--color-surface-soft)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "8px",
            }}
            formatter={(v) => [`₹${v}`, "Amount"]}
          />

          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => (
              <span className="text-xs text-[var(--color-text-muted)]">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
