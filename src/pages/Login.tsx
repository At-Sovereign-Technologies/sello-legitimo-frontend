import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, User, ArrowRight, Loader2, KeyRound, ShieldAlert } from "lucide-react";
import { login, verifyMFA } from "../api/auth.api";
import { storeAuthToken } from "../services/authService";
import Footer from "../components/Footer";

type Step = "credentials" | "mfa_challenge";

export default function Login() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const roleHint = searchParams.get("role");

    const [step, setStep] = useState<Step>("credentials");
    const [documento, setDocumento] = useState("");
    const [password, setPassword] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mfaMessage, setMfaMessage] = useState<string | null>(null);

    const isCiudadano = roleHint === "ciudadano";

    const handleLogin = async () => {
        const doc = documento.trim();
        if (!doc) {
            setError("Ingrese su número de documento.");
            return;
        }
        if (!password.trim()) {
            setError("Ingrese su contraseña.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await login(doc, password);
            const status = result.status as string;

            if (status === "AUTHENTICATED") {
                const token = result.token as string;
                const user = (result.user as Record<string, unknown>) || {};
                const role = (user.rol as string) || "";
                const nombre = (user.nombreCompleto as string) || (user.nombre as string) || doc;
                storeAuthToken(token, nombre);
                if (role) {
                    localStorage.setItem("mockRole", role);
                }
                localStorage.setItem("mockUserId", doc);
                window.location.href = "/dashboard";
            } else if (status === "MFA_SETUP_REQUIRED") {
                const tempToken = result.token as string;
                storeAuthToken(tempToken, doc);
                window.location.href = "/perfil";
            } else if (status === "MFA_CHALLENGE") {
                const tempToken = result.token as string;
                storeAuthToken(tempToken, doc);
                setMfaMessage((result.message as string) || "Verifique su código MFA");
                setStep("mfa_challenge");
            } else {
                setError((result.message as string) || "Error al iniciar sesión");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    const handleMFAVerify = async () => {
        if (!otpCode.match(/^\d{6}$/)) {
            setError("Ingrese un código de 6 dígitos");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await verifyMFA(otpCode);
            const token = result.token as string;
            const user = (result.user as Record<string, unknown>) || {};
            const role = (user.rol as string) || "";
            const nombre = (user.nombreCompleto as string) || (user.nombre as string) || documento;
            storeAuthToken(token, nombre);
            if (role) {
                localStorage.setItem("mockRole", role);
            }
            window.location.href = "/dashboard";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Código inválido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
            <header className="bg-white border-b px-10 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => navigate("/")}
                        className="flex flex-col leading-tight text-left"
                    >
                        <span className="font-bold text-lg">Sello Legítimo</span>
                        <span className="text-red-500 text-xs font-semibold tracking-wide">
                            SISTEMA ELECTORAL COLOMBIANO
                        </span>
                    </button>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isCiudadano ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                        Portal {isCiudadano ? "Ciudadano" : "Registraduría"}
                    </span>
                </div>
            </header>

            <main className="flex-1 px-10 py-10">
                <div className="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">
                            Inicio de sesión
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {isCiudadano
                                ? "Acceda con su documento y contraseña para consultar información electoral."
                                : "Acceda con sus credenciales institucionales. Se requiere autenticación de dos factores."
                            }
                        </p>

                        {error && (
                            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {step === "credentials" && (
                            <>
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500">
                                        NÚMERO DE DOCUMENTO
                                    </label>
                                    <div className="flex items-center border rounded-lg px-3 py-3 mt-1 bg-white">
                                        <User size={16} className="text-gray-400 mr-2" />
                                        <input
                                            value={documento}
                                            onChange={(e) => setDocumento(e.target.value)}
                                            className="w-full outline-none"
                                            placeholder="Ingrese su número de identificación"
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="text-xs text-gray-500">
                                        CONTRASEÑA
                                    </label>
                                    <div className="flex items-center border rounded-lg px-3 py-3 mt-1 bg-white">
                                        <Lock size={16} className="text-gray-400 mr-2" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full outline-none"
                                            placeholder="Ingrese su contraseña"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className={`w-full text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60 ${isCiudadano ? "bg-blue-600 hover:bg-blue-700" : "bg-red-500 hover:bg-red-600"}`}
                                >
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            INGRESAR <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {step === "mfa_challenge" && (
                            <div className="border rounded-xl p-4 bg-white mb-4">
                                <div className="flex items-center gap-2 text-red-500 text-sm font-semibold mb-3">
                                    <ShieldAlert size={16} />
                                    AUTENTICACIÓN DE DOS FACTORES (MFA)
                                </div>
                                {mfaMessage && (
                                    <p className="text-xs text-gray-500 mb-2">{mfaMessage}</p>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
                                        <KeyRound size={16} className="text-gray-400 mr-2" />
                                        <input
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                            className="w-32 text-center tracking-widest outline-none"
                                            placeholder="000000"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleMFAVerify}
                                    disabled={loading || otpCode.length !== 6}
                                    className="mt-4 w-full bg-red-500 text-white py-2 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        "VERIFICAR CÓDIGO"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border text-center">
                            <div className="w-40 h-40 mx-auto border-2 border-red-300 rounded-full flex items-center justify-center mb-4">
                                <User size={40} className="text-gray-300" />
                            </div>
                            <span className={`text-white text-xs px-3 py-1 rounded-full ${isCiudadano ? "bg-blue-500" : "bg-red-500"}`}>
                                VISTA PREVIA
                            </span>
                            <p className="mt-4 font-semibold">
                                "Centre su rostro y parpadee"
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Asegúrese de estar en un lugar iluminado. El
                                parpadeo confirma la prueba de vida.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border">
                            <p className="text-sm font-semibold mb-3">
                                VERIFICACIONES DE SEGURIDAD
                            </p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>✔ Verificación de Elegibilidad</li>
                                <li>✔ Registro de Voto Único</li>
                                <li>✔ Cifrado de Sesión Punto a Punto</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}