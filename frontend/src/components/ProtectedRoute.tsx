import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-stone-100 px-4 text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
        Loading your dashboard...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
