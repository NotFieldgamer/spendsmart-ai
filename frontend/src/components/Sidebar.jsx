import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  Wallet,
  Target,
  Brain,
  PieChart,
} from "lucide-react";

const linkBase =
  "flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-200";
const iconBase = "w-5 h-5";

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/expenses", label: "Expenses", icon: Wallet },
    { to: "/budgets", label: "Budgets", icon: PieChart },
    { to: "/subscriptions", label: "Subscriptions", icon: Wallet },
    { to: "/goals", label: "Goals", icon: Target },
    { to: "/insights", label: "Insights", icon: Brain, disabled: true },
  ];

  return (
    <aside className="w-64 h-screen bg-[var(--color-surface)] border-r border-[var(--color-border-subtle)] flex flex-col">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center font-bold text-[var(--color-accent-strong)]">
            S
          </div>
          <div>
            <p className="font-semibold leading-tight tracking-tight">
              SpendSmart AI
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Finance companion
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  linkBase,
                  isActive
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent-strong)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-main)]",
                  link.disabled ? "opacity-50 pointer-events-none" : "",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`${iconBase} ${
                      isActive
                        ? "text-[var(--color-accent-strong)]"
                        : "text-[var(--color-text-muted)]"
                    }`}
                  />
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-5 py-4 border-t border-[var(--color-border-subtle)]">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center text-sm font-semibold">
              {user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-muted)]">
            Not logged in
          </p>
        )}
      </div>
    </aside>
  );
}
