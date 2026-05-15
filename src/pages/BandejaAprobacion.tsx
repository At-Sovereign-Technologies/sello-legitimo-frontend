// Bandeja de aprobacion de reglas antifraude (DELEGADO_CNE)
// Lista de reglas pendientes, aprobacion, rechazo y desactivacion

import { useState, useEffect } from "react"
import {
    Loader2,
    AlertCircle,
    Check,
    XCircle,
    Eye,
    X,
    ShieldAlert,
    Power,
    AlertTriangle,
} from "lucide-react"
import {
    getRules,
    getRuleById,
    approveRule,
    rejectRule,
    deleteRule,
} from "../api/fraudEngine.api"
import type { FraudRule, ApprovalStatus, RuleType } from "../types/fraudEngine"


// -- Configuracion de badges de estado --

const approvalConfig: Record<ApprovalStatus, { label: string; bg: string; text: string }> = {
    PENDING: { label: "Pendiente", bg: "bg-yellow-100", text: "text-yellow-700" },
    APPROVED: { label: "Aprobada", bg: "bg-green-100", text: "text-green-700" },
    REJECTED: { label: "Rechazada", bg: "bg-red-100", text: "text-red-700" },
}

const ruleTypeLabels: Record<RuleType, string> = {
    FAILED_AUTH_ATTEMPTS: "Intentos fallidos de autenticacion",
    BIOMETRIC_INCONSISTENCY: "Inconsistencia biometrica",
    DUPLICATE_VOTE_ATTEMPT: "Intento de voto duplicado",
    ANOMALOUS_TIME_PATTERN: "Patron anomalo de tiempo",
    IRREGULAR_TABLE_BEHAVIOR: "Comportamiento irregular de mesa",
}

// -- Definicion de campos de parametros por ruleType (para detalle) --

interface ParamField {
    key: string
    label: string
    hint: string
}

const paramFieldsByType: Record<RuleType, ParamField[]> = {
    FAILED_AUTH_ATTEMPTS: [
        { key: "maxFailedAttempts", label: "Maximo de intentos fallidos", hint: "Numero de fallos en la mesa dentro de la ventana" },
        { key: "windowMinutes", label: "Ventana de tiempo (minutos)", hint: "Periodo de tiempo a evaluar en minutos" },
    ],
    BIOMETRIC_INCONSISTENCY: [
        { key: "maxInconsistencies", label: "Maximo de inconsistencias", hint: "Numero de no-match biometrico para un documento" },
        { key: "windowHours", label: "Ventana de tiempo (horas)", hint: "Periodo de tiempo a evaluar en horas" },
    ],
    DUPLICATE_VOTE_ATTEMPT: [
        { key: "windowHours", label: "Ventana de tiempo (horas)", hint: "Detecta voto repetido del mismo documento en esta ventana" },
    ],
    ANOMALOUS_TIME_PATTERN: [
        { key: "maxAuthInWindow", label: "Maximo de autenticaciones", hint: "Rafaga maxima de autenticaciones por mesa" },
        { key: "windowSeconds", label: "Ventana de tiempo (segundos)", hint: "Periodo de tiempo a evaluar en segundos" },
    ],
    IRREGULAR_TABLE_BEHAVIOR: [
        { key: "deviationThreshold", label: "Umbral de desviacion", hint: "Veces que una mesa supera el promedio del puesto" },
        { key: "minComparableTables", label: "Mesas comparables minimas", hint: "Minimo de mesas comparables requeridas" },
    ],
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
    const config = approvalConfig[status] ?? approvalConfig.PENDING
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    )
}

// -- Modal de rechazo --

function RejectModal({
    open,
    onConfirm,
    onCancel,
    loading,
}: {
    open: boolean
    onConfirm: (motivo: string) => void
    onCancel: () => void
    loading: boolean
}) {
    const [motivo, setMotivo] = useState("")
    const [error, setError] = useState("")

    if (!open) return null

    const handleSubmit = () => {
        if (!motivo.trim()) {
            setError("El motivo de rechazo es obligatorio.")
            return
        }
        setError("")
        onConfirm(motivo.trim())
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full mx-4 animate-slide-up">
                <div className="flex items-start gap-3 mb-4">
                    <XCircle size={22} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="font-bold text-gray-900">Rechazar regla</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Indique el motivo del rechazo. Este sera visible para el administrador RNEC.
                        </p>
                    </div>
                </div>

                <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 transition resize-none"
                    placeholder="Escriba el motivo del rechazo..."
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-60 flex items-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Rechazar
                    </button>
                </div>
            </div>
        </div>
    )
}

