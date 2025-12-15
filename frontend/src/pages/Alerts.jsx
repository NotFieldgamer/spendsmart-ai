import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Alerts() {
  const { token } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:5000/api/alerts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // ✅ BACKEND RETURNS ARRAY
        setAlerts(res.data);
      })
      .catch((err) => {
        console.error("Alerts fetch failed:", err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Loading alerts…
      </p>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl p-6">
        <p className="text-sm text-[var(--color-text-muted)]">
          No alerts yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Alerts</h1>

      {alerts.map((a) => (
        <div
          key={a._id}
          className={`border rounded-xl p-4 ${
            a.severity === "critical"
              ? "border-red-500/40 bg-red-500/10"
              : a.severity === "warning"
              ? "border-yellow-500/40 bg-yellow-500/10"
              : "border-[var(--color-border-subtle)] bg-[var(--color-surface)]"
          }`}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold">{a.title}</h3>
            <span className="text-xs opacity-70 capitalize">
              {a.type}
            </span>
          </div>

          <p className="text-sm mt-1 opacity-80">{a.message}</p>
        </div>
      ))}
    </div>
  );
}
