// Pagina de evaluacion del motor antifraude
// Formulario para probar el endpoint /evaluate, semaforo de riesgo, alertas y reglas evaluadas

import { useState } from "react"
import {
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    Info,
    Send,
} from "lucide-react"
import { evaluateEvents } from "../api/fraudEngine.api"
import type {
    EvaluateRequest,
    EvaluateResponse,
    AlertSeverity,
} from "../types/fraudEngine"


// -- Configuracion de severidad --

const severityConfig: Record<AlertSeverity, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    LOW: { label: "Baja", bg: "bg-blue-100", text: "text-blue-700", icon: <Info size={14} className="text-blue-500" /> },
    MEDIUM: { label: "Media", bg: "bg-yellow-100", text: "text-yellow-700", icon: <AlertTriangle size={14} className="text-yellow-500" /> },
    HIGH: { label: "Alta", bg: "bg-orange-100", text: "text-orange-700", icon: <AlertTriangle size={14} className="text-orange-500" /> },
    CRITICAL: { label: "Critica", bg: "bg-red-100", text: "text-red-700", icon: <ShieldAlert size={14} className="text-red-500" /> },
}

// -- Semaforo de riesgo --

function RiskScoreGauge({ score }: { score: number }) {
    let color = "bg-green-500"
    let textColor = "text-green-700"
    let bgColor = "bg-green-100"
    let label = "Riesgo bajo"

    if (score > 60) {
        color = "bg-red-500"
        textColor = "text-red-700"
        bgColor = "bg-red-100"
        label = "Riesgo alto"
    } else if (score > 30) {
        color = "bg-yellow-500"
        textColor = "text-yellow-700"
        bgColor = "bg-yellow-100"
        label = "Riesgo medio"
    }

    return (
        <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-xs text-gray-500 font-semibold tracking-wide mb-3">PUNTUACION TOTAL DE RIESGO</p>
            <div className="flex items-center justify-center mb-4">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${bgColor}`}>
                    <span className={`text-3xl font-bold ${textColor}`}>{score}</span>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-3">
                <span>0</span>
                <span>30</span>
                <span>60</span>
                <span>100</span>
            </div>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${bgColor} ${textColor}`}>
                {label}
            </span>
        </div>
    )
}

