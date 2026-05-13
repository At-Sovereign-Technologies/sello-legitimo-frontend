import { useState, useEffect } from "react"
import {
    Clock,
    Loader2,
    AlertCircle,
    ShieldCheck,
    Info,
    AlertTriangle,
    AlertOctagon,
    Siren,
    Server,
    Flame,
    AlertCircle as AlertIcon,
} from "lucide-react"
import { getTransparency, fetchRealTimeAuditEvents } from "../api/transparency.api"
import { getActiveElections } from "../api/elections.api"
import type {
    TransparencyResponse,
    TransparencyRecord,
    TransparencyAuditEvent,
    TransparencySeverity,
} from "../types/transparency"
import type { Election } from "../types/elections"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"

type MonitorTab = "HANDSHAKE" | "ESCRUTINIO" | "GENERAL"

const handshakeEventTypes = ["HANDSHAKE_EMITTED", "SESSION_ACTIVATED"]
const escrutinioEventTypes = ["QR_SCANNED", "CONCILIATION_ATTEMPT"]

const severityStyles: Record<TransparencySeverity, string> = {
    INFO: "bg-slate-100 text-slate-700",
    LOW: "bg-sky-100 text-sky-700",
    MEDIUM: "bg-amber-100 text-amber-800",
    HIGH: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-700",
}

const severityIcon: Record<TransparencySeverity, typeof Info> = {
    INFO: Info,
    LOW: Info,
    MEDIUM: AlertTriangle,
    HIGH: AlertOctagon,
    CRITICAL: Siren,
}

const getSeverityFromRiskScore = (riskScore: number | null | undefined): TransparencySeverity => {
    const score = riskScore ?? 0

    if (score >= 80) return "CRITICAL"
    if (score >= 60) return "HIGH"
    if (score >= 30) return "MEDIUM"
    if (score >= 10) return "LOW"
    return "INFO"
}

const getRiskScoreStyles = (riskScore: number | null | undefined): { badge: string; icon: typeof Info | null } => {
    const score = riskScore ?? 0
    
    if (score >= 80) {
        return {
            badge: "bg-red-100 text-red-800 border border-red-500",
            icon: Flame,
        }
    } else if (score >= 30) {
        return {
            badge: "bg-orange-100 text-orange-800 border border-orange-300",
            icon: AlertIcon,
        }
    } else {
        return {
            badge: "bg-slate-100 text-slate-600 border border-slate-300",
            icon: null,
        }
    }
}

const renderDetailValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return String(value)
    }
    return JSON.stringify(value)
}

