import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { auth, isAuthenticated, isAdmin } = useApp();
  const location = useLocation();

  if (auth.loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
