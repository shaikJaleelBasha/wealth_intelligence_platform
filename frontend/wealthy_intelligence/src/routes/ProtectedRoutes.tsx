import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: string;
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user } = useAuth();

  // not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // FIX HERE 👇
  const userRole = user.role_name;

  if (role && userRole !== role) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
