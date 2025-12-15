import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    // UI-only for now
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-8 shadow-xl">
        
        {!submitted ? (
          <>
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-black">
                <Mail size={22} />
              </div>

              <h1 className="text-2xl font-semibold mt-4">
                Forgot your password?
              </h1>

              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Enter your email and we’ll send reset instructions.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              <input
                type="email"
                required
                className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold py-3 rounded-lg"
              >
                Send reset link
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                ✓
              </div>

              <h2 className="text-lg font-semibold">
                Check your email
              </h2>

              <p className="text-sm text-[var(--color-text-muted)]">
                If an account exists for <span className="font-medium">{email}</span>,
                you’ll receive reset instructions shortly.
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:underline"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
