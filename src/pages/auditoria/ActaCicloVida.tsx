import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search, FileText, Clock, Shield, User, Hash, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import UserMenu from "../../components/UserMenu";
import { getActaE14Timeline, getActaE14Versions, verifyActaE14, type ActaLifecycleEvent, type ActaVerification } from "../../services/auditoriaService";

export default function ActaCicloVida() {
    const navigate = useNavigate();

    const [actaUuid, setActaUuid] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeline, setTimeline] = useState<ActaLifecycleEvent[]>([]);
    const [versions, setVersions] = useState<ActaLifecycleEvent[]>([]);
    const [verification, setVerification] = useState<ActaVerification | null>(null);
    const [activeTab, setActiveTab] = useState<"timeline" | "versions" | "verification">("timeline");

    const handleSearch = async () => {
        if (!actaUuid.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const [timelineData, versionsData, verificationData] = await Promise.all([
                getActaE14Timeline(actaUuid),
                getActaE14Versions(actaUuid),
                verifyActaE14(actaUuid).catch(() => null),
            ]);

            setTimeline(timelineData);
            setVersions(versionsData);
            setVerification(verificationData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar datos");
            setTimeline([]);
            setVersions([]);
            setVerification(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("es-CO", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getEstadoColor = (estado: string) => {
        const colors: Record<string, string> = {
            CREADA: "bg-blue-100 text-blue-700",
            FIRMADA: "bg-green-100 text-green-700",
            VERIFICADA: "bg-emerald-100 text-emerald-700",
            ENVIADA: "bg-purple-100 text-purple-700",
            RECIBIDA: "bg-indigo-100 text-indigo-700",
            CORREGIDA: "bg-yellow-100 text-yellow-700",
            ANULADA: "bg-red-100 text-red-700",
        };
        return colors[estado] || "bg-gray-100 text-gray-700";
    };

    const getEstadoLabel = (estado: string) => {
        const labels: Record<string, string> = {
            CREADA: "Creada",
            FIRMADA: "Firmada",
            VERIFICADA: "Verificada",
            ENVIADA: "Enviada",
            RECIBIDA: "Recibida",
            CORREGIDA: "Corregida",
            ANULADA: "Anulada",
        };
        return labels[estado] || estado;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">SL</span>
                    </div>
                    <div className="leading-tight">
                        <p className="font-bold text-sm text-gray-900">Sello Legítimo</p>
                        <p className="text-red-500 text-[10px] font-semibold tracking-wider">
                            SISTEMA ELECTORAL COLOMBIANO
                        </p>
                    </div>
                </div>
                <UserMenu />
            </header>

            {/* Main */}
            <main className="flex-1 px-8 py-6 max-w-5xl mx-auto w-full">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <button onClick={() => navigate("/")} className="hover:text-gray-700">
                        Panel de control
                    </button>
                    <ChevronRight size={12} />
                    <span className="text-gray-700">Ciclo de Vida Acta E-14</span>
                </div>

                {/* Page title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Ciclo de Vida del Acta E-14
                    </h1>
                    <p className="text-sm text-gray-500">
                        Consulta la trazabilidad completa y hashes criptográficos de un acta electoral
                    </p>
                </div>

                {/* Search */}
                <div className="bg-white border rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ingrese el UUID del Acta E-14..."
                                value={actaUuid}
                                onChange={(e) => setActaUuid(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading || !actaUuid.trim()}
                            className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition flex items-center gap-2 disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                            {loading ? "Buscando..." : "Consultar"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {timeline.length > 0 && (
                    <>
                        {/* Tab Navigation */}
                        <div className="flex border-b mb-4">
                            <button
                                onClick={() => setActiveTab("timeline")}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                                    activeTab === "timeline"
                                        ? "border-red-500 text-red-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <Clock className="inline w-4 h-4 mr-1" />
                                Línea de Tiempo
                            </button>
                            <button
                                onClick={() => setActiveTab("versions")}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                                    activeTab === "versions"
                                        ? "border-red-500 text-red-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <FileText className="inline w-4 h-4 mr-1" />
                                Versiones ({versions.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("verification")}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                                    activeTab === "verification"
                                        ? "border-red-500 text-red-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <Shield className="inline w-4 h-4 mr-1" />
                                Integridad
                            </button>
                        </div>

                        {/* Timeline Tab */}
                        {activeTab === "timeline" && (
                            <div className="bg-white border rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Trazabilidad del Acta
                                </h2>
                                <div className="relative">
                                    {timeline.map((event, index) => (
                                        <div key={event.uuid} className="relative pl-8 pb-6 last:pb-0">
                                            {/* Timeline line */}
                                            {index < timeline.length - 1 && (
                                                <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
                                            )}
                                            {/* Timeline dot */}
                                            <div className="absolute left-1.5 top-2 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />

                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(event.estado)}`}>
                                                        {getEstadoLabel(event.estado)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Versión {event.versionNumber}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{formatDate(event.timestampNtp)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <User className="w-4 h-4" />
                                                        <span>Actor: {event.actorId}</span>
                                                    </div>
                                                    {event.deviceId && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <FileText className="w-4 h-4" />
                                                            <span>Dispositivo: {event.deviceId}</span>
                                                        </div>
                                                    )}
                                                    {event.documentSha256 && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Hash className="w-4 h-4" />
                                                            <span className="font-mono text-xs">
                                                                SHA-256: {event.documentSha256.slice(0, 16)}...
                                                            </span>
                                                        </div>
                                                    )}
                                                    {event.authorizationRef && (
                                                        <div className="flex items-center gap-2 text-yellow-600">
                                                            <AlertCircle className="w-4 h-4" />
                                                            <span className="text-xs">
                                                                Autorización: {event.authorizationRef}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Versions Tab */}
                        {activeTab === "versions" && (
                            <div className="bg-white border rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Historial de Versiones
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    Cada corrección genera una nueva versión vinculada a la anterior
                                </p>
                                <div className="space-y-3">
                                    {versions.map((version) => (
                                        <div key={version.uuid} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-gray-900">
                                                    Versión {version.versionNumber}
                                                </span>
                                                {version.previousVersionId && (
                                                    <span className="text-xs text-gray-500">
                                                        ← Versión anterior vinculada
                                                    </span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Estado:</span>{" "}
                                                    <span className={getEstadoColor(version.estado)}>
                                                        {getEstadoLabel(version.estado)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Fecha:</span>{" "}
                                                    {formatDate(version.timestampNtp)}
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Actor:</span>{" "}
                                                    {version.actorId}
                                                </div>
                                                {version.documentSha256 && (
                                                    <div className="col-span-2">
                                                        <span className="text-gray-500">Hash:</span>{" "}
                                                        <span className="font-mono text-xs text-gray-600">
                                                            {version.documentSha256}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Verification Tab */}
                        {activeTab === "verification" && verification && (
                            <div className="bg-white border rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Verificación de Integridad
                                </h2>
                                <div className={`p-4 rounded-lg mb-4 ${
                                    verification.isValid
                                        ? "bg-green-50 border border-green-200"
                                        : "bg-red-50 border border-red-200"
                                }`}>
                                    <div className="flex items-center gap-2">
                                        {verification.isValid ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                        <span className={`font-semibold ${
                                            verification.isValid ? "text-green-700" : "text-red-700"
                                        }`}>
                                            {verification.isValid
                                                ? "Acta válida - Sin modificaciones detectadas"
                                                : "Se detectaron inconsistencias"}
                                        </span>
                                    </div>
                                </div>

                                {verification.currentHash && (
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Hash Actual del Documento
                                        </label>
                                        <code className="block bg-gray-100 p-2 rounded text-xs font-mono break-all">
                                            {verification.currentHash}
                                        </code>
                                    </div>
                                )}

                                {verification.expectedHash && (
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Hash Esperado
                                        </label>
                                        <code className="block bg-gray-100 p-2 rounded text-xs font-mono break-all">
                                            {verification.expectedHash}
                                        </code>
                                    </div>
                                )}

                                {verification.errors.length > 0 && !verification.isValid && (
                                    <div className="mt-4">
                                        <label className="block text-xs font-medium text-red-600 mb-2">
                                            Errores Detectados
                                        </label>
                                        <ul className="list-disc list-inside text-sm text-red-600">
                                            {verification.errors.map((err, idx) => (
                                                <li key={idx}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Empty state */}
                {timeline.length === 0 && !loading && !error && (
                    <div className="bg-white border rounded-xl p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            Ingrese un UUID de Acta E-14 para consultar su ciclo de vida
                        </p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t bg-white py-3 px-8 text-center text-xs text-gray-400">
                Sistema de Trazabilidad Acta E-14 | Sello Legítimo Colombia
            </footer>
        </div>
    );
}