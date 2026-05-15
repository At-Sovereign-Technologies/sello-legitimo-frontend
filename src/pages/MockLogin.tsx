import React from "react";
import { useNavigate } from "react-router-dom";
import { useMockAuth } from "../contexts/MockAuthContext";
import type { MockRole } from "../contexts/MockAuthContext";
import { storeAuthToken, generateMockToken, MOCK_ROLE_DOCUMENTS } from "../services/authService";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const ciudadanoRoles: { label: string; value: MockRole; description: string }[] = [
    {
        label: "Ciudadano",
        value: "CIUDADANO",
        description: "Consulta, votación y transparencia",
    },
    {
        label: "Votante",
        value: "VOTANTE",
        description: "Emisión de voto y verificación",
    },
];

const registraduriaRoles: { label: string; value: MockRole; description: string }[] = [
    {
        label: "Administrador RNEC",
        value: "ADMINISTRADOR",
        description: "Gestión completa del sistema electoral",
    },
    {
        label: "Super Administrador",
        value: "SUPERADMIN",
        description: "Reglas antifraude y configuración avanzada",
    },
    {
        label: "Delegado CNE",
        value: "DELEGADO_CNE",
        description: "Aprobación de reglas y resultados",
    },
    {
        label: "Auditor",
        value: "AUDITOR",
        description: "Revisión de actas y alertas de fraude",
    },
    {
        label: "Operador de Mesa",
        value: "OPERADOR",
        description: "Apertura de mesas y control de asistencia",
    },
    {
        label: "Magistrado",
        value: "MAGISTRADO",
        description: "Ceremonias de bóveda y supervisión",
    },
];

const MockLogin: React.FC = () => {
    const { setRole } = useMockAuth();
    const navigate = useNavigate();

    const handleSelectRole = (role: MockRole) => {
        if (!role) return;
        setRole(role);
        const doc = MOCK_ROLE_DOCUMENTS[role] || "10000001";
        localStorage.setItem("mockUserId", doc);
        storeAuthToken(generateMockToken(role, doc));
        navigate("/dashboard");
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <NavBar />
            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Simulador de Identidad
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Seleccione un rol para acceder al panel correspondiente.
                        En producción, cada rol requiere autenticación real con MFA.
                    </p>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-blue-700 mb-3">
                            Roles Ciudadanos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ciudadanoRoles.map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => handleSelectRole(r.value)}
                                    className="flex flex-col items-start p-6 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                                >
                                    <span className="text-xl font-semibold text-gray-800">
                                        {r.label}
                                    </span>
                                    <span className="text-sm text-gray-500 mt-1">
                                        {r.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-red-700 mb-3">
                            Roles Registraduría
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {registraduriaRoles.map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => handleSelectRole(r.value)}
                                    className="flex flex-col items-start p-6 bg-white border-2 border-red-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-left"
                                >
                                    <span className="text-xl font-semibold text-gray-800">
                                        {r.label}
                                    </span>
                                    <span className="text-sm text-gray-500 mt-1">
                                        {r.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MockLogin;