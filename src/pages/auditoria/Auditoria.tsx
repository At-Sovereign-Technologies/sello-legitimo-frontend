import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Shield, AlertTriangle, CheckCircle, Search } from "lucide-react";
import UserMenu from "../../components/UserMenu";
import { getAuditLog, verifyAuditChainIntegrity, type AuditEvent, type AuditChainIntegrity } from "../../services/auditoriaService";

export default function Auditoria() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [chainStatus, setChainStatus] = useState<AuditChainIntegrity | null>(null);
    const [verifyingChain, setVerifyingChain] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const pageSize = 20;

    useEffect(() => {
        loadAuditLog();
    }, [currentPage]);

    const loadAuditLog = async () => {
        setLoading(true);
        try {
            const data = await getAuditLog(currentPage, pageSize);
            setAuditEvents(data.content);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Failed to load audit log:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyChain = async () => {
        setVerifyingChain(true);
        try {
            const result = await verifyAuditChainIntegrity();
            setChainStatus(result);
        } catch (error) {
            console.error("Failed to verify chain:", error);
            setChainStatus({
                isValid: false,
                totalRecords: 0,
                invalidRecords: 0,
                errorMessages: ["Error al verificar la cadena de auditoría"],
            });
        } finally {
            setVerifyingChain(false);
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

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            CREATED: "Creado",
            UPDATED: "Actualizado",
            DELETED: "Eliminado",
            STATE_CHANGED: "Cambio de Estado",
            OPENED: "Abierto",
            CLOSED: "Cerrado",
            SIGNED: "Firmado",
            VERIFIED: "Verificado",
        };
        return labels[action] || action;
    };

    const getActionColor = (action: string) => {
        const colors: Record<string, string> = {
            CREATED: "bg-green-100 text-green-700",
            UPDATED: "bg-blue-100 text-blue-700",
            DELETED: "bg-red-100 text-red-700",
            STATE_CHANGED: "bg-yellow-100 text-yellow-700",
            OPENED: "bg-purple-100 text-purple-700",
            CLOSED: "bg-gray-100 text-gray-700",
            SIGNED: "bg-emerald-100 text-emerald-700",
            VERIFIED: "bg-teal-100 text-teal-700",
        };
        return colors[action] || "bg-gray-100 text-gray-700";
    };

    const filteredEvents = searchTerm
        ? auditEvents.filter(
              (event) =>
                  event.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  event.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  event.actorId.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : auditEvents;

    const totalPages = Math.ceil(totalElements / pageSize);

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
            <main className="flex-1 px-8 py-6 max-w-6xl mx-auto w-full">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <button onClick={() => navigate("/")} className="hover:text-gray-700">
                        Panel de control
                    </button>
                    <ChevronRight size={12} />
                    <span className="text-gray-700">Auditoría</span>
                </div>

                {/* Page title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Registro de Auditoría
                    </h1>
                    <p className="text-sm text-gray-500">
                        Sistema WORM de auditoría con cadena de hash criptográfica
                    </p>
                </div>

                {/* Chain Integrity Status */}
                <div className="bg-white border rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Integridad de la Cadena de Auditoría
                                </p>
                                <p className="text-xs text-gray-500">
                                    Verificación criptográfica SHA-256
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleVerifyChain}
                            disabled={verifyingChain}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition flex items-center gap-2 disabled:bg-red-300"
                        >
                            {verifyingChain ? "Verificando..." : "Verificar Integridad"}
                        </button>
                    </div>

                    {chainStatus && (
                        <div
                            className={`mt-4 p-4 rounded-lg ${
                                chainStatus.isValid
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-red-50 border border-red-200"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {chainStatus.isValid ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                )}
                                <span
                                    className={`text-sm font-semibold ${
                                        chainStatus.isValid ? "text-green-700" : "text-red-700"
                                    }`}
                                >
{chainStatus.isValid
                                        ? "Cadena de auditoría válida"
                                        : "Se detectaron inconsistencias en la cadena"}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                {chainStatus.totalRecords} registros verificados
                                {chainStatus.invalidRecords > 0 &&
                                    `, ${chainStatus.invalidRecords} inconsistencias`}
                            </p>
                            {chainStatus.errorMessages && chainStatus.errorMessages.length > 0 && (
                                <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                                    {chainStatus.errorMessages.slice(0, 3).map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="bg-white border rounded-xl p-4 mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por entidad, ID o actor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                    </div>
                </div>

                {/* Audit Log Table */}
                <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 tracking-wide">
                            REGISTRO DE EVENTOS
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Cargando...</div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No hay eventos de auditoría registrados
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-xs text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Marca de Tiempo</th>
                                            <th className="px-4 py-3 text-left font-medium">Acción</th>
                                            <th className="px-4 py-3 text-left font-medium">Entidad</th>
                                            <th className="px-4 py-3 text-left font-medium">ID Entidad</th>
                                            <th className="px-4 py-3 text-left font-medium">Actor</th>
                                            <th className="px-4 py-3 text-left font-medium">Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredEvents.map((event) => (
                                            <tr key={event.eventId} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {formatDate(event.timestampNtp)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getActionColor(event.action)}`}
                                                    >
                                                        {getActionLabel(event.action)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {event.entityType}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
                                                    {event.entityId.slice(0, 8)}...
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
                                                    {event.actorId.slice(0, 8)}...
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                                                    {event.chainHash.slice(0, 12)}...
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                        Mostrando {currentPage * pageSize + 1} -{" "}
                                        {Math.min((currentPage + 1) * pageSize, totalElements)} de{" "}
                                        {totalElements}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                            disabled={currentPage === 0}
                                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Anterior
                                        </button>
                                        <span className="text-xs text-gray-500">
                                            Página {currentPage + 1} de {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                                            disabled={currentPage >= totalPages - 1}
                                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white py-3 px-8 text-center text-xs text-gray-400">
                Sistema de Auditoría WORM | Sello Legítimo Colombia
            </footer>
        </div>
    );
}