// -- Modal de confirmacion simple --

function ConfirmModal({
    open,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
    loading,
    icon,
}: {
    open: boolean
    title: string
    message: string
    confirmLabel: string
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
    icon: React.ReactNode
}) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full mx-4 animate-slide-up">
                <div className="flex items-start gap-3 mb-4">
                    {icon}
                    <div>
                        <h3 className="font-bold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-60 flex items-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

// -- Pagina principal --

export default function BandejaAprobacion() {
    const [rules, setRules] = useState<FraudRule[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tab, setTab] = useState<"PENDING" | "ALL">("PENDING")

    // Modales
    const [rejectingId, setRejectingId] = useState<number | null>(null)
    const [approvingId, setApprovingId] = useState<number | null>(null)
    const [deactivatingId, setDeactivatingId] = useState<number | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    // Detalle
    const [detailRule, setDetailRule] = useState<FraudRule | null>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    const fetchRules = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getRules()
            setRules(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudieron cargar las reglas.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRules()
    }, [])

    const handleApprove = async () => {
        if (approvingId === null) return
        setActionLoading(true)
        try {
            await approveRule(approvingId)
            setApprovingId(null)
            await fetchRules()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al aprobar la regla.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async (motivo: string) => {
        if (rejectingId === null) return
        setActionLoading(true)
        try {
            await rejectRule(rejectingId, { motivo })
            setRejectingId(null)
            await fetchRules()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al rechazar la regla.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeactivate = async () => {
        if (deactivatingId === null) return
        setActionLoading(true)
        try {
            await deleteRule(deactivatingId)
            setDeactivatingId(null)
            await fetchRules()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al desactivar la regla.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleViewDetail = async (id: number) => {
        setLoadingDetail(true)
        setDetailRule(null)
        try {
            const rule = await getRuleById(id)
            setDetailRule(rule)
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo cargar el detalle.")
        } finally {
            setLoadingDetail(false)
        }
    }

    // Filtrado por tab
    const filtered = tab === "PENDING"
        ? rules.filter((r) => r.approvalStatus === "PENDING")
        : rules

    const pendingCount = rules.filter((r) => r.approvalStatus === "PENDING").length

    return (
        <div className="bg-[#f5f6f7] h-full">

            <main className="flex-1 px-6 py-10">
                <div className="max-w-6xl mx-auto">
                    {/* Titulo */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Bandeja de Aprobacion</h2>
                        <p className="text-gray-600">
                            Revise, apruebe o rechace las reglas pendientes del motor antifraude.
                        </p>
                    </div>

                    {/* Tabs */}
                    {!loading && (
                        <div className="flex gap-1 mb-6 bg-white rounded-xl border p-1 w-fit">
                            <button
                                onClick={() => setTab("PENDING")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "PENDING"
                                        ? "bg-red-500 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                Pendientes
                                {pendingCount > 0 && (
                                    <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setTab("ALL")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "ALL"
                                        ? "bg-red-500 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                Todas las reglas
                            </button>
                        </div>
                    )}

                    {/* Detalle */}
                    {loadingDetail && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-red-500" />
                        </div>
                    )}
                    {detailRule && !loadingDetail && (
                        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6 animate-slide-up">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-gray-900">Detalle de regla</h3>
                                <button onClick={() => setDetailRule(null)} className="text-gray-400 hover:text-gray-600 transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">NOMBRE</p>
                                    <p className="font-semibold text-gray-900">{detailRule.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">TIPO</p>
                                    <p className="text-sm text-gray-700">{ruleTypeLabels[detailRule.ruleType]}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">ESTADO</p>
                                    <StatusBadge status={detailRule.approvalStatus} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">PESO DE RIESGO</p>
                                    <p className="text-sm text-gray-700 font-medium">{detailRule.riskScoreWeight}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">CREADA POR</p>
                                    <p className="text-sm text-gray-700">{detailRule.createdBy}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">APROBADA POR</p>
                                    <p className="text-sm text-gray-700">{detailRule.approvedBy ?? "—"}</p>
                                </div>
                            </div>

                            {/* Parametros */}
                            <div className="mt-6">
                                <h4 className="text-xs text-gray-500 mb-3 font-semibold tracking-wide">PARAMETROS</h4>
                                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(paramFieldsByType[detailRule.ruleType] ?? []).map((f) => (
                                        <div key={f.key}>
                                            <p className="text-sm font-medium text-gray-700">{f.label}</p>
                                            <p className="text-sm text-gray-900">{detailRule.parameters[f.key] ?? "—"}</p>
                                            <p className="text-xs text-gray-400">{f.hint}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Motivo de rechazo */}
                            {detailRule.approvalStatus === "REJECTED" && detailRule.rejectionReason && (
                                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-xs text-red-500 font-semibold mb-1">MOTIVO DE RECHAZO</p>
                                    <p className="text-sm text-red-700">{detailRule.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">Cargando reglas...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="bg-white rounded-2xl border p-8 text-center mb-6">
                            <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                            <p className="text-gray-700 font-semibold mb-2">{error}</p>
                            <button onClick={fetchRules} className="text-red-500 text-sm font-medium hover:underline">
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* Tabla */}
                    {!loading && !error && filtered.length > 0 && (
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="px-4 py-3 font-semibold text-gray-600">Nombre</th>
                                            <th className="px-4 py-3 font-semibold text-gray-600">Tipo</th>
                                            <th className="px-4 py-3 font-semibold text-gray-600 text-center">Peso</th>
                                            <th className="px-4 py-3 font-semibold text-gray-600 text-center">Estado</th>
                                            <th className="px-4 py-3 font-semibold text-gray-600">Creado por</th>
                                            <th className="px-4 py-3 font-semibold text-gray-600 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((rule) => {
                                            const isDeleted = rule.deletedAt !== null
                                            return (
                                                <tr
                                                    key={rule.id}
                                                    className={`border-b last:border-b-0 hover:bg-gray-50 transition ${isDeleted ? "opacity-50" : ""}`}
                                                >
                                                    <td className="px-4 py-3 font-medium text-gray-900">{rule.name}</td>
                                                    <td className="px-4 py-3 text-gray-600">{ruleTypeLabels[rule.ruleType]}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="font-semibold text-gray-800">{rule.riskScoreWeight}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <StatusBadge status={rule.approvalStatus} />
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">{rule.createdBy}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => handleViewDetail(rule.id)}
                                                                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
                                                                title="Ver detalle"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            {rule.approvalStatus === "PENDING" && !isDeleted && (
                                                                <>
                                                                    <button
                                                                        onClick={() => setApprovingId(rule.id)}
                                                                        className="p-1.5 rounded-lg hover:bg-green-50 transition text-green-600 hover:text-green-700"
                                                                        title="Aprobar"
                                                                    >
                                                                        <Check size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setRejectingId(rule.id)}
                                                                        className="p-1.5 rounded-lg hover:bg-red-50 transition text-red-500 hover:text-red-600"
                                                                        title="Rechazar"
                                                                    >
                                                                        <XCircle size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {rule.approvalStatus === "APPROVED" && !isDeleted && (
                                                                <button
                                                                    onClick={() => setDeactivatingId(rule.id)}
                                                                    className="p-1.5 rounded-lg hover:bg-orange-50 transition text-orange-500 hover:text-orange-600"
                                                                    title="Desactivar"
                                                                >
                                                                    <Power size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Sin resultados */}
                    {!loading && !error && filtered.length === 0 && (
                        <div className="bg-white rounded-2xl border p-8 text-center">
                            <ShieldAlert size={40} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-semibold">
                                {tab === "PENDING"
                                    ? "No hay reglas pendientes de aprobacion."
                                    : "No se encontraron reglas."}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Las reglas creadas por el administrador RNEC apareceran aqui para su revision.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modales */}
            <ConfirmModal
                open={approvingId !== null}
                title="Aprobar regla"
                message="Esta regla entrara en produccion inmediatamente despues de la aprobacion. Confirme que ha revisado los parametros."
                confirmLabel="Aprobar"
                onConfirm={handleApprove}
                onCancel={() => setApprovingId(null)}
                loading={actionLoading}
                icon={<Check size={22} className="text-green-500 mt-0.5 shrink-0" />}
            />

            <RejectModal
                open={rejectingId !== null}
                onConfirm={handleReject}
                onCancel={() => setRejectingId(null)}
                loading={actionLoading}
            />

            <ConfirmModal
                open={deactivatingId !== null}
                title="Desactivar regla"
                message="La regla sera desactivada y dejara de evaluar eventos. Permanecera visible para trazabilidad."
                confirmLabel="Desactivar"
                onConfirm={handleDeactivate}
                onCancel={() => setDeactivatingId(null)}
                loading={actionLoading}
                icon={<AlertTriangle size={22} className="text-orange-500 mt-0.5 shrink-0" />}
            />
        </div>
    )
}
