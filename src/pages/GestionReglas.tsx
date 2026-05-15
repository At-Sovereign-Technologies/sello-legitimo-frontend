// Pagina de gestion de reglas antifraude (ADMIN_RNEC)
// Tabla maestra + formulario crear/editar + detalle de regla

import { useState, useEffect } from "react"
import {
    Loader2,
    AlertCircle,
    Plus,
    Eye,
    Pencil,
    X,
    ShieldAlert,
    ChevronDown,
    ToggleLeft,
    ToggleRight,
    AlertTriangle,
} from "lucide-react"
import { getRules, createRule, patchRule, getRuleById } from "../api/fraudEngine.api"
import type {
    FraudRule,
    FraudRuleCreatePayload,
    FraudRulePatchPayload,
    RuleType,
    ApprovalStatus,
} from "../types/fraudEngine"


// -- Configuracion de badges de estado --

const approvalConfig: Record<ApprovalStatus, { label: string; bg: string; text: string }> = {
    PENDING: { label: "Pendiente", bg: "bg-yellow-100", text: "text-yellow-700" },
    APPROVED: { label: "Aprobada", bg: "bg-green-100", text: "text-green-700" },
    REJECTED: { label: "Rechazada", bg: "bg-red-100", text: "text-red-700" },
}

// -- Labels de tipo de regla --

const ruleTypeLabels: Record<RuleType, string> = {
    FAILED_AUTH_ATTEMPTS: "Intentos fallidos de autenticacion",
    BIOMETRIC_INCONSISTENCY: "Inconsistencia biometrica",
    DUPLICATE_VOTE_ATTEMPT: "Intento de voto duplicado",
    ANOMALOUS_TIME_PATTERN: "Patron anomalo de tiempo",
    IRREGULAR_TABLE_BEHAVIOR: "Comportamiento irregular de mesa",
}

// -- Definicion de campos de parameters por ruleType --

interface ParamField {
    key: string
    label: string
    hint: string
    type: "integer" | "decimal"
    min: number
}

const paramFieldsByType: Record<RuleType, ParamField[]> = {
    FAILED_AUTH_ATTEMPTS: [
        { key: "maxFailedAttempts", label: "Maximo de intentos fallidos", hint: "Numero de fallos en la mesa dentro de la ventana", type: "integer", min: 1 },
        { key: "windowMinutes", label: "Ventana de tiempo (minutos)", hint: "Periodo de tiempo a evaluar en minutos", type: "integer", min: 1 },
    ],
    BIOMETRIC_INCONSISTENCY: [
        { key: "maxInconsistencies", label: "Maximo de inconsistencias", hint: "Numero de no-match biometrico para un documento", type: "integer", min: 1 },
        { key: "windowHours", label: "Ventana de tiempo (horas)", hint: "Periodo de tiempo a evaluar en horas", type: "integer", min: 1 },
    ],
    DUPLICATE_VOTE_ATTEMPT: [
        { key: "windowHours", label: "Ventana de tiempo (horas)", hint: "Detecta voto repetido del mismo documento en esta ventana", type: "integer", min: 1 },
    ],
    ANOMALOUS_TIME_PATTERN: [
        { key: "maxAuthInWindow", label: "Maximo de autenticaciones", hint: "Rafaga maxima de autenticaciones por mesa", type: "integer", min: 1 },
        { key: "windowSeconds", label: "Ventana de tiempo (segundos)", hint: "Periodo de tiempo a evaluar en segundos", type: "integer", min: 1 },
    ],
    IRREGULAR_TABLE_BEHAVIOR: [
        { key: "deviationThreshold", label: "Umbral de desviacion", hint: "Veces que una mesa supera el promedio del puesto (mayor a 1.0)", type: "decimal", min: 1.01 },
        { key: "minComparableTables", label: "Mesas comparables minimas", hint: "Minimo de mesas comparables requeridas", type: "integer", min: 1 },
    ],
}

// -- Componente: Badge de estado --

function StatusBadge({ status }: { status: ApprovalStatus }) {
    const config = approvalConfig[status] ?? approvalConfig.PENDING
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    )
}

// -- Componente: Modal de confirmacion --

function ConfirmModal({
    open,
    title,
    message,
    onConfirm,
    onCancel,
}: {
    open: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
}) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full mx-4 animate-slide-up">
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={22} className="text-yellow-500 mt-0.5 shrink-0" />
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
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    )
}

// -- Componente: Formulario de creacion/edicion --

