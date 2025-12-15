import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  budget: "#0ea5e9",
  actual: "#22c55e",
  forecastOK: "#a855f7",
  forecastRisk: "#f97316",
  forecastDanger: "#ef4444",
};

export default function ExpenseForecastDonut({
  monthlyBudget,
  monthlySpend,
  forecastSpend,
}) {
  if (!monthlyBudget && !monthlySpend) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-4">
        <h3 className="text-sm font-semibold mb-1">AI Spend Forecast</h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Add a budget and expenses to see forecast.
        </p>
      </div>
    );
  }

  const budget = monthlyBudget || 0;
  const actual = monthlySpend || 0;
  const forecast = forecastSpend || actual;

  const riskRatio = budget > 0 ? forecast / budget : 0;
  const forecastColor =
    riskRatio < 0.8
      ? COLORS.forecastOK
      : riskRatio < 1.05
      ? COLORS.forecastRisk
      : COLORS.forecastDanger;

  const data = [
    { name: "Budget", value: budget, type: "budget" },
    { name: "Actual", value: actual, type: "actual" },
    { name: "Forecast", value: forecast, type: "forecast" },
  ];

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-4">
      <h3 className="text-sm font-semibold mb-3">AI Spend Forecast (this month)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={40}
            outerRadius={100}
            paddingAngle={4}
            label={(entry) =>
              entry.value > 0
                ? `${entry.name}: ₹${entry.value.toFixed(0)}`
                : ""
            }
          >
            {data.map((d, i) => {
              if (d.type === "budget") return <Cell key={i} fill={COLORS.budget} />;
              if (d.type === "actual") return <Cell key={i} fill={COLORS.actual} />;
              return <Cell key={i} fill={forecastColor} />;
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
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            formatter={(value) => (
              <span className="text-xs text-[var(--color-text-muted)]">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
        Forecast is based on your current daily average spend this month. It acts like an AI-style projection,
        even though it uses deterministic math.
      </p>
    </div>
  );
}
