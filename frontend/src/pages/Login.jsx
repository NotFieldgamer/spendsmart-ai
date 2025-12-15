import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
  setLoading(true);
  const res = await axios.post(
    "http://localhost:5000/api/auth/login",
    { email, password }
  );
  login(res.data.token, res.data.user);
  nav("/");
} catch {
  setError("Invalid email or password");
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
          <h1 className="text-2xl font-semibold mt-4">Welcome back</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Sign in to your SpendSmart account
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
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)]
rounded-lg px-4 py-3 text-sm outline-none
focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right text-xs">
  <Link
    to="/forgot-password"
    className="text-emerald-400 hover:underline"
  >
    Forgot password?
  </Link>
</div>


          <button
  type="submit"
  disabled={loading}
  className="w-full mt-2 bg-gradient-to-r from-emerald-400 to-teal-500
  text-black font-semibold py-3 rounded-lg
  disabled:opacity-60 disabled:cursor-not-allowed transition"
>
  {loading ? "Signing in…" : "Sign In"}
</button>

        </form>

        <p className="text-sm text-center text-[var(--color-text-muted)] mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-emerald-400 hover:underline">
            Create one
          </Link>
        </p>
        <p className="text-sm text-centxer text-[var(--color-text-muted)] mt-6">
          
        </p>
      </div>
    </div>
  );
}
