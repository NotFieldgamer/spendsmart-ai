import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#22c55e", "#0ea5e9", "#eab308", "#ec4899", "#a855f7", "#14b8a6"];

export default function BudgetAllocationChart({ data }) {
  if (!data.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-4">
        <h3 className="text-sm font-semibold mb-1">Budget Allocation</h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Create budgets to see how your money is allocated.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-4"
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <h3 className="text-sm font-semibold mb-4">Budget Allocation</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="limitAmount"
              nameKey="category"
              outerRadius={100}
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
