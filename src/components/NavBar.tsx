import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import ComingSoonToast from "./ComingSoonToast";

export default function NavBar() {
    const navigate = useNavigate();
    const [showToast, setShowToast] = useState(false);
    const [isPreelectoralOpen, setIsPreelectoralOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isTransparenciaOpen, setIsTransparenciaOpen] = useState(false);
    const preelectoralRef = useRef<HTMLDivElement | null>(null);
    const configRef = useRef<HTMLDivElement | null>(null);
    const transparenciaRef = useRef<HTMLDivElement | null>(null);

    const navItems = [
        { label: "Consulta Ciudadana", path: "/consulta-ciudadano" },
        { label: "Resultados Electorales", path: "/resultados" },
        { label: "Elecciones Activas", path: "/elecciones" },
        { label: "Portal Roles", path: "/mock-login" },
    ];

    const transparenciaItems = [
        { label: "Página de Transparencia", path: "/transparencia" },
        { label: "Registro de Auditoría", path: "/auditoria" },
        { label: "Ciclo de Vida Acta E-14", path: "/acta-ciclo-vida" },
    ];

    const preelectoralItems = [
        { label: "Censo", path: "/censo/gestion" },
        { label: "Candidaturas", path: "/candidaturas/gestion" },
        { label: "Jurados", path: "/jurados/sorteo" },
    ];

    const configEleccionItems = [
        { label: "Parámetros Base", path: "/parametros-base" },
        { label: "Método Electoral", path: "/metodo-electoral" },
        { label: "Circunscripciones", path: "/circunscripciones" },
    ];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!preelectoralRef.current?.contains(event.target as Node)) {
                setIsPreelectoralOpen(false);
            }
            if (!configRef.current?.contains(event.target as Node)) {
                setIsConfigOpen(false);
            }
            if (!transparenciaRef.current?.contains(event.target as Node)) {
                setIsTransparenciaOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <nav className="flex justify-between items-center px-10 py-6 border-b bg-white">
                {/* Logo / Sello Legítimo → navega a la landing */}
                <button
                    onClick={() => navigate("/landing")}
                    className="flex flex-col leading-tight text-left"
                >
                    <span className="font-bold text-lg">Sello Legítimo</span>
                    <span className="text-red-500 text-xs font-semibold tracking-wide">
                        SISTEMA ELECTORAL COLOMBIANO
                    </span>
                </button>

                {/* Opciones del menú */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                    {navItems.map(({ label, path }) => (
                        <button
                            key={label}
                            onClick={() => navigate(path)}
                            className="hover:text-gray-900 text-gray-600 transition"
                        >
                            {label}
                        </button>
                    ))}

                    <div ref={transparenciaRef} className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setIsTransparenciaOpen((current) => !current)
                            }
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                            aria-haspopup="menu"
                            aria-expanded={isTransparenciaOpen}
                        >
                            Transparencia Electoral
                            <ChevronDown
                                size={14}
                                className={`transition ${isTransparenciaOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {isTransparenciaOpen && (
                            <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                                {transparenciaItems.map(({ label, path }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => {
                                            navigate(path);
                                            setIsTransparenciaOpen(false);
                                        }}
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div ref={preelectoralRef} className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setIsPreelectoralOpen((current) => !current)
                            }
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                            aria-haspopup="menu"
                            aria-expanded={isPreelectoralOpen}
                        >
                            Preelectoral
                            <ChevronDown
                                size={14}
                                className={`transition ${isPreelectoralOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {isPreelectoralOpen && (
                            <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                                {preelectoralItems.map(({ label, path }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => {
                                            navigate(path);
                                            setIsPreelectoralOpen(false);
                                        }}
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div ref={configRef} className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setIsConfigOpen((current) => !current)
                            }
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                            aria-haspopup="menu"
                            aria-expanded={isConfigOpen}
                        >
                            Configuración
                            <ChevronDown
                                size={14}
                                className={`transition ${isConfigOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {isConfigOpen && (
                            <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                                {configEleccionItems.map(({ label, path }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => {
                                            navigate(path);
                                            setIsConfigOpen(false);
                                        }}
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Votación Remota — deshabilitado temporalmente */}
                <button
                    disabled
                    onClick={() => setShowToast(true)}
                    className="bg-red-300 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed flex items-center gap-2"
                >
                    Votación Remota
                    <ArrowRight size={16} />
                </button>
            </nav>

            <ComingSoonToast
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                message="Esta función estará disponible próximamente."
            />
        </>
    );
}
