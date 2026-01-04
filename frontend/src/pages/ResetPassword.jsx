import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export default function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();
  const [password, setPassword] = useState("");

  const strength =
    password.length < 6 ? "Weak" :
    password.match(/[A-Z]/) && password.match(/[0-9]/) ? "Strong" : "Medium";

  const submit = async (e) => {
    e.preventDefault();
    await axios.post(
      `${API_BASE_URL}/api/auth/reset-password/${token}`,
      { password }
    );
    nav("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="bg-[var(--color-surface)] p-8 rounded-xl w-96">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

        <input
          type="password"
          className="w-full p-3 rounded bg-[var(--color-surface-soft)]"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="text-xs mt-2">
          Strength: <span className={
            strength === "Strong" ? "text-emerald-400" :
            strength === "Medium" ? "text-yellow-400" : "text-red-400"
          }>
            {strength}
          </span>
        </div>

        <button className="w-full mt-4 bg-emerald-400 py-2 rounded">
          Reset Password
        </button>
      </form>
    </div>
  );
}
