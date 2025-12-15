import { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../api/goals";
import { Link } from "react-router-dom";

export default function Goals() {
  const { token, user } = useContext(AuthContext);

  const [goals, setGoals] = useState([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await getGoals(token);
    setGoals(res.data);
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    if (editingId) {
      await updateGoal(token, editingId, {
        name,
        targetAmount,
        currentAmount,
      });
    } else {
      await createGoal(token, {
        name,
        targetAmount,
        currentAmount,
      });
    }

    resetForm();
    load();
  };

  const startEdit = (g) => {
    setEditingId(g._id);
    setName(g.name);
    setTargetAmount(g.targetAmount);
    setCurrentAmount(g.currentAmount);
  };

  const remove = async (id) => {
    await deleteGoal(token, id);
    load();
  };

  const totalTarget = useMemo(
    () => goals.reduce((sum, g) => sum + Number(g.targetAmount || 0), 0),
    [goals]
  );

  const totalProgress = useMemo(
    () => goals.reduce((sum, g) => sum + Number(g.currentAmount || 0), 0),
    [goals]
  );

  const percentComplete =
    totalTarget > 0
      ? Math.min(100, Math.round((totalProgress / totalTarget) * 100))
      : 0;

  return (
    <div className="space-y-6">

      {/* =============== OVERVIEW WIDGET =============== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 rounded-[var(--radius-xl)]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Goals Overview</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-accent-strong)]">
            {goals.length} goals
          </span>
        </div>

        <p className="text-xs text-[var(--color-text-muted)] mb-2">
          {totalProgress.toFixed(2)} saved toward {totalTarget.toFixed(2)}.
        </p>

        <div className="w-full bg-[var(--color-surface-soft)] rounded-full h-2 mb-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          Overall completion rate: {percentComplete}%
        </p>
      </div>

      {/* =============== CREATE / EDIT GOAL WIDGET =============== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 rounded-[var(--radius-xl)]">
        <h3 className="text-sm font-semibold mb-4">
          {editingId ? "Edit Goal" : "Create New Goal"}
        </h3>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg"
            placeholder="Goal Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg"
            placeholder="Target Amount"
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
          />

          <input
            className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg"
            placeholder="Current Amount"
            type="number"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
          />
        </form>

        <div className="flex gap-3 mt-4">
          <button
            className="bg-[var(--color-accent)] text-black font-semibold px-4 py-2 rounded-lg"
            onClick={submit}
          >
            {editingId ? "Update Goal" : "Add Goal"}
          </button>

          {editingId && (
            <button
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* =============== GOALS LIST WIDGET =============== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 rounded-[var(--radius-xl)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Your Goals</h3>
        </div>

        {goals.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">
            No goals yet.
          </p>
        )}

        <div className="space-y-3">
          {goals.map((g) => {
            const percent =
              g.targetAmount > 0
                ? Math.min(
                    100,
                    Math.round((g.currentAmount / g.targetAmount) * 100)
                  )
                : 0;

            return (
              <div
                key={g._id}
                className="border border-[var(--color-border-subtle)] p-4 rounded-xl bg-[var(--color-surface-soft)]"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{g.name}</h4>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {percent}%
                  </span>
                </div>

                <div className="w-full bg-[var(--color-surface)] rounded-full h-2 my-2 overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <p className="text-xs text-[var(--color-text-muted)]">
                  {g.currentAmount} / {g.targetAmount}
                </p>

                <div className="flex gap-4 mt-3 text-xs">
                  <button
                    onClick={() => startEdit(g)}
                    className="text-[var(--color-accent-strong)] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(g._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <p className="text-[10px] text-[var(--color-text-muted)]">
          Loading goals...
        </p>
      )}
    </div>
  );
}
