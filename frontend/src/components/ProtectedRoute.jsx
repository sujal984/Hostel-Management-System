import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isAdminLoggedIn = localStorage.getItem("admin_logged_in") === "true";

  return isAdminLoggedIn ? children : <Navigate to="/Admin/login" replace />;
}

export default ProtectedRoute;
