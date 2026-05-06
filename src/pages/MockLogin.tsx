import React from "react";
import { useNavigate } from "react-router-dom";
import { useMockAuth } from "../contexts/MockAuthContext";
import type { MockRole } from "../contexts/MockAuthContext";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const roles: { label: string; value: MockRole; description: string }[] = [
    {
        label: "Candidato",
        value: "CANDIDATO",
        description: "Monitor de votos y mesas",
    },
    {
        label: "Testigo Electoral",
        value: "TESTIGO",
        description: "Cobertura y escrutinio",
    },
    {
        label: "Auditor / MOE",
        value: "AUDITOR",
        description: "Revisión de actas y alertas",
    },
    {
        label: "Delegado CNE",
        value: "DELEGADO_CNE",
        description: "Resultados consolidados",
    },
    {
        label: "Delegado Fiscalía",
        value: "FISCALIA",
        description: "Mapa de incidentes y fraude",
    },
];

const MockLogin: React.FC = () => {
    const { setRole } = useMockAuth();
    const navigate = useNavigate();

    const handleSelectRole = (role: MockRole) => {
        setRole(role);
        navigate("/dashboard");
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <NavBar />
            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Simulador de Identidad (Mock Login)
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Seleccione un rol para acceder a su panel
                        correspondiente según los permisos M4.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {roles.map((r) => (
                            <button
                                key={r.value}
                                onClick={() => handleSelectRole(r.value)}
                                className="flex flex-col items-start p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left focus:outline-none focus:ring-4 focus:ring-blue-200"
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
            </main>
            <Footer />
        </div>
    );
};

export default MockLogin;
