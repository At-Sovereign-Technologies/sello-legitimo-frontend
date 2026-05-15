import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMockAuth } from "../contexts/MockAuthContext";
import { getDashboardResumen } from "../api/dashboard.api";
import { isAuthenticated, isMockAuth, getUserRole } from "../services/authService";
import { ROLE_LABELS, isCiudadanoRole } from "../contexts/MockAuthContext";
import type { MockRole } from "../contexts/MockAuthContext";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

import AuditorDashboard from "../components/dashboards/AuditorDashboard";
import InstitucionalDashboard from "../components/dashboards/InstitucionalDashboard";

const Dashboard: React.FC = () => {
    const { role: mockRole, logout } = useMockAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const role = mockRole || (getUserRole() as MockRole);
    const roleName = role ? (ROLE_LABELS[role] || role) : "";

    useEffect(() => {
        if (!isAuthenticated() && !isMockAuth()) {
            navigate("/login");
            return;
        }
        if (role === "ADMINISTRADOR" || role === "SUPERADMIN") {
            navigate("/gestion-reglas");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await getDashboardResumen();
                setData(result);
            } catch (err: any) {
                setError(err.message || "Error al cargar los datos del dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [role, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const renderDashboard = () => {
        if (loading) return <div className="text-center py-20">Cargando...</div>;
        if (error) return (
            <div className="text-center py-20">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border p-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Servicio no disponible</h3>
                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                    <p className="text-xs text-gray-400">El panel de control no pudo cargar datos en este momento. Use el menú de navegación para acceder a las distintas funcionalidades.</p>
                </div>
            </div>
        );
        if (!data && isCiudadanoRole(role)) {
            return (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Bienvenido, Ciudadano</h2>
                    <p className="text-gray-600 mb-6">Seleccione una opción del menú para comenzar.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        <button onClick={() => navigate("/consulta-ciudadano")} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 text-blue-800 font-medium transition">
                            Consultar Puesto de Votación
                        </button>
                        <button onClick={() => navigate("/elecciones")} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 text-green-800 font-medium transition">
                            Elecciones Activas
                        </button>
                    </div>
                </div>
            );
        }
        if (!data) return null;

        switch (role) {
            case "AUDITOR":
                return <AuditorDashboard data={data} />;
            case "DELEGADO_CNE":
            case "OPERADOR":
            case "MAGISTRADO":
            case "REGISTRADOR":
            case "CLAVERO":
                return <InstitucionalDashboard data={data} />;
            default:
                return <div>Rol no reconocido: {role}</div>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <NavBar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Panel de Control:{" "}
                        <span className="text-blue-600">{roleName}</span>
                    </h1>
                    <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold text-sm rounded hover:bg-gray-300 transition-colors">
                        Cerrar Sesión
                    </button>
                </div>
                {renderDashboard()}
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;