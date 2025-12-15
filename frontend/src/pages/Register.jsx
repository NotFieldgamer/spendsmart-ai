import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
  setLoading(true);
  await axios.post("http://localhost:5000/api/auth/register", {
    name,
    email,
    password,
  });
  nav("/login");
} catch {
  setError("Registration failed. Email may already be in use.");
} finally {
  setLoading(false);
}

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-black font-bold text-xl">
            <img className="rounded-2xl"src="https://tse2.mm.bing.net/th/id/OIP.iE5wZ1GoLrwzbxnJ2pCIBwAAAA?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3" alt="" />
          </div>
          <h1 className="text-2xl font-semibold mt-4 tracking-tight">
  Create your account
</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Start tracking finances smarter
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
  className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)]
  rounded-lg px-4 py-3 text-sm outline-none
  focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
  placeholder="Full name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  autoComplete="name"
/>


          <input
  type="email"
  className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)]
  rounded-lg px-4 py-3 text-sm outline-none
  focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
  placeholder="Email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  autoComplete="email"
/>


         <input
  type="password"
  className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)]
  rounded-lg px-4 py-3 text-sm outline-none
  focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  autoComplete="new-password"
/>


          <button
  type="submit"
  disabled={loading}
  className="w-full mt-2 bg-gradient-to-r from-emerald-400 to-teal-500
  text-black font-semibold py-3 rounded-lg
  disabled:opacity-60 disabled:cursor-not-allowed transition"
>
  {loading ? "Creating account…" : "Create Account"}
</button>

        </form>

        <p className="text-sm text-center text-[var(--color-text-muted)] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