function ts(offsetMs: number = 0): string {
    const d = new Date(Date.now() - offsetMs)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function evento(t: string, mesa: string, doc: string, ok: boolean, bio: boolean, off: number) {
    return { tableId: mesa, pollingStation: "PUESTO-001", documentId: doc, tipo: t, exitoso: ok, coincidenciaBiometrica: bio, timestamp: ts(off) }
}

// Preset 1: Autenticaciones fallidas en ventana corta
// Dispara: FAILED_AUTH_ATTEMPTS, BIOMETRIC_INCONSISTENCY, ANOMALOUS_TIME_PATTERN, IRREGULAR_TABLE_BEHAVIOR
const authFailPreset: EvaluateRequest = {
    eventoActual: evento("AUTENTICACION", "MESA-001", "1234567890", false, false, 0),
    eventosHistoricos: [
        evento("AUTENTICACION", "MESA-001", "1234567890", false, false, 10),
        evento("AUTENTICACION", "MESA-001", "1234567890", false, false, 20),
        evento("AUTENTICACION", "MESA-001", "1234567890", false, false, 30),
        evento("AUTENTICACION", "MESA-001", "1234567890", false, false, 40),
        evento("AUTENTICACION", "MESA-001", "1234567890", false, false, 50),
    ],
    eventosPorMesaDelPuesto: {
        "MESA-001": [
            evento("AUTENTICACION", "MESA-001", "DOC-A", true, true, 1000),
            evento("AUTENTICACION", "MESA-001", "DOC-B", true, true, 2000),
            evento("AUTENTICACION", "MESA-001", "DOC-C", true, true, 3000),
            evento("AUTENTICACION", "MESA-001", "DOC-D", true, true, 4000),
            evento("AUTENTICACION", "MESA-001", "DOC-E", true, true, 5000),
            evento("AUTENTICACION", "MESA-001", "DOC-F", true, true, 6000),
        ],
        "MESA-002": [evento("AUTENTICACION", "MESA-002", "DOC-G", true, true, 200)],
        "MESA-003": [evento("AUTENTICACION", "MESA-003", "DOC-H", true, true, 200)],
        "MESA-004": [evento("AUTENTICACION", "MESA-004", "DOC-I", true, true, 200)],
        "MESA-005": [evento("AUTENTICACION", "MESA-005", "DOC-J", true, true, 200)],
        "MESA-006": [evento("AUTENTICACION", "MESA-006", "DOC-K", true, true, 200)],
    },
}

// Preset 2: Intento de voto duplicado (mismo documento ya voto exitosamente)
// Dispara: DUPLICATE_VOTE_ATTEMPT, IRREGULAR_TABLE_BEHAVIOR
const duplicateVotePreset: EvaluateRequest = {
    eventoActual: evento("VOTO", "MESA-001", "1234567890", true, true, 0),
    eventosHistoricos: [
        evento("VOTO", "MESA-001", "1234567890", true, true, 600000),
    ],
    eventosPorMesaDelPuesto: {
        "MESA-001": [
            evento("AUTENTICACION", "MESA-001", "DOC-A", true, true, 500),
            evento("VOTO", "MESA-001", "DOC-A", true, true, 500),
            evento("AUTENTICACION", "MESA-001", "DOC-B", true, true, 1500),
            evento("VOTO", "MESA-001", "DOC-B", true, true, 1500),
            evento("AUTENTICACION", "MESA-001", "DOC-C", true, true, 2500),
            evento("VOTO", "MESA-001", "DOC-C", true, true, 2500),
            evento("AUTENTICACION", "MESA-001", "DOC-D", true, true, 3500),
            evento("VOTO", "MESA-001", "DOC-D", true, true, 3500),
        ],
        "MESA-002": [evento("AUTENTICACION", "MESA-002", "DOC-E", true, true, 1000), evento("VOTO", "MESA-002", "DOC-E", true, true, 1000)],
        "MESA-003": [evento("AUTENTICACION", "MESA-003", "DOC-F", true, true, 1000), evento("VOTO", "MESA-003", "DOC-F", true, true, 1000)],
        "MESA-004": [evento("AUTENTICACION", "MESA-004", "DOC-G", true, true, 1000), evento("VOTO", "MESA-004", "DOC-G", true, true, 1000)],
        "MESA-005": [evento("AUTENTICACION", "MESA-005", "DOC-H", true, true, 1000), evento("VOTO", "MESA-005", "DOC-H", true, true, 1000)],
        "MESA-006": [evento("AUTENTICACION", "MESA-006", "DOC-I", true, true, 1000), evento("VOTO", "MESA-006", "DOC-I", true, true, 1000)],
    },
}

const defaultRequest = authFailPreset

// -- Pagina principal --

export default function EvaluacionAntifraude() {
    const [requestJson, setRequestJson] = useState(JSON.stringify(defaultRequest, null, 2))
    const [result, setResult] = useState<EvaluateResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showRules, setShowRules] = useState(false)
    const [severityFilter, setSeverityFilter] = useState<string>("ALL")

    const handleEvaluate = async () => {
        setLoading(true)
        setError(null)
        setResult(null)
        try {
            const payload: EvaluateRequest = JSON.parse(requestJson)
            const data = await evaluateEvents(payload)
            setResult(data)
        } catch (err) {
            if (err instanceof SyntaxError) {
                setError("El JSON ingresado es invalido. Revise la estructura.")
            } else {
                setError(err instanceof Error ? err.message : "Error al evaluar los eventos.")
            }
        } finally {
            setLoading(false)
        }
    }

    function loadPreset(preset: EvaluateRequest) {
        setRequestJson(JSON.stringify(preset, null, 2))
        setResult(null)
        setError(null)
    }

    const filteredAlerts = result
        ? severityFilter === "ALL"
            ? result.alerts
            : result.alerts.filter((a) => a.severity === severityFilter)
        : []

    return (
        <div className="bg-[#f5f6f7] h-full">

            <main className="flex-1 px-6 py-10">
                <div className="max-w-5xl mx-auto">
                    {/* Titulo */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Evaluacion Antifraude</h2>
                        <p className="text-gray-600">
                            Pruebe el motor de deteccion evaluando eventos contra las reglas activas.
                        </p>
                    </div>

                    {/* Formulario de entrada */}
                    <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
                        <label className="block text-xs text-gray-500 font-semibold tracking-wide mb-2">
                            DATOS DEL EVENTO (JSON)
                        </label>
                        <textarea
                            value={requestJson}
                            onChange={(e) => setRequestJson(e.target.value)}
                            rows={16}
                            className="w-full border rounded-lg px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-red-200 transition resize-y bg-gray-50"
                            spellCheck={false}
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => loadPreset(authFailPreset)}
                                disabled={loading}
                                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition text-sm"
                            >
                                Autenticaciones fallidas
                            </button>
                            <button
                                onClick={() => loadPreset(duplicateVotePreset)}
                                disabled={loading}
                                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition text-sm"
                            >
                                Voto duplicado
                            </button>
                            <button
                                onClick={handleEvaluate}
                                disabled={loading}
                                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Evaluar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && !loading && (
                        <div className="bg-white rounded-2xl border p-8 text-center mb-6">
                            <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold mb-2">{error}</p>
                            <button onClick={handleEvaluate} className="text-red-500 text-sm font-medium hover:underline">
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* Resultados */}
                    {result && !loading && (
                        <div className="space-y-6">
                            {/* Semaforo de riesgo */}
                            <RiskScoreGauge score={result.totalRiskScore} />

                            {/* Alertas */}
                            <div className="bg-white rounded-2xl border shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                                    <h3 className="font-bold text-gray-900">
                                        Alertas generadas
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            ({result.alerts.length})
                                        </span>
                                    </h3>
                                    <select
                                        value={severityFilter}
                                        onChange={(e) => setSeverityFilter(e.target.value)}
                                        className="border rounded-lg px-3 py-2 bg-white text-sm text-gray-700 outline-none cursor-pointer"
                                    >
                                        <option value="ALL">Todas las severidades</option>
                                        <option value="LOW">Baja</option>
                                        <option value="MEDIUM">Media</option>
                                        <option value="HIGH">Alta</option>
                                        <option value="CRITICAL">Critica</option>
                                    </select>
                                </div>

                                {filteredAlerts.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredAlerts.map((alert, idx) => {
                                            const sev = severityConfig[alert.severity]
                                            return (
                                                <div key={idx} className={`rounded-xl p-4 border ${sev.bg} border-opacity-50`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {sev.icon}
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>
                                                            {sev.label}
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-800">{alert.alertType}</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                                                        <div>
                                                            <span className="text-xs text-gray-500">Mesa:</span> {alert.tableId}
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-500">Documento:</span> {alert.documentId}
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-500">Hora:</span>{" "}
                                                            {new Date(alert.timestamp).toLocaleString("es-CO")}
                                                        </div>
                                                    </div>
                                                    {Object.keys(alert.details).length > 0 && (
                                                        <div className="mt-2 text-xs text-gray-600 bg-white/60 rounded-lg p-2 font-mono">
                                                            {JSON.stringify(alert.details, null, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <ShieldCheck size={32} className="text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No se generaron alertas con el filtro actual.</p>
                                    </div>
                                )}
                            </div>

                            {/* Reglas evaluadas - seccion colapsable */}
                            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setShowRules(!showRules)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                                >
                                    <h3 className="font-bold text-gray-900">
                                        Por que se disparo?
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            ({result.evaluatedRules.length} reglas evaluadas)
                                        </span>
                                    </h3>
                                    {showRules ? (
                                        <ChevronUp size={20} className="text-gray-400" />
                                    ) : (
                                        <ChevronDown size={20} className="text-gray-400" />
                                    )}
                                </button>

                                {showRules && (
                                    <div className="px-6 pb-6 space-y-3">
                                        {result.evaluatedRules.map((rule) => (
                                            <div
                                                key={rule.ruleId}
                                                className={`rounded-xl p-4 border ${rule.disparada
                                                        ? "bg-red-50 border-red-200"
                                                        : "bg-gray-50 border-gray-200"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        {rule.disparada ? (
                                                            <ShieldAlert size={16} className="text-red-500" />
                                                        ) : (
                                                            <ShieldCheck size={16} className="text-green-500" />
                                                        )}
                                                        <span className="font-semibold text-sm text-gray-900">{rule.ruleName}</span>
                                                    </div>
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rule.disparada
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-green-100 text-green-700"
                                                            }`}
                                                    >
                                                        {rule.disparada ? "Disparada" : "No disparada"}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{rule.mensaje}</p>
                                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                    <span>Tipo: {rule.ruleType}</span>
                                                    <span>Puntaje aportado: {rule.puntajeAportado}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
