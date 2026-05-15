import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, Lock, Loader2, AlertCircle } from "lucide-react";
import UserMenu from "../components/UserMenu";
import ProfileInfo from "../components/profile/ProfileInfo";
import MFASetup from "../components/profile/MFASetup";
import BovedaKeys from "../components/profile/BovedaKeys";
import { getMe } from "../api/security.api";
import {
    isAuthenticated,
    isMockAuth,
    getMockRole,
} from "../services/authService";
import type { UserProfile } from "../types/security";

type Tab = "perfil" | "seguridad" | "boveda";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "seguridad", label: "Seguridad MFA", icon: Shield },
    { id: "boveda", label: "Mis Claves", icon: Lock },
];

function makeMockProfile(role: string): UserProfile {
    return {
        numeroDocumento: "DEMO-000",
        nombre: `Usuario ${role}`,
        telefono: "3100000000",
        correo: `demo@${role.toLowerCase()}.gov.co`,
        rol: role,
        mfaEnabled: false,
        mfaMethod: "NONE",
    };
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("perfil");
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirigir si no está autenticado
        if (!isAuthenticated() && !isMockAuth()) {
            navigate("/login", { replace: true });
            return;
        }

        async function loadProfile() {
            if (isMockAuth()) {
                const role = getMockRole() || "AUDITOR";
                setProfile(makeMockProfile(role));
                setLoading(false);
                return;
            }

            try {
                const data = await getMe();
                setProfile(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error al cargar perfil");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [navigate]);

    // Determinar si el usuario debe ver la pestaña Seguridad
    const showSeguridad = () => {
        if (!profile) return false;
        const rol = profile.rol?.toUpperCase() || "";
        return rol !== "CIUDADANO";
    };

    // Determinar si el usuario puede usar la bóveda
    const showBoveda = () => {
        if (!profile) return false;
        const rol = profile.rol?.toUpperCase() || "";
        return rol === "MAGISTRADO" || rol === "CLAVERO";
    };

    // Filtrar pestañas según el rol
    const visibleTabs = TABS.filter((tab) => {
        if (tab.id === "seguridad") return showSeguridad();
        if (tab.id === "boveda") return showBoveda();
        return true;
    });

    // Cambiar automáticamente si la pestaña actual se oculta
    useEffect(() => {
        if (activeTab === "seguridad" && !showSeguridad()) {
            setActiveTab("perfil");
        }
        if (activeTab === "boveda" && !showBoveda()) {
            setActiveTab("perfil");
        }
    }, [profile]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={16} />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 h-full">

            {/* Encabezado */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>
                        <p className="text-sm text-gray-500">
                            Gestione su información y seguridad
                        </p>
                    </div>
                    <UserMenu />
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-6">
                <div className="flex flex-col gap-6 md:flex-row">
                    {/* Pestañas laterales */}
                    <nav className="shrink-0 md:w-56">
                        <div className="space-y-1">
                            {visibleTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                                            isActive
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Insignia de rol */}
                        {profile && (
                            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-3">
                                <p className="text-xs text-gray-500">Rol asignado</p>
                                <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                    {profile.rol}
                                </span>
                            </div>
                        )}
                    </nav>

                    {/* Contenido */}
                    <main className="flex-1">
                        {activeTab === "perfil" && profile && (
                            <ProfileInfo profile={profile} />
                        )}
                        {activeTab === "seguridad" && profile && showSeguridad() && (
                            <MFASetup
                                profile={profile}
                                onProfileUpdate={setProfile}
                            />
                        )}
                        {activeTab === "boveda" && showBoveda() && <BovedaKeys />}
                        {activeTab === "boveda" && !showBoveda() && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                                <Shield size={32} className="mx-auto text-amber-500" />
                                <h3 className="mt-3 text-sm font-semibold text-amber-800">
                                    Acceso restringido
                                </h3>
                                <p className="mt-1 text-xs text-amber-700">
                                    La gestión de la bóveda de seguridad está disponible únicamente
                                    para Magistrados y Claveros.
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    Rol actual: <span className="font-medium">{profile?.rol}</span>
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
