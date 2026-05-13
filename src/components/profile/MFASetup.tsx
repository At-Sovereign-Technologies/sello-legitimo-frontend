import { useState } from "react";
import { Shield, QrCode, CheckCircle, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { setupMFA, verifyMFA } from "../../api/security.api";
import type { UserProfile } from "../../types/security";

interface MFASetupProps {
    profile: UserProfile;
    onProfileUpdate: (updated: UserProfile) => void;
}

export default function MFASetup({ profile, onProfileUpdate }: MFASetupProps) {
    const [step, setStep] = useState<"idle" | "setup" | "verify">("idle");
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSetup = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await setupMFA();
            setStep("verify");
            setSuccess("MFA configurado. Ahora verifique con un código de 6 dígitos.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al configurar MFA");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!otpCode.match(/^\d{6}$/)) {
            setError("Ingrese un código de 6 dígitos");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await verifyMFA(otpCode);
            if (result.token) {
                localStorage.setItem("auth_token", result.token);
            }
            onProfileUpdate({ ...profile, mfaEnabled: true, mfaMethod: "TOTP" });
            setStep("idle");
            setSuccess("MFA verificado correctamente. Su cuenta está ahora protegida.");
            setOtpCode("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Código inválido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tarjeta de estado */}
            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        profile.mfaEnabled ? "bg-green-100" : "bg-gray-100"
                    }`}
                >
                    <Shield
                        size={24}
                        className={profile.mfaEnabled ? "text-green-600" : "text-gray-400"}
                    />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        {profile.mfaEnabled ? "MFA Activado" : "MFA No configurado"}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {profile.mfaEnabled
                            ? `Método: ${profile.mfaMethod}`
                            : "Autenticación de dos factores no está activa"}
                    </p>
                </div>
            </div>

            {/* Flujo de configuración */}
            {!profile.mfaEnabled && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    {step === "idle" && (
                        <div className="text-center">
                            <KeyRound size={40} className="mx-auto text-gray-400" />
                            <h4 className="mt-3 text-sm font-semibold text-gray-900">
                                Configurar autenticación de dos factores
                            </h4>
                            <p className="mt-1 text-xs text-gray-500">
                                Añada una capa adicional de seguridad a su cuenta con TOTP.
                            </p>
                            <button
                                onClick={handleSetup}
                                disabled={loading}
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                Configurar MFA
                            </button>
                        </div>
                    )}

                    {step === "verify" && (
                        <div className="text-center">
                            <div className="mx-auto w-fit rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                                <QrCode size={64} className="mx-auto text-gray-400" />
                                <p className="mt-2 text-xs font-medium text-amber-600">
                                    QR simulado
                                </p>
                                <p className="mt-1 text-[10px] text-gray-400">
                                    Futura implementación con un authenticator app.
                                </p>
                            </div>

                            <p className="mt-4 text-xs text-gray-600">
                                Por ahora ingrese cualquier código de 6 dígitos para verificar.
                            </p>

                            <div className="mx-auto mt-3 max-w-xs">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                    placeholder="000000"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-lg font-mono tracking-widest focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <button
                                onClick={handleVerify}
                                disabled={loading || otpCode.length !== 6}
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                Verificar código
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Probar MFA (solo cuando está activo) */}
            {profile.mfaEnabled && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h4 className="text-sm font-semibold text-gray-900">Probar MFA</h4>
                    <p className="mt-1 text-xs text-gray-500">
                        Verifique que su autenticador genera códigos válidos.
                    </p>
                    <div className="mx-auto mt-3 max-w-xs">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-lg font-mono tracking-widest focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleVerify}
                        disabled={loading || otpCode.length !== 6}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Probar código
                    </button>
                </div>
            )}

            {/* Alertas */}
            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle size={16} />
                    {success}
                </div>
            )}
        </div>
    );
}