function RecordTimeline({ records }: { records: TransparencyRecord[] }) {
    return (
        <div className="space-y-4">
            {records.map((record, index) => (
                <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <Clock size={14} className="text-red-500" />
                        </div>
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                    </div>
                    <div className="pb-6 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">{record.eventType}</span>
                            <span className="text-xs text-gray-400">{record.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{record.description}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function Transparencia() {
    const [elections, setElections] = useState<Election[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [transparency, setTransparency] = useState<TransparencyResponse | null>(null)
    const [eventTypeFilter, setEventTypeFilter] = useState<string>("ALL")
    const [loadingElections, setLoadingElections] = useState(true)
    const [loadingRecords, setLoadingRecords] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searched, setSearched] = useState(false)
    const [auditEvents, setAuditEvents] = useState<TransparencyAuditEvent[]>([])
    const [monitorTab, setMonitorTab] = useState<MonitorTab>("GENERAL")
    const [monitorSeverityFilter, setMonitorSeverityFilter] = useState<"ALL" | TransparencySeverity>("ALL")
    const [loadingAuditMonitor, setLoadingAuditMonitor] = useState(false)
    const [auditMonitorError, setAuditMonitorError] = useState<string | null>(null)

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const data = await getActiveElections()
                setElections(data)
                if (data.length > 0) setSelectedId(data[0].id)
            } catch {
                setError("No se pudieron cargar las elecciones disponibles.")
            } finally {
                setLoadingElections(false)
            }
        }
        fetchElections()
    }, [])

    useEffect(() => {
        const fetchAuditMonitor = async () => {
            if (selectedId === null) {
                setAuditEvents([])
                return
            }

            setLoadingAuditMonitor(true)
            setAuditMonitorError(null)

            try {
                const data = await fetchRealTimeAuditEvents({
                    electionId: selectedId,
                    page: 0,
                    size: 100,
                })
                setAuditEvents(data)
            } catch {
                setAuditMonitorError("No se pudieron cargar los eventos distribuidos de auditoría.")
            } finally {
                setLoadingAuditMonitor(false)
            }
        }

        fetchAuditMonitor()
    }, [selectedId])

    const fetchRecords = async () => {
        if (selectedId === null) return

        setLoadingRecords(true)
        setError(null)
        setTransparency(null)
        setEventTypeFilter("ALL")

        try {
            const data = await getTransparency(selectedId)
            setTransparency(data)
            setSearched(true)
        } catch {
            setError("No se pudieron cargar los registros. Intente nuevamente.")
            setSearched(true)
        } finally {
            setLoadingRecords(false)
        }
    }

    const eventTypes = transparency
        ? ["ALL", ...Array.from(new Set(transparency.records.map((r) => r.eventType)))]
        : ["ALL"]

    const filteredRecords = transparency
        ? eventTypeFilter === "ALL"
            ? transparency.records
            : transparency.records.filter((r) => r.eventType === eventTypeFilter)
        : []

    const selectedElection = elections.find((e) => e.id === selectedId)

    const monitorEvents = auditEvents.filter((event) => {
        const eventSeverity = getSeverityFromRiskScore(event.riskScore)

        if (monitorSeverityFilter !== "ALL" && eventSeverity !== monitorSeverityFilter) {
            return false
        }

        if (monitorTab === "HANDSHAKE") {
            return handshakeEventTypes.includes(event.eventType)
        }

        if (monitorTab === "ESCRUTINIO") {
            return escrutinioEventTypes.includes(event.eventType)
        }

        return true
    })

    // Sort by risk score (descending), treating undefined as 0
    const sortedMonitorEvents = [...monitorEvents].sort((a, b) => {
        const scoreA = a.riskScore ?? 0
        const scoreB = b.riskScore ?? 0
        return scoreB - scoreA
    })

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
            <NavBar />

            <main className="flex-1 px-6 py-10">
                <div className="max-w-5xl mx-auto">

                    {/* TITLE */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Transparencia Electoral</h2>
                        <p className="text-gray-600">
                            Consulte la trazabilidad y registros del proceso electoral.
                        </p>
                    </div>

                    {/* SELECTOR */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                        <label className="text-xs text-gray-500">ELECCIÓN</label>

                        {loadingElections ? (
                            <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                                <Loader2 size={16} className="animate-spin" />
                                Cargando elecciones...
                            </div>
                        ) : (
                            <select
                                value={selectedId ?? ""}
                                onChange={(e) => {
                                    setSelectedId(Number(e.target.value))
                                    setTransparency(null)
                                    setSearched(false)
                                    setError(null)
                                    setEventTypeFilter("ALL")
                                }}
                                className="w-full border rounded-lg px-3 py-3 mt-1 bg-white text-sm text-gray-700 outline-none cursor-pointer mb-4"
                            >
                                {elections.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <button
                            onClick={fetchRecords}
                            disabled={loadingRecords || selectedId === null || loadingElections}
                            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loadingRecords ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                "Consultar Registros"
                            )}
                        </button>
                    </div>

                    {/* ERROR */}
                    {error && !loadingRecords && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold mb-2">{error}</p>
                            <button
                                onClick={fetchRecords}
                                className="text-red-500 text-sm font-medium hover:underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* LOADING RECORDS */}
                    {loadingRecords && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">Cargando registros...</p>
                        </div>
                    )}

                    {/* RECORDS */}
                    {transparency && !loadingRecords && !error && (
                        <>
                            {/* SUMMARY */}
                            <div className="bg-white rounded-2xl border p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <ShieldCheck size={18} className="text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{selectedElection?.name}</h3>
                                        <p className="text-xs text-gray-500">
                                            {filteredRecords.length} registro{filteredRecords.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>

                                {/* FILTER BY EVENT TYPE */}
                                <select
                                    value={eventTypeFilter}
                                    onChange={(e) => setEventTypeFilter(e.target.value)}
                                    className="border rounded-lg px-3 py-2 bg-white text-sm text-gray-700 outline-none cursor-pointer"
                                >
                                    {eventTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type === "ALL" ? "Todos los eventos" : type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {filteredRecords.length > 0 ? (
                                <div className="bg-white rounded-2xl border shadow-sm p-6">
                                    <RecordTimeline records={filteredRecords} />
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border p-8 text-center">
                                    <ShieldCheck size={40} className="text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-semibold">No hay registros para este filtro.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* EMPTY STATE */}
                    {searched && !transparency && !loadingRecords && !error && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <ShieldCheck size={40} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-semibold">No hay registros disponibles.</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Los registros se generarán a medida que se ejecute el proceso electoral.
                            </p>
                        </div>
                    )}

                    {/* MONITOR CENTRAL DE AUDITORIA */}
                    <section className="bg-white rounded-2xl border shadow-sm p-6 mt-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Monitor Central de Auditoría</h3>
                                <p className="text-sm text-gray-500">
                                    Trazabilidad distribuida en tiempo real con enfoque Zero-Identity.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Severidad</label>
                                <select
                                    value={monitorSeverityFilter}
                                    onChange={(e) =>
                                        setMonitorSeverityFilter(e.target.value as "ALL" | TransparencySeverity)
                                    }
                                    className="border rounded-lg px-3 py-2 bg-white text-sm text-gray-700 outline-none cursor-pointer"
                                >
                                    <option value="ALL">Todas</option>
                                    <option value="INFO">INFO</option>
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="CRITICAL">CRITICAL</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setMonitorTab("HANDSHAKE")}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition ${
                                    monitorTab === "HANDSHAKE"
                                        ? "bg-red-500 text-white border-red-500"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                Handshake Electoral
                            </button>

                            <button
                                type="button"
                                onClick={() => setMonitorTab("ESCRUTINIO")}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition ${
                                    monitorTab === "ESCRUTINIO"
                                        ? "bg-red-500 text-white border-red-500"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                Escrutinio (Doble Verdad)
                            </button>

                            <button
                                type="button"
                                onClick={() => setMonitorTab("GENERAL")}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition ${
                                    monitorTab === "GENERAL"
                                        ? "bg-red-500 text-white border-red-500"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                Registro General
                            </button>
                        </div>

                        {loadingAuditMonitor && (
                            <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
                                <Loader2 size={18} className="animate-spin" />
                                Cargando eventos de auditoría distribuida...
                            </div>
                        )}

                        {auditMonitorError && !loadingAuditMonitor && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {auditMonitorError}
                            </div>
                        )}

                        {!loadingAuditMonitor && !auditMonitorError && monitorEvents.length === 0 && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                                No se encontraron eventos para este filtro.
                            </div>
                        )}

                        {!loadingAuditMonitor && !auditMonitorError && monitorEvents.length > 0 && (
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-xs text-gray-500">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Tiempo</th>
                                            <th className="px-4 py-3 text-left font-medium">Componente</th>
                                            <th className="px-4 py-3 text-left font-medium">Evento</th>
                                            <th className="px-4 py-3 text-left font-medium">Score de Riesgo</th>
                                            <th className="px-4 py-3 text-left font-medium">Severidad</th>
                                            <th className="px-4 py-3 text-left font-medium">Detalles</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {sortedMonitorEvents.map((event, index) => {
                                            const eventSeverity = getSeverityFromRiskScore(event.riskScore)
                                            const SeverityIcon = severityIcon[eventSeverity]
                                            const riskScoreStyles = getRiskScoreStyles(event.riskScore)
                                            const RiskIcon = riskScoreStyles.icon
                                            const metadataEntries = event.details
                                                ? Object.entries(event.details)
                                                : event.description
                                                    ? [["description", event.description] as const]
                                                    : []

                                            return (
                                                <tr key={`${event.timestamp}-${event.eventType}-${index}`}>
                                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                        {new Date(event.timestamp).toLocaleString("es-CO")}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700">
                                                        <span className="inline-flex items-center gap-2">
                                                            <Server size={14} className="text-gray-400" />
                                                            {event.originComponent ?? "TRANSPARENCY_SERVICE"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-800 font-medium">
                                                        {event.eventType}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <span
                                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold w-fit ${riskScoreStyles.badge}`}
                                                                title={`Versión del algoritmo: ${event.algorithmVersion ?? "no especificada"}`}
                                                            >
                                                                {RiskIcon && <RiskIcon size={13} />}
                                                                {event.riskScore ?? 0}
                                                            </span>
                                                            {event.algorithmVersion && (
                                                                <span className="text-xs text-gray-400">
                                                                    v{event.algorithmVersion}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${severityStyles[eventSeverity]}`}
                                                        >
                                                            <SeverityIcon size={13} />
                                                            {eventSeverity}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <details className="group">
                                                            <summary className="cursor-pointer text-xs text-red-600 font-semibold list-none">
                                                                Ver metadata
                                                            </summary>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {metadataEntries.length === 0 && (
                                                                    <span className="text-xs text-gray-400">Sin metadata</span>
                                                                )}
                                                                {metadataEntries.map(([key, value]) => (
                                                                    <span
                                                                        key={key}
                                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-700"
                                                                    >
                                                                        <span className="font-semibold">{key}:</span>
                                                                        <span>{renderDetailValue(value)}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </details>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    )
}