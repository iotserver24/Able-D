// app/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useIsAuthenticated(); // MSAL hook

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
