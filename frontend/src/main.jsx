import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

// ✅ Service worker (OK)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" />

        {/* Outer background */}
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-main)] flex justify-center items-stretch">
          {/* Framed app card */}
          <div className="w-full max-w-6xl min-h-screen bg-[var(--color-surface-soft)] shadow-xl border-x border-[var(--color-border-subtle)]">
            <App />
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
