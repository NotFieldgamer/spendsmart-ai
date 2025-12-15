import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Layout from "../layout/Layout";

export default function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
}
