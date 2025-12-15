import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllAlerts } from "../api/subscriptions";

export default function NotificationBell({ token }) {
  const [alerts, setAlerts] = useState([]);
  const [trialAlerts, setTrialAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getAllAlerts(token);
    setAlerts(res.data.alerts);
    setTrialAlerts(res.data.trialAlerts);

    const total = res.data.alerts.length + res.data.trialAlerts.length;
    setUnread(total);
  };

  const markAllRead = () => {
    setUnread(0);
  };

  const allAlerts = [
    ...alerts.map((a) => ({ ...a, _type: "renewal" })),
    ...trialAlerts.map((a) => ({ ...a, _type: "trial" })),
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-full hover:bg-[var(--color-surface-soft)]"
      >
        <Bell size={18} />

        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 mt-2 w-72 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl shadow-xl p-3 z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Alerts</p>

              <button
                onClick={markAllRead}
                className="text-[10px] px-2 py-1 bg-[var(--color-primary-soft)] rounded-full text-[var(--color-accent-strong)] flex items-center gap-1"
              >
                <Check size={12} /> Mark all read
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
              {allAlerts.length === 0 && (
                <p className="text-[var(--color-text-muted)] text-xs">
                  No alerts.
                </p>
              )}

              {allAlerts.map((a, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg border ${
                    a._type === "trial"
                      ? "border-blue-500/50 bg-blue-500/10"
                      : a.severity === "high"
                      ? "border-red-500/60 bg-red-500/10"
                      : "border-yellow-500/40 bg-yellow-500/10"
                  }`}
                >
                  <p className="font-semibold">{a.name}</p>

                  {a._type === "trial" ? (
                    <p>{a.message}</p>
                  ) : (
                    <>
                      {a.type === "upcoming" && (
                        <p>
                          Renews in {a.daysLeft} days — ₹{a.amount}
                        </p>
                      )}
                      {a.type === "overdue" && (
                        <p>
                          Overdue by {a.daysLate} days — ₹{a.amount}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
