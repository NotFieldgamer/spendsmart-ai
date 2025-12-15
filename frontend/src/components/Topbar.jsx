import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";
import {
  Search,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

export default function Topbar({onMenuClick}) {
  const { theme, cycleTheme } = useContext(ThemeContext);
  const { user, logout, token } = useContext(AuthContext);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const themeIcon =
    theme === "dark" ? <Moon size={16} /> :
    theme === "light" ? <Sun size={16} /> :
    <Monitor size={16} />;

  const themeLabel =
    theme === "system" ? "Auto" :
    theme === "dark" ? "Dark" : "Light";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-16 sticky top-0 z-30 bg-[var(--color-surface)]/90 backdrop-blur border-b border-[var(--color-border-subtle)] flex items-center justify-between px-6">
      
      {/* LEFT */}
      <div className="flex items-center gap-3">
  {/* Mobile menu */}
  <button
    onClick={onMenuClick}
    className="lg:hidden p-2 rounded-lg bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)]"
  >
    ☰
  </button>

  <div>
    <h1 className="text-base md:text-lg font-semibold tracking-tight">
      Dashboard
    </h1>
    <p className="hidden md:block text-xs text-[var(--color-text-muted)]">
      Track budgets, expenses, and goals with AI insights.
    </p>
  </div>
</div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] rounded-full px-3 py-1.5 text-sm text-[var(--color-text-muted)]">
          <Search size={14} className="opacity-60" />
          <input
            placeholder="Search…"
            className="bg-transparent outline-none w-48"
          />
        </div>

        {/* Notifications (single source of truth ✅) */}
        <NotificationBell token={token} />

        {/* Theme switch */}
        <button
          onClick={cycleTheme}
          className="flex items-center gap-2 bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] px-3 py-1.5 rounded-full text-xs hover:bg-[var(--color-primary-soft)] transition"
        >
          {themeIcon}
          <span>{themeLabel}</span>
        </button>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] px-3 py-1.5 rounded-full text-xs hover:bg-[var(--color-primary-soft)] transition"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center font-semibold text-[var(--color-accent-strong)]">
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-xl p-2 z-50">
              <p className="px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)]">
                Signed in as {user?.name}
              </p>

              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--color-primary-soft)] transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
