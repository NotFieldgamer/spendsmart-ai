import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-card border-b border-gray-800 p-4 flex justify-between items-center">
      <Link className="text-xl font-bold" to="/">
        SpendSmart AI
      </Link>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/expenses" className="hover:text-accent">Expenses</Link>
            <Link to="/goals" className="hover:text-accent">Goals</Link>
            <button
              onClick={logout}
              className="bg-danger/20 px-3 py-1 rounded border border-danger text-danger text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-accent">Login</Link>
            <Link to="/register" className="hover:text-accent">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
