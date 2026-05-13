import { useState } from "react";
import {
    Key,
    Shield,
    Play,
    Square,
    RefreshCw,
    Loader2,
    AlertCircle,
    CheckCircle,
    Unlock,
    Lock,
} from "lucide-react";
import {
    getVaultStatus,
    initiateCeremony,
    submitShard,
    getCeremonyStatus,
    abortCeremony,
} from "../../api/security.api";
import type { CeremonyStatus } from "../../types/security";

const MOCK_SHARDS = [
    { index: 1, value: "MOCK_SHARD_INDEX_1_VALUE", label: "Clave 1" },
    { index: 2, value: "MOCK_SHARD_INDEX_2_VALUE", label: "Clave 2" },
    { index: 3, value: "MOCK_SHARD_INDEX_3_VALUE", label: "Clave 3" },
];

export default function BovedaKeys() {
    const [ceremonyId, setCeremonyId] = useState<string | null>(null);
    const [ceremony, setCeremony] = useState<CeremonyStatus | null>(null);
    const [, setVaultStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const clearAlerts = () => {
        setError(null);
        setSuccess(null);
    };

    const handleInitiate = async () => {
        clearAlerts();
        setLoading(true);
        try {
            const result = await initiateCeremony("APERTURA");
            setCeremonyId(result.ceremonyId);
            setCeremony({
                ceremonyId: result.ceremonyId,
                type: "APERTURA",
                status: result.status,
                requiredShards: result.requiredShards,
                submittedShards: result.submittedShards,
                progress: `${result.submittedShards}/${result.requiredShards}`,
                activatedAt: null,
                expiresAt: result.expiresAt,
                expired: false,
            });
            setSuccess(`Ceremonia iniciada. ID: ${result.ceremonyId.slice(0, 8)}...`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al iniciar ceremonia");
        } finally {
            setLoading(false);
        }
    };

    const handlePresentKey = async (shardValue: string) => {
        if (!ceremonyId) return;
        clearAlerts();
        setLoading(true);
        try {
            const result = await submitShard(ceremonyId, shardValue);
            setCeremony({
                ceremonyId: result.ceremonyId,
                type: "APERTURA",
                status: result.status,
                requiredShards: result.requiredShards,
                submittedShards: result.submittedShards,
                progress: `${result.submittedShards}/${result.requiredShards}`,
                activatedAt: result.activatedAt,
                expiresAt: result.expiresAt,
                expired: false,
            });
            if (result.status === "ACTIVE") {
                setSuccess("¡Ceremonia activada! La bóveda está ahora accesible.");
            } else {
                setSuccess(`Shard presentado. Progreso: ${result.submittedShards}/${result.requiredShards}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al presentar shard");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!ceremonyId) return;
        clearAlerts();
        setLoading(true);
        try {
            const result = await getCeremonyStatus(ceremonyId);
            setCeremony(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al consultar estado");
        } finally {
            setLoading(false);
        }
    };

    const handleAbort = async () => {
        if (!ceremonyId) return;
        clearAlerts();
        setLoading(true);
        try {
            await abortCeremony(ceremonyId);
            setCeremony(null);
            setCeremonyId(null);
            setSuccess("Ceremonia abortada.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al abortar");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckVault = async (shardValue: string) => {
        clearAlerts();
        setLoading(true);
        try {
            const result = await getVaultStatus(shardValue);
            setVaultStatus(result.status);
            setSuccess(result.message);
        } catch (err) {
            setVaultStatus("VAULT_ACCESS_DENIED");
            setError(err instanceof Error ? err.message : "Acceso denegado a la bóveda");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Introducción */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                    <Shield size={20} className="mt-0.5 text-blue-600" />
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            Bóveda de seguridad (Air-Gap)
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            La bóveda requiere una ceremonia de apertura con presentación física de claves (shards).
                            Cada clave es un fragmento criptográfico que nunca se almacena en texto plano.
                        </p>
                    </div>
                </div>
            </div>

            {/* Información de shards simulados */}
            <div className="grid gap-3 md:grid-cols-3">
                {MOCK_SHARDS.map((shard) => (
                    <div
                        key={shard.index}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                    >
                        <div className="flex items-center gap-2">
                            <Key size={16} className="text-gray-500" />
                            <span className="text-xs font-medium text-gray-500">{shard.label}</span>
                        </div>
                        <p className="mt-1 truncate font-mono text-xs text-gray-400">
                            {shard.value}
                        </p>
                        <button
                            onClick={() => handleCheckVault(shard.value)}
                            disabled={loading}
                            className="mt-3 w-full rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            Probar acceso
                        </button>
                    </div>
                ))}
            </div>

            {/* Controles de ceremonia */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h4 className="text-sm font-semibold text-gray-900">Ceremonia de apertura</h4>

                {!ceremonyId ? (
                    <div className="mt-4 text-center">
                        <Lock size={32} className="mx-auto text-gray-300" />
                        <p className="mt-2 text-xs text-gray-500">
                            No hay una ceremonia activa. Inicie una para comenzar el proceso de apertura.
                        </p>
                        <button
                            onClick={handleInitiate}
                            disabled={loading}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            <Play size={16} />
                            Iniciar ceremonia
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        {/* Progreso */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Progreso</span>
                            <span className="text-xs font-semibold text-gray-900">
                                {ceremony?.progress || "0/3"}
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-blue-600 transition-all"
                                style={{
                                    width: `${
                                        ((ceremony?.submittedShards || 0) /
                                            (ceremony?.requiredShards || 3)) *
                                        100
                                    }%`,
                                }}
                            />
                        </div>

                        {/* Insignia de estado */}
                        <div className="flex items-center gap-2">
                            {ceremony?.status === "ACTIVE" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    <Unlock size={12} />
                                    Activa
                                </span>
                            ) : ceremony?.status === "PENDING" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                    <Lock size={12} />
                                    Pendiente
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                    {ceremony?.status}
                                </span>
                            )}
                            <span className="text-xs text-gray-400">
                                ID: {ceremonyId.slice(0, 8)}...
                            </span>
                        </div>

                        {/* Botones de presentar clave */}
                        <div className="grid grid-cols-3 gap-2">
                            {MOCK_SHARDS.map((shard) => (
                                <button
                                    key={shard.index}
                                    onClick={() => handlePresentKey(shard.value)}
                                    disabled={loading || ceremony?.status === "ACTIVE"}
                                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <Key size={14} />
                                    Presentar {shard.label}
                                </button>
                            ))}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleCheckStatus}
                                disabled={loading}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                <RefreshCw size={14} />
                                Actualizar
                            </button>
                            <button
                                onClick={handleAbort}
                                disabled={loading}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                                <Square size={14} />
                                Abortar
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