function RuleForm({
    editingRule,
    onSave,
    onCancel,
    saving,
}: {
    editingRule: FraudRule | null
    onSave: (payload: FraudRuleCreatePayload | FraudRulePatchPayload, isEdit: boolean) => void
    onCancel: () => void
    saving: boolean
}) {
    const isEdit = editingRule !== null

    const [name, setName] = useState(editingRule?.name ?? "")
    const [ruleType, setRuleType] = useState<RuleType>(editingRule?.ruleType ?? "FAILED_AUTH_ATTEMPTS")
    const [isActive, setIsActive] = useState(editingRule?.isActive ?? true)
    const [riskScoreWeight, setRiskScoreWeight] = useState(editingRule?.riskScoreWeight ?? 50)
    const [alertType, setAlertType] = useState(editingRule?.alertType ?? "")
    const [parameters, setParameters] = useState<Record<string, number>>(editingRule?.parameters ?? {})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showEditWarning, setShowEditWarning] = useState(false)

    // Al cambiar el tipo de regla, resetear parameters
    useEffect(() => {
        if (!isEdit) {
            const fields = paramFieldsByType[ruleType]
            const newParams: Record<string, number> = {}
            fields.forEach((f) => {
                newParams[f.key] = f.type === "decimal" ? 1.5 : 1
            })
            setParameters(newParams)
            // Derivar alertType del ruleType
            setAlertType(ruleType)
        }
    }, [ruleType, isEdit])

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!isEdit && !name.trim()) {
            newErrors.name = "El nombre es obligatorio"
        }

        if (riskScoreWeight < 0 || riskScoreWeight > 100) {
            newErrors.riskScoreWeight = "Debe estar entre 0 y 100"
        }

        const fields = paramFieldsByType[ruleType]
        fields.forEach((f) => {
            const val = parameters[f.key]
            if (val === undefined || val === null || isNaN(val)) {
                newErrors[f.key] = "Campo obligatorio"
            } else if (f.type === "integer" && (!Number.isInteger(val) || val < 1)) {
                newErrors[f.key] = "Debe ser un entero mayor a 0"
            } else if (f.type === "decimal" && val <= 1.0) {
                newErrors[f.key] = "Debe ser un decimal mayor a 1.0"
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            setShowEditWarning(true)
            return
        }

        const payload: FraudRuleCreatePayload = {
            name,
            ruleType,
            isActive,
            parameters,
            alertType: alertType || ruleType,
            riskScoreWeight,
        }
        onSave(payload, false)
    }

    const handleConfirmEdit = () => {
        setShowEditWarning(false)
        const payload: FraudRulePatchPayload = {
            parameters,
            riskScoreWeight,
            isActive,
        }
        onSave(payload, true)
    }

    const fields = paramFieldsByType[ruleType]

    return (
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">
                    {isEdit ? `Editar regla: ${editingRule.name}` : "Nueva regla antifraude"}
                </h3>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre (solo en creacion) */}
                {!isEdit && (
                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">NOMBRE DE LA REGLA</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 transition"
                            placeholder="Ej: Control de intentos fallidos por mesa"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                )}

                {/* Tipo de regla (solo en creacion) */}
                {!isEdit && (
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">TIPO DE REGLA</label>
                        <div className="relative">
                            <select
                                value={ruleType}
                                onChange={(e) => setRuleType(e.target.value as RuleType)}
                                className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer appearance-none bg-white focus:ring-2 focus:ring-red-200 transition"
                            >
                                {Object.entries(ruleTypeLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Tipo de alerta */}
                {!isEdit && (
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">TIPO DE ALERTA</label>
                        <input
                            value={alertType}
                            onChange={(e) => setAlertType(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 transition"
                            placeholder="Ej: FAILED_AUTH_ATTEMPTS"
                        />
                    </div>
                )}

                {/* Peso de riesgo */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">PESO DE RIESGO (0-100)</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={riskScoreWeight}
                        onChange={(e) => setRiskScoreWeight(Number(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 transition"
                    />
                    {errors.riskScoreWeight && <p className="text-xs text-red-500 mt-1">{errors.riskScoreWeight}</p>}
                </div>

                {/* Toggle activo */}
                <div className="flex items-center gap-3">
                    <label className="block text-xs text-gray-500">ESTADO INICIAL</label>
                    <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className="flex items-center gap-2 text-sm"
                    >
                        {isActive ? (
                            <ToggleRight size={28} className="text-green-500" />
                        ) : (
                            <ToggleLeft size={28} className="text-gray-400" />
                        )}
                        <span className={isActive ? "text-green-700 font-medium" : "text-gray-500"}>
                            {isActive ? "Activa" : "Inactiva"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Parameters dinamicos */}
            <div className="mt-6">
                <h4 className="text-xs text-gray-500 mb-3 font-semibold tracking-wide">PARAMETROS DE LA REGLA</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                    {fields.map((field) => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                            <input
                                type="number"
                                step={field.type === "decimal" ? "0.1" : "1"}
                                min={field.min}
                                value={parameters[field.key] ?? ""}
                                onChange={(e) =>
                                    setParameters((prev) => ({
                                        ...prev,
                                        [field.key]: field.type === "decimal" ? parseFloat(e.target.value) : parseInt(e.target.value, 10),
                                    }))
                                }
                                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 transition bg-white"
                            />
                            <p className="text-xs text-gray-400 mt-1">{field.hint}</p>
                            {errors[field.key] && <p className="text-xs text-red-500 mt-0.5">{errors[field.key]}</p>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-6 py-2.5 text-sm bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-60 flex items-center gap-2"
                >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    {isEdit ? "Guardar cambios" : "Crear regla"}
                </button>
            </div>

            {/* Modal de advertencia al editar */}
            <ConfirmModal
                open={showEditWarning}
                title="Advertencia de edicion"
                message="Editar esta regla la sacara de produccion hasta nueva aprobacion del CNE. El estado volvera a PENDIENTE."
                onConfirm={handleConfirmEdit}
                onCancel={() => setShowEditWarning(false)}
            />
        </div>
    )
}

// -- Componente: Panel de detalle --

function RuleDetail({
    rule,
    onClose,
}: {
    rule: FraudRule
    onClose: () => void
}) {
    const fields = paramFieldsByType[rule.ruleType] ?? []

    return (
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">Detalle de regla</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-gray-500">NOMBRE</p>
                    <p className="font-semibold text-gray-900">{rule.name}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">TIPO</p>
                    <p className="text-sm text-gray-700">{ruleTypeLabels[rule.ruleType]}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">ESTADO DE APROBACION</p>
                    <StatusBadge status={rule.approvalStatus} />
                </div>
                <div>
                    <p className="text-xs text-gray-500">PESO DE RIESGO</p>
                    <p className="text-sm text-gray-700 font-medium">{rule.riskScoreWeight}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">TIPO DE ALERTA</p>
                    <p className="text-sm text-gray-700">{rule.alertType}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">ACTIVA</p>
                    <p className={`text-sm font-medium ${rule.isActive ? "text-green-600" : "text-gray-400"}`}>
                        {rule.isActive ? "Si" : "No"}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">CREADA POR</p>
                    <p className="text-sm text-gray-700">{rule.createdBy}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">APROBADA POR</p>
                    <p className="text-sm text-gray-700">{rule.approvedBy ?? "—"}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">CREADA</p>
                    <p className="text-sm text-gray-700">{new Date(rule.createdAt).toLocaleString("es-CO")}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">ULTIMA ACTUALIZACION</p>
                    <p className="text-sm text-gray-700">{new Date(rule.updatedAt).toLocaleString("es-CO")}</p>
                </div>
            </div>

            {/* Parametros */}
            <div className="mt-6">
                <h4 className="text-xs text-gray-500 mb-3 font-semibold tracking-wide">PARAMETROS</h4>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fields.map((f) => (
                        <div key={f.key}>
                            <p className="text-sm font-medium text-gray-700">{f.label}</p>
                            <p className="text-sm text-gray-900">{rule.parameters[f.key] ?? "—"}</p>
                            <p className="text-xs text-gray-400">{f.hint}</p>
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <p className="text-sm text-gray-400">Sin parametros definidos</p>
                    )}
                </div>
            </div>

            {/* Motivo de rechazo */}
            {rule.approvalStatus === "REJECTED" && rule.rejectionReason && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-xs text-red-500 font-semibold mb-1">MOTIVO DE RECHAZO</p>
                    <p className="text-sm text-red-700">{rule.rejectionReason}</p>
                </div>
            )}

            {/* Desactivada */}
            {rule.deletedAt && (
                <div className="mt-4 bg-gray-100 border rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-semibold mb-1">DESACTIVADA</p>
                    <p className="text-sm text-gray-600">
                        Esta regla fue desactivada el {new Date(rule.deletedAt).toLocaleString("es-CO")}
                    </p>
                </div>
            )}
        </div>
    )
}

// -- Pagina principal --

export default function GestionReglas() {
    const [rules, setRules] = useState<FraudRule[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [typeFilter, setTypeFilter] = useState<string>("ALL")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")

    // Formulario
    const [showForm, setShowForm] = useState(false)
    const [editingRule, setEditingRule] = useState<FraudRule | null>(null)
    const [saving, setSaving] = useState(false)

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
            setError(err instanceof Error ? err.message : "No se pudieron cargar las reglas. Intente nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRules()
    }, [])

    const handleViewDetail = async (id: number) => {
        setLoadingDetail(true)
        setDetailRule(null)
        setShowForm(false)
        try {
            const rule = await getRuleById(id)
            setDetailRule(rule)
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo cargar el detalle de la regla.")
        } finally {
            setLoadingDetail(false)
        }
    }

    const handleEdit = (rule: FraudRule) => {
        setEditingRule(rule)
        setShowForm(true)
        setDetailRule(null)
    }

    const handleCreate = () => {
        setEditingRule(null)
        setShowForm(true)
        setDetailRule(null)
    }

    const handleSave = async (payload: FraudRuleCreatePayload | FraudRulePatchPayload, isEdit: boolean) => {
        setSaving(true)
        setError(null)
        try {
            if (isEdit && editingRule) {
                await patchRule(editingRule.id, payload as FraudRulePatchPayload)
            } else {
                await createRule(payload as FraudRuleCreatePayload)
            }
            setShowForm(false)
            setEditingRule(null)
            await fetchRules()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar la regla.")
        } finally {
            setSaving(false)
        }
    }

    // Filtrado en cliente
    const filtered = rules.filter((r) => {
        const matchesType = typeFilter === "ALL" || r.ruleType === typeFilter
        const matchesStatus = statusFilter === "ALL" || r.approvalStatus === statusFilter
        return matchesType && matchesStatus
    })

    return (
        <div className="bg-[#f5f6f7] h-full">

            <main className="flex-1 px-6 py-10">
                <div className="max-w-6xl mx-auto">
                    {/* Titulo */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Gestion de Reglas Antifraude</h2>
                        <p className="text-gray-600">
                            Configure y ajuste las reglas del motor de deteccion de fraude electoral.
                        </p>
                    </div>

                    {/* Barra de acciones */}
                    {!loading && !error && (
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="border rounded-lg px-3 py-2.5 bg-white text-sm text-gray-700 outline-none cursor-pointer"
                            >
                                <option value="ALL">Todos los tipos</option>
                                {Object.entries(ruleTypeLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border rounded-lg px-3 py-2.5 bg-white text-sm text-gray-700 outline-none cursor-pointer"
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value="PENDING">Pendiente</option>
                                <option value="APPROVED">Aprobada</option>
                                <option value="REJECTED">Rechazada</option>
                            </select>

                            <div className="flex-1" />

                            <button
                                onClick={handleCreate}
                                className="bg-red-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2 text-sm"
                            >
                                <Plus size={16} />
                                Nueva regla
                            </button>
                        </div>
                    )}

                    {/* Formulario de creacion/edicion */}
                    {showForm && (
                        <RuleForm
                            editingRule={editingRule}
                            onSave={handleSave}
                            onCancel={() => {
                                setShowForm(false)
                                setEditingRule(null)
                            }}
                            saving={saving}
                        />
                    )}

                    {/* Panel de detalle */}
                    {loadingDetail && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-red-500" />
                        </div>
                    )}
                    {detailRule && !loadingDetail && (
                        <RuleDetail rule={detailRule} onClose={() => setDetailRule(null)} />
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
                                            <th className="px-4 py-3 font-semibold text-gray-600">Aprobado por</th>
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
                                                    <td className="px-4 py-3 text-gray-600">{rule.approvedBy ?? "—"}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleViewDetail(rule.id)}
                                                                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
                                                                title="Ver detalle"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            {!isDeleted && (
                                                                <button
                                                                    onClick={() => handleEdit(rule)}
                                                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
                                                                    title="Editar"
                                                                >
                                                                    <Pencil size={16} />
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
                            <p className="text-gray-500 font-semibold">No se encontraron reglas.</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Cree una nueva regla para comenzar a configurar el motor antifraude.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
