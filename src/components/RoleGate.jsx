import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function RoleGate({ allow }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    return <Navigate to="/role-selection" replace />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
