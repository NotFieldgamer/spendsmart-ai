import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function Subscriptions() {
  const { token } = useContext(AuthContext);

  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [renewalDate, setrenewalDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/subscriptions",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ sort by upcoming renewal
      const sorted = res.data.sort(
        (a, b) =>
          new Date(a.renewalDate) - new Date(b.renewalDate)
      );

      setSubs(sorted);
    } finally {
      setLoading(false);
    }
  };

  const daysLeft = (date) => {
    const diff =
      (new Date(date).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  };

  const submitSubscription = async () => {
    if (!name || !amount) return;

    // ✅ prevent duplicates
    if (
      subs.some(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setError("Subscription already exists.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axios.post(
        "http://localhost:5000/api/subscriptions",
        {
          name,
          amount,
          renewalDate,
          source: "manual",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setName("");
      setAmount("");
      setrenewalDate(new Date().toISOString().slice(0, 10));
      setShowForm(false);

      load();
    } catch {
      setError("Failed to add subscription.");
    } finally {
      setSaving(false);
    }
  };

  const cancelSubscription = async (id) => {
    if (!confirm("Cancel this subscription?")) return;

    await axios.delete(
      `http://localhost:5000/api/subscriptions/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Subscriptions</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Manage recurring expenses.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-[var(--color-accent)] text-black font-semibold px-4 py-2 rounded-lg"
        >
          + Add subscription
        </button>
      </div>

      {/* Manual Add */}
      {showForm && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl p-6">
          <h3 className="font-semibold mb-4">Add Subscription</h3>

          {error && (
            <p className="mb-3 text-sm text-red-400">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg"
              placeholder="Service name (e.g. Netflix)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="number"
              className="bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg"
              placeholder="Monthly amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <input
              type="date"
              className="bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] p-3 rounded-lg"
              value={renewalDate}
              onChange={(e) => setrenewalDate(e.target.value)}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              disabled={saving}
              onClick={submitSubscription}
              className="bg-[var(--color-accent)] text-black font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-[var(--color-text-muted)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cards */}
      {loading && (
        <p className="text-sm text-[var(--color-text-muted)]">
          Loading subscriptions…
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subs.map((s) => {
          const left = daysLeft(s.renewalDate);
          const danger = left <= 3;

          return (
            <div
              key={s._id}
              className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{s.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                    {s.source === "auto" ? "AI detected" : "Manual"}
                  </span>
                </div>

                <p className="text-3xl font-bold mt-3">
                  ₹{s.amount}
                  <span className="text-xs font-normal text-[var(--color-text-muted)]">
                    /month
                  </span>
                </p>

                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  Renews on{" "}
                  {new Date(s.renewalDate).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    danger
                      ? "bg-red-500/15 text-red-400"
                      : "bg-teal-500/10 text-teal-400"
                  }`}
                >
                  {left} days left
                </span>

                <button
                  onClick={() => cancelSubscription(s._id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
