import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMockAuth } from "../contexts/MockAuthContext";
import { getDashboardResumen } from "../api/dashboard.api";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

import CandidatoDashboard from "../components/dashboards/CandidatoDashboard";
import TestigoDashboard from "../components/dashboards/TestigoDashboard";
import AuditorDashboard from "../components/dashboards/AuditorDashboard";
import InstitucionalDashboard from "../components/dashboards/InstitucionalDashboard";

const Dashboard: React.FC = () => {
    const { role, logout } = useMockAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!role) {
            navigate("/mock-login");
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await getDashboardResumen();
                setData(result);
            } catch (err: any) {
                setError(
                    err.message || "Error al cargar los datos del dashboard",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [role, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/mock-login");
    };

    const renderDashboard = () => {
        if (loading)
            return <div className="text-center py-20">Cargando...</div>;
        if (error)
            return (
                <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    {error}
                </div>
            );
        if (!data) return null;

        switch (role) {
            case "CANDIDATO":
                return <CandidatoDashboard data={data} />;
            case "TESTIGO":
                return <TestigoDashboard data={data} />;
            case "AUDITOR":
                return <AuditorDashboard data={data} />;
            case "DELEGADO_CNE":
            case "FISCALIA":
                return <InstitucionalDashboard data={data} role={role} />;
            default:
                return <div>Rol no reconocido</div>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <NavBar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Panel de Control:{" "}
                        <span className="text-blue-600">{role}</span>
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold text-sm rounded hover:bg-gray-300 transition-colors"
                    >
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
