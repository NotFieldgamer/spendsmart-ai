import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartContainer from "./ChartContainer";

export default function LineChartDaily({ data }) {
  if (!data.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-4">
        <h3 className="text-sm font-semibold mb-1">Daily Spend</h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Once you have activity this month, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-4">
      <h3 className="text-sm font-semibold mb-4">Daily Spend (30 days)</h3>
      <div className="h-64">
      <ChartContainer height={280}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb40" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#22c55e"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
