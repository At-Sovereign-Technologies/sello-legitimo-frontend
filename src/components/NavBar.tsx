import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useMockAuth } from "../contexts/MockAuthContext";
import { isAuthenticated, isMockAuth, getUserRole } from "../services/authService";
import { ROLE_LABELS, isCiudadanoRole, isRegistraduriaRole } from "../contexts/MockAuthContext";
import type { MockRole } from "../contexts/MockAuthContext";

function effectiveRole(): MockRole {
    const stored = localStorage.getItem("mockRole") as MockRole;
    if (stored) return stored;
    const fromToken = getUserRole();
    if (fromToken) return fromToken as MockRole;
    return null;
}

function isLoggedIn(): boolean {
    return isAuthenticated() || isMockAuth();
}

export default function NavBar() {
    const navigate = useNavigate();
    const { role: contextRole, logout: mockLogout } = useMockAuth();
    const [isIngresarOpen, setIsIngresarOpen] = useState(false);
    const [isTransparenciaOpen, setIsTransparenciaOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isFraudeOpen, setIsFraudeOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const ingresarRef = useRef<HTMLDivElement | null>(null);
    const transparenciaRef = useRef<HTMLDivElement | null>(null);
    const configRef = useRef<HTMLDivElement | null>(null);
    const fraudeRef = useRef<HTMLDivElement | null>(null);
    const profileRef = useRef<HTMLDivElement | null>(null);

    const role = contextRole || effectiveRole();
    const authenticated = isLoggedIn();
    const roleName = role ? (ROLE_LABELS[role] || role) : "";

    const ciudadanoNavItems = [
        { label: "Mi Puesto de Votación", path: "/consulta-ciudadano" },
        { label: "Elecciones Activas", path: "/elecciones" },
        { label: "Resultados", path: "/resultados" },
        { label: "Transparencia", path: "/transparencia" },
        { label: "Mi Perfil", path: "/perfil" },
    ];

    const registraduriaNavItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Censo", path: "/censo/gestion" },
        { label: "Candidaturas", path: "/candidaturas/gestion" },
        { label: "Jurados", path: "/jurados/sorteo" },
    ];

    const navItems = authenticated
        ? isCiudadanoRole(role)
            ? ciudadanoNavItems
            : isRegistraduriaRole(role)
              ? registraduriaNavItems
              : []
        : [];

    const transparenciaItems = [
        { label: "Página de Transparencia", path: "/transparencia" },
    ];

    const configEleccionItems = [
        { label: "Parámetros Base", path: "/parametros-base" },
        { label: "Método Electoral", path: "/metodo-electoral" },
        { label: "Circunscripciones", path: "/circunscripciones" },
    ];

    const fraudeItems = [
        { label: "Alertas", path: "/fraude/alertas" },
        { label: "Reportar Evento", path: "/fraude/reportar" },
        { label: "Métricas", path: "/fraude/metricas" },
        { label: "Catálogo Tipologías", path: "/fraude/catalogo-tipologias" },
        { label: "Gestión Casos", path: "/fraude/gestion-casos" },
        { label: "Reglas Antifraude", path: "/gestion-reglas" },
        { label: "Evaluación Antifraude", path: "/evaluacion-antifraude" },
        { label: "Bandeja Aprobación", path: "/bandeja-aprobacion" },
    ];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!ingresarRef.current?.contains(event.target as Node)) setIsIngresarOpen(false);
            if (!transparenciaRef.current?.contains(event.target as Node)) setIsTransparenciaOpen(false);
            if (!configRef.current?.contains(event.target as Node)) setIsConfigOpen(false);
            if (!fraudeRef.current?.contains(event.target as Node)) setIsFraudeOpen(false);
            if (!profileRef.current?.contains(event.target as Node)) setIsProfileOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        mockLogout();
        navigate("/");
    };

    return (
        <>
            <nav className="flex justify-between items-center px-10 py-4 border-b bg-white">
                <button
                    onClick={() => navigate(authenticated ? "/dashboard" : "/")}
                    className="flex flex-col leading-tight text-left"
                >
                    <span className="font-bold text-lg">Sello Legítimo</span>
                    <span className="text-red-500 text-xs font-semibold tracking-wide">
                        SISTEMA ELECTORAL COLOMBIANO
                    </span>
                </button>

                <div className="hidden md:flex items-center gap-4 text-sm">
                    {authenticated ? (
                        <>
                            {navItems.map(({ label, path }) => (
                                <button
                                    key={label}
                                    onClick={() => navigate(path)}
                                    className="hover:text-gray-900 text-gray-600 transition"
                                >
                                    {label}
                                </button>
                            ))}

                            {isRegistraduriaRole(role) && (
                                <>
                                    <div ref={transparenciaRef} className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsTransparenciaOpen((c) => !c)}
                                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                                        >
                                            Transparencia <ChevronDown size={14} className={`transition ${isTransparenciaOpen ? "rotate-180" : ""}`} />
                                        </button>
                                        {isTransparenciaOpen && (
                                            <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                                                {transparenciaItems.map(({ label, path }) => (
                                                    <button key={label} type="button" onClick={() => { navigate(path); setIsTransparenciaOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900">
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div ref={configRef} className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsConfigOpen((c) => !c)}
                                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                                        >
                                            Configuración <ChevronDown size={14} className={`transition ${isConfigOpen ? "rotate-180" : ""}`} />
                                        </button>
                                        {isConfigOpen && (
                                            <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                                                {configEleccionItems.map(({ label, path }) => (
                                                    <button key={label} type="button" onClick={() => { navigate(path); setIsConfigOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900">
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div ref={fraudeRef} className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsFraudeOpen((c) => !c)}
                                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                                        >
                                            Fraude <ChevronDown size={14} className={`transition ${isFraudeOpen ? "rotate-180" : ""}`} />
                                        </button>
                                        {isFraudeOpen && (
                                            <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                                                {fraudeItems.map(({ label, path }) => (
                                                    <button key={label} type="button" onClick={() => { navigate(path); setIsFraudeOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900">
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-3 ml-2">
                                <div ref={profileRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsProfileOpen((c) => !c)}
                                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 text-sm transition cursor-pointer"
                                    >
                                        <User size={14} className="text-gray-500" />
                                        <span className="font-medium text-gray-700">{roleName}</span>
                                        <ChevronDown size={12} className={`text-gray-400 transition ${isProfileOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    {isProfileOpen && (
                                        <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                                            <button
                                                type="button"
                                                onClick={() => { setIsProfileOpen(false); navigate("/perfil"); }}
                                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                                            >
                                                Mi Perfil
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                            >
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium transition"
                                >
                                    <LogOut size={14} />
                                    Salir
                                </button>
                            </div>
                        </>
                    ) : (
                        <div ref={ingresarRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsIngresarOpen((c) => !c)}
                                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 font-medium"
                                aria-haspopup="menu"
                                aria-expanded={isIngresarOpen}
                            >
                                Ingresar
                                <ChevronDown
                                    size={14}
                                    className={`transition ${isIngresarOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {isIngresarOpen && (
                                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsIngresarOpen(false);
                                            navigate("/login?role=ciudadano");
                                        }}
                                        className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <span className="font-medium">Ciudadano</span>
                                        <span className="block text-xs text-gray-400 mt-0.5">
                                            Consulta y votación
                                        </span>
                                    </button>
                                    <div className="my-1 border-t border-gray-100" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsIngresarOpen(false);
                                            navigate("/login?role=registraduria");
                                        }}
                                        className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-red-50 hover:text-red-700"
                                    >
                                        <span className="font-medium">Registraduría</span>
                                        <span className="block text-xs text-gray-400 mt-0.5">
                                            Gestión electoral
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}