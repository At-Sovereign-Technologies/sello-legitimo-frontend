import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, isMockAuth } from "../services/authService";

export default function ProtectedRoute() {
    const authenticated = isAuthenticated() || isMockAuth();
    return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}