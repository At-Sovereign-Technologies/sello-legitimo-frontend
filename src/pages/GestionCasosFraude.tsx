// Pagina de gestion de casos de fraude electoral (SR-M6)
// Todas las vistas en un solo archivo: listado, crear, detalle, auditoria
// Navegacion interna via estado local (sin React Router interno)

import { useState, useEffect, useCallback } from "react"
import {
    Loader2,
    AlertCircle,
    Plus,
    Eye,
    X,
    ShieldAlert,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    ArrowRight,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,

    User,
    Hash,
    Search,
    Gavel,
} from "lucide-react"
import {
    listCasos,
    getCaso,
    createCaso,
    transicionarEstado,
    getAuditoria,
} from "../api/fraudCases.api"
import type { ListCasosFilters, FraudApiError } from "../api/fraudCases.api"
import type {
    CasoFraude,
    AuditoriaEntry,
    CrearCasoPayload,
    TipologiaFraude,
    NivelPrioridad,
    EntidadCompetente,
    EstadoCaso,
    ActorRol,
} from "../types/fraudCases"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTES — UNICA FUENTE DE VERDAD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TIPOLOGIAS: Record<TipologiaFraude, string> = {
    SUPLANTACION: "Suplantación",
    DOBLE_VOTO: "Doble Voto",
    ALTERACION_ACTA: "Alteración de Acta",
    COMPRA_VOTO: "Compra de Voto",
    OTRO: "Otro",
}

const PRIORIDADES: Record<NivelPrioridad, string> = {
    BAJO: "Bajo",
    MEDIO: "Medio",
    ALTO: "Alto",
    CRITICO: "Crítico",
}

const ENTIDADES: Record<EntidadCompetente, string> = {
    RNEC: "RNEC",
    CNE: "CNE",
    MESA_JUSTICIA: "Mesa de Justicia",
    FISCALIA: "Fiscalía",
}

const ESTADOS: Record<EstadoCaso, string> = {
    DETECTADO: "Detectado",
    EN_EVALUACION: "En Evaluación",
    EN_INVESTIGACION: "En Investigación",
    ESCALADO: "Escalado",
    CONFIRMADO: "Confirmado",
    DESCARTADO: "Descartado",
    CERRADO: "Cerrado",
}

const ROLES: Record<ActorRol, string> = {
    ADMIN_RNEC: "Administrador RNEC",
    DELEGADO_CNE: "Delegado CNE",
    DELEGADO_MESA_JUSTICIA: "Delegado Mesa de Justicia",
    DELEGADO_FISCALIA: "Delegado Fiscalía",
}

// -- Maquina de estados: transiciones legales --

const STATE_MACHINE: Record<EstadoCaso, EstadoCaso[]> = {
    DETECTADO: ["EN_EVALUACION"],
    EN_EVALUACION: ["EN_INVESTIGACION"],
    EN_INVESTIGACION: ["ESCALADO"],
    ESCALADO: ["CONFIRMADO", "DESCARTADO"],
    CONFIRMADO: ["CERRADO"],
    DESCARTADO: ["CERRADO"],
    CERRADO: [], // terminal
}

// -- Badges de prioridad --

const PRIORITY_COLORS: Record<NivelPrioridad, { bg: string; text: string; ring: string }> = {
    BAJO: { bg: "bg-green-100", text: "text-green-700", ring: "ring-green-200" },
    MEDIO: { bg: "bg-yellow-100", text: "text-yellow-700", ring: "ring-yellow-200" },
    ALTO: { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-200" },
    CRITICO: { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-200" },
}

// -- Badges de estado --

const STATE_COLORS: Record<EstadoCaso, { bg: string; text: string }> = {
    DETECTADO: { bg: "bg-blue-100", text: "text-blue-700" },
    EN_EVALUACION: { bg: "bg-indigo-100", text: "text-indigo-700" },
    EN_INVESTIGACION: { bg: "bg-purple-100", text: "text-purple-700" },
    ESCALADO: { bg: "bg-orange-100", text: "text-orange-700" },
    CONFIRMADO: { bg: "bg-red-100", text: "text-red-700" },
    DESCARTADO: { bg: "bg-gray-100", text: "text-gray-600" },
    CERRADO: { bg: "bg-gray-200", text: "text-gray-500" },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTES AUXILIARES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// -- Toast de notificacion --

function Toast({
    message,
    type,
    onClose,
}: {
    message: string
    type: "success" | "error" | "info" | "warning"
    onClose: () => void
}) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000)
        return () => clearTimeout(timer)
    }, [onClose])

    const colorMap = {
        success: "bg-green-50 border-green-300 text-green-800",
        error: "bg-red-50 border-red-300 text-red-800",
        info: "bg-blue-50 border-blue-300 text-blue-800",
        warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
    }
    const iconMap = {
        success: <CheckCircle2 size={18} className="text-green-500 shrink-0" />,
        error: <AlertCircle size={18} className="text-red-500 shrink-0" />,
        info: <FileText size={18} className="text-blue-500 shrink-0" />,
        warning: <AlertTriangle size={18} className="text-yellow-500 shrink-0" />,
    }

    return (
        <div className="fixed top-6 right-6 z-[100] animate-slide-up max-w-md">
            <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${colorMap[type]}`}>
                {iconMap[type]}
                <p className="text-sm font-medium flex-1">{message}</p>
                <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition">
                    <X size={16} />
                </button>
            </div>
        </div>
    )
}

// -- Badge de prioridad --

function PriorityBadge({ level }: { level: NivelPrioridad }) {
    const config = PRIORITY_COLORS[level] ?? PRIORITY_COLORS.BAJO
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.bg} ${config.text}`}>
            {PRIORIDADES[level]}
        </span>
    )
}

// -- Badge de estado --

function StateBadge({ state }: { state: EstadoCaso }) {
    const config = STATE_COLORS[state] ?? STATE_COLORS.DETECTADO
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.bg} ${config.text}`}>
            {ESTADOS[state]}
        </span>
    )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PANEL DE SESION SIMULADA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SessionPanel({
    actorId,
    actorRol,
    onChangeActorId,
    onChangeActorRol,
}: {
    actorId: string
    actorRol: ActorRol | ""
    onChangeActorId: (v: string) => void
    onChangeActorRol: (v: ActorRol | "") => void
}) {
    return (
        <div className="bg-white rounded-2xl border shadow-sm p-4 mb-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
                <User size={16} className="text-red-500" />
                <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Sesión Simulada</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">ACTOR ID</label>
                    <input
                        value={actorId}
                        onChange={(e) => onChangeActorId(e.target.value.slice(0, 100))}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200 transition"
                        placeholder="Ej: admin.rnec.01"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">ROL</label>
                    <div className="relative">
                        <select
                            value={actorRol}
                            onChange={(e) => onChangeActorRol(e.target.value as ActorRol | "")}
                            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer appearance-none bg-white focus:ring-2 focus:ring-red-200 transition"
                        >
                            <option value="">Seleccionar rol...</option>
                            {(Object.entries(ROLES) as [ActorRol, string][]).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORMULARIO CREAR CASO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CreateCaseForm({
    initialCasoPrecedente,
    onSave,
    onCancel,
    saving,
}: {
    initialCasoPrecedente?: string | null
    onSave: (payload: CrearCasoPayload) => void
    onCancel: () => void
    saving: boolean
}) {
    const [alertasOrigen, setAlertasOrigen] = useState<string[]>([])
    const [alertaInput, setAlertaInput] = useState("")
    const [tipologiaFraude, setTipologiaFraude] = useState<TipologiaFraude>("SUPLANTACION")
    const [nivelPrioridad, setNivelPrioridad] = useState<NivelPrioridad>("MEDIO")
    const [responsable, setResponsable] = useState("")
    const [entidadCompetente, setEntidadCompetente] = useState<EntidadCompetente>("RNEC")
    const [casoPrecedente, setCasoPrecedente] = useState(initialCasoPrecedente ?? "")
    const [errors, setErrors] = useState<Record<string, string>>({})

    const addAlerta = () => {
        const trimmed = alertaInput.trim()
        if (trimmed && !alertasOrigen.includes(trimmed)) {
            setAlertasOrigen((prev) => [...prev, trimmed])
            setAlertaInput("")
        }
    }

    const removeAlerta = (uuid: string) => {
        setAlertasOrigen((prev) => prev.filter((a) => a !== uuid))
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (alertasOrigen.length === 0) newErrors.alertas = "Debe agregar al menos una alerta de origen"
        if (!responsable.trim()) newErrors.responsable = "El responsable institucional es obligatorio"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const payload: CrearCasoPayload = {
            alertasOrigen,
            tipologiaFraude,
            nivelPrioridad,
            responsableInstitucional: responsable.trim(),
            entidadCompetente,
            casoPrecedente: casoPrecedente.trim() || null,
        }
        onSave(payload)
    }

    return (
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">Nuevo Caso de Fraude</h3>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alertas de origen */}
                <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">ALERTAS DE ORIGEN (UUID)</label>
                    <div className="flex gap-2">
                        <input
                            value={alertaInput}
                            onChange={(e) => setAlertaInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    addAlerta()
                                }
                            }}
                            className="flex-1 border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 transition"
                            placeholder="Ingrese UUID de alerta y presione Agregar"
                        />
                        <button
                            onClick={addAlerta}
                            className="px-4 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                        >
                            Agregar
                        </button>
                    </div>
                    {alertasOrigen.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {alertasOrigen.map((a) => (
                                <span
                                    key={a}
                                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-mono"
                                >
                                    {a.length > 16 ? `${a.slice(0, 8)}…${a.slice(-4)}` : a}
                                    <button
                                        onClick={() => removeAlerta(a)}
                                        className="hover:text-blue-900 transition"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    {errors.alertas && <p className="text-xs text-red-500 mt-1">{errors.alertas}</p>}
                </div>

                {/* Tipologia */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">TIPOLOGÍA DE FRAUDE</label>
                    <div className="relative">
                        <select
                            value={tipologiaFraude}
                            onChange={(e) => setTipologiaFraude(e.target.value as TipologiaFraude)}
                            className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer appearance-none bg-white focus:ring-2 focus:ring-red-200 transition"
                        >
                            {(Object.entries(TIPOLOGIAS) as [TipologiaFraude, string][]).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Prioridad */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">NIVEL DE PRIORIDAD</label>
                    <div className="relative">
                        <select
                            value={nivelPrioridad}
                            onChange={(e) => setNivelPrioridad(e.target.value as NivelPrioridad)}
                            className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer appearance-none bg-white focus:ring-2 focus:ring-red-200 transition"
                        >
                            {(Object.entries(PRIORIDADES) as [NivelPrioridad, string][]).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Responsable institucional */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">RESPONSABLE INSTITUCIONAL</label>
                    <input
                        value={responsable}
                        onChange={(e) => setResponsable(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 transition"
                        placeholder="Ej: fiscalia-bogota-1"
                    />
                    {errors.responsable && <p className="text-xs text-red-500 mt-1">{errors.responsable}</p>}
                </div>

                {/* Entidad competente */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">ENTIDAD COMPETENTE</label>
                    <div className="relative">
                        <select
                            value={entidadCompetente}
                            onChange={(e) => setEntidadCompetente(e.target.value as EntidadCompetente)}
                            className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer appearance-none bg-white focus:ring-2 focus:ring-red-200 transition"
                        >
                            {(Object.entries(ENTIDADES) as [EntidadCompetente, string][]).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Caso precedente */}
                <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">
                        CASO PRECEDENTE (OPCIONAL)
                    </label>
                    <input
                        value={casoPrecedente}
                        onChange={(e) => setCasoPrecedente(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 transition"
                        placeholder="UUID de un caso CERRADO (dejar vacío si no aplica)"
                    />
                    {casoPrecedente.trim() && (
                        <div className="flex items-start gap-2 mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
                            <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-yellow-700">
                                El caso precedente referenciado debe estar en estado <strong>CERRADO</strong>.
                                Si no lo está, la API rechazará la solicitud.
                            </p>
                        </div>
                    )}
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
                    Crear caso
                </button>
            </div>
        </div>
    )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DETALLE DEL CASO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CaseDetail({
    caso,
    onBack,
    onTransition,
    onRefreshAudit,
    onCreateDerived,
    transitioning,
    refreshingAudit,
    auditEntries,
}: {
    caso: CasoFraude
    onBack: () => void
    onTransition: (nuevoEstado: EstadoCaso, motivo: string) => void
    onRefreshAudit: () => void
    onCreateDerived: (radicado: string) => void
    transitioning: boolean
    refreshingAudit: boolean
    auditEntries: AuditoriaEntry[]
}) {
    const [selectedTransition, setSelectedTransition] = useState<EstadoCaso | "">("")
    const [motivo, setMotivo] = useState("")

    const legalDestinations = STATE_MACHINE[caso.estado] ?? []
    const canClose = caso.estado === "CONFIRMADO" || caso.estado === "DESCARTADO"
    const isClosed = caso.estado === "CERRADO"

    const handleTransition = () => {
        if (!selectedTransition) return
        onTransition(selectedTransition, motivo.trim())
    }

    // Parsear metadatos de auditoria de forma segura
    const parseMetadatos = (raw: string): Record<string, string> => {
        try {
            const parsed = JSON.parse(raw)
            if (typeof parsed === "object" && parsed !== null) {
                const result: Record<string, string> = {}
                for (const [k, v] of Object.entries(parsed)) {
                    result[k] = typeof v === "string" ? v : JSON.stringify(v)
                }
                return result
            }
            return {}
        } catch {
            return {}
        }
    }

    return (
        <div className="animate-slide-up">
            {/* Header con navegacion */}
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition mb-4"
            >
                <ChevronLeft size={16} /> Volver al listado
            </button>

            {/* Informacion principal */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">Caso de Fraude</h3>
                        <p className="text-sm text-gray-500 font-mono mt-0.5">{caso.radicado}</p>
                    </div>
                    <StateBadge state={caso.estado} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">TIPOLOGÍA</p>
                        <p className="text-sm font-semibold text-gray-900">{TIPOLOGIAS[caso.tipologiaFraude]}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">PRIORIDAD</p>
                        <PriorityBadge level={caso.nivelPrioridad} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">ENTIDAD COMPETENTE</p>
                        <p className="text-sm text-gray-700">{ENTIDADES[caso.entidadCompetente]}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">RESPONSABLE INSTITUCIONAL</p>
                        <p className="text-sm text-gray-700">{caso.responsableInstitucional}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">CREADO</p>
                        <p className="text-sm text-gray-700">
                            {new Date(caso.creadoEn).toLocaleString("es-CO")}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">ACTUALIZADO</p>
                        <p className="text-sm text-gray-700">
                            {new Date(caso.actualizadoEn).toLocaleString("es-CO")}
                        </p>
                    </div>
                    {caso.casoPrecedente && (
                        <div className="md:col-span-2 lg:col-span-3">
                            <p className="text-xs text-gray-500">CASO PRECEDENTE</p>
                            <p className="text-sm text-blue-600 font-mono">{caso.casoPrecedente}</p>
                        </div>
                    )}
                </div>

                {/* Alertas de origen */}
                <div className="mt-5">
                    <p className="text-xs text-gray-500 mb-2">ALERTAS DE ORIGEN</p>
                    <div className="flex flex-wrap gap-2">
                        {caso.alertasOrigen.map((a) => (
                            <span
                                key={a}
                                className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-mono"
                            >
                                {a.length > 24 ? `${a.slice(0, 8)}…${a.slice(-8)}` : a}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel de transicion */}
            {!isClosed && legalDestinations.length > 0 && (
                <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
                    <h4 className="text-xs text-gray-500 font-semibold tracking-wide mb-4 uppercase">
                        Transicionar Estado
                    </h4>

                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">NUEVO ESTADO</label>
                            <div className="relative">
                                <select
                                    value={selectedTransition}
                                    onChange={(e) => setSelectedTransition(e.target.value as EstadoCaso | "")}
                                    className="w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer appearance-none bg-white focus:ring-2 focus:ring-red-200 transition"
                                >
                                    <option value="">Seleccionar destino...</option>
                                    {legalDestinations
                                        .filter((d) => d !== "CERRADO")
                                        .map((dest) => (
                                            <option key={dest} value={dest}>
                                                {ESTADOS[dest]}
                                            </option>
                                        ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs text-gray-500 mb-1">MOTIVO (OPCIONAL)</label>
                        <textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value.slice(0, 2000))}
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 transition resize-none"
                            placeholder="Describa el motivo de la transición (máx. 2000 caracteres)"
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">{motivo.length}/2000</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleTransition}
                            disabled={!selectedTransition || transitioning}
                            className="px-5 py-2.5 text-sm bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-60 flex items-center gap-2"
                        >
                            {transitioning && <Loader2 size={16} className="animate-spin" />}
                            <ArrowRight size={16} />
                            Transicionar
                        </button>

                        {/* Boton cerrar solo si CONFIRMADO o DESCARTADO */}
                        {canClose && (
                            <button
                                onClick={() => onTransition("CERRADO", motivo.trim())}
                                disabled={transitioning}
                                className="px-5 py-2.5 text-sm bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-60 flex items-center gap-2"
                            >
                                {transitioning && <Loader2 size={16} className="animate-spin" />}
                                <Gavel size={16} />
                                Cerrar caso
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Caso cerrado - ofrecer crear derivado */}
            {isClosed && (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-6 text-center">
                    <Gavel size={32} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-semibold mb-1">Este caso está cerrado de forma irreversible</p>
                    <p className="text-sm text-gray-500 mb-4">
                        No se pueden realizar más transiciones. Si hay hallazgos posteriores,
                        cree un caso derivado que referencie este radicado.
                    </p>
                    <button
                        onClick={() => onCreateDerived(caso.radicado)}
                        className="px-5 py-2.5 text-sm bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition inline-flex items-center gap-2"
                    >
                        <Plus size={16} /> Crear caso derivado
                    </button>
                </div>
            )}

            {/* Auditoria */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs text-gray-500 font-semibold tracking-wide uppercase">
                        Historial de Auditoría
                    </h4>
                    <button
                        onClick={onRefreshAudit}
                        disabled={refreshingAudit}
                        className="text-sm text-red-500 hover:text-red-600 font-medium transition flex items-center gap-1 disabled:opacity-60"
                    >
                        <RefreshCw size={14} className={refreshingAudit ? "animate-spin" : ""} />
                        Refrescar
                    </button>
                </div>

                {auditEntries.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">Sin registros de auditoría</p>
                )}

                {auditEntries.length > 0 && (
                    <div className="space-y-3">
                        {auditEntries.map((entry, i) => {
                            const meta = parseMetadatos(entry.metadatos)
                            return (
                                <div
                                    key={entry.id ?? i}
                                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={14} className="text-gray-400" />
                                        <span className="text-xs text-gray-500 font-medium">
                                            {new Date(entry.timestamp).toLocaleString("es-CO")}
                                        </span>
                                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                            {entry.accion}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <User size={12} /> {entry.actor}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Hash size={12} /> {entry.rol}
                                        </span>
                                    </div>
                                    {meta.motivo && (
                                        <p className="text-sm text-gray-700 mt-2 bg-white rounded-lg p-2.5 border">
                                            {meta.motivo}
                                        </p>
                                    )}
                                    {Object.keys(meta).filter((k) => k !== "motivo").length > 0 && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition">
                                                Ver metadatos completos
                                            </summary>
                                            <pre className="text-xs text-gray-500 bg-white rounded-lg p-2.5 mt-1 border overflow-x-auto">
                                                {JSON.stringify(meta, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LISTADO DE CASOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CaseList({
    onViewDetail,
    onCreate,
}: {
    onViewDetail: (radicado: string) => void
    onCreate: () => void
}) {
    const [cases, setCases] = useState<CasoFraude[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filtros
    const [filterEstado, setFilterEstado] = useState<EstadoCaso | "">("")
    const [filterPrioridad, setFilterPrioridad] = useState<NivelPrioridad | "">("")
    const [filterTipologia, setFilterTipologia] = useState<TipologiaFraude | "">("")
    const [filterEntidad, setFilterEntidad] = useState<EntidadCompetente | "">("")

    // Paginacion
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const PAGE_SIZE = 10

    const fetchCases = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const filters: ListCasosFilters = {
                estado: filterEstado || undefined,
                nivelPrioridad: filterPrioridad || undefined,
                tipologiaFraude: filterTipologia || undefined,
                entidadCompetente: filterEntidad || undefined,
                page,
                size: PAGE_SIZE,
            }
            const response = await listCasos(filters)
            setCases(response.content)
            setTotalPages(response.totalPages)
            setTotalElements(response.totalElements)
        } catch (err) {
            const apiErr = err as FraudApiError
            setError(apiErr.message ?? "No se pudieron cargar los casos")
        } finally {
            setLoading(false)
        }
    }, [filterEstado, filterPrioridad, filterTipologia, filterEntidad, page])

    useEffect(() => {
        const initialize = async () => {
            await fetchCases()
        }
        initialize()
    }, [fetchCases])

    // Reset page cuando cambian filtros
    const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setter(e.target.value)
        setPage(0)
    }

    return (
        <>
            {/* Barra de filtros */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
                <div className="relative">
                    <select
                        value={filterEstado}
                        onChange={handleFilterChange(setFilterEstado as (v: string) => void)}
                        className="border rounded-lg px-3 py-2.5 bg-white text-sm text-gray-700 outline-none cursor-pointer appearance-none pr-8"
                    >
                        <option value="">Todos los estados</option>
                        {(Object.entries(ESTADOS) as [EstadoCaso, string][]).map(([val, lbl]) => (
                            <option key={val} value={val}>{lbl}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={filterPrioridad}
                        onChange={handleFilterChange(setFilterPrioridad as (v: string) => void)}
                        className="border rounded-lg px-3 py-2.5 bg-white text-sm text-gray-700 outline-none cursor-pointer appearance-none pr-8"
                    >
                        <option value="">Todas las prioridades</option>
                        {(Object.entries(PRIORIDADES) as [NivelPrioridad, string][]).map(([val, lbl]) => (
                            <option key={val} value={val}>{lbl}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={filterTipologia}
                        onChange={handleFilterChange(setFilterTipologia as (v: string) => void)}
                        className="border rounded-lg px-3 py-2.5 bg-white text-sm text-gray-700 outline-none cursor-pointer appearance-none pr-8"
                    >
                        <option value="">Todas las tipologías</option>
                        {(Object.entries(TIPOLOGIAS) as [TipologiaFraude, string][]).map(([val, lbl]) => (
                            <option key={val} value={val}>{lbl}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={filterEntidad}
                        onChange={handleFilterChange(setFilterEntidad as (v: string) => void)}
                        className="border rounded-lg px-3 py-2.5 bg-white text-sm text-gray-700 outline-none cursor-pointer appearance-none pr-8"
                    >
                        <option value="">Todas las entidades</option>
                        {(Object.entries(ENTIDADES) as [EntidadCompetente, string][]).map(([val, lbl]) => (
                            <option key={val} value={val}>{lbl}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                </div>

                <div className="flex-1" />

                <button
                    onClick={fetchCases}
                    className="px-3 py-2.5 rounded-lg border text-sm text-gray-600 hover:bg-gray-50 transition flex items-center gap-1.5"
                >
                    <Search size={14} /> Buscar
                </button>

                <button
                    onClick={onCreate}
                    className="bg-red-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2 text-sm"
                >
                    <Plus size={16} /> Nuevo caso
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                    <p className="text-gray-500">Cargando casos...</p>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="bg-white rounded-2xl border p-8 text-center mb-6">
                    <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold mb-2">{error}</p>
                    <button onClick={fetchCases} className="text-red-500 text-sm font-medium hover:underline">
                        Reintentar
                    </button>
                </div>
            )}

            {/* Tabla */}
            {!loading && !error && cases.length > 0 && (
                <>
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-4 py-3 font-semibold text-gray-600">Radicado</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">Tipología</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-center">Prioridad</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-center">Estado</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">Entidad</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">Creado</th>
                                        <th className="px-4 py-3 font-semibold text-gray-600 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cases.map((c) => (
                                        <tr
                                            key={c.radicado}
                                            className="border-b last:border-b-0 hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => onViewDetail(c.radicado)}
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-gray-700">
                                                    {c.radicado.length > 12
                                                        ? `${c.radicado.slice(0, 8)}…${c.radicado.slice(-4)}`
                                                        : c.radicado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {TIPOLOGIAS[c.tipologiaFraude]}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <PriorityBadge level={c.nivelPrioridad} />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StateBadge state={c.estado} />
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {ENTIDADES[c.entidadCompetente]}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {new Date(c.creadoEn).toLocaleDateString("es-CO")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onViewDetail(c.radicado)
                                                        }}
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
                                                        title="Ver detalle"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginacion */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Mostrando página <strong>{page + 1}</strong> de <strong>{totalPages}</strong>{" "}
                            ({totalElements} casos)
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="p-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Sin resultados */}
            {!loading && !error && cases.length === 0 && (
                <div className="bg-white rounded-2xl border p-8 text-center">
                    <ShieldAlert size={40} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">No se encontraron casos de fraude.</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Ajuste los filtros o cree un nuevo caso para comenzar.
                    </p>
                </div>
            )}
        </>
    )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGINA PRINCIPAL — ORQUESTADOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type View = "list" | "create" | "detail"

export default function GestionCasosFraude() {
    // Vista actual
    const [view, setView] = useState<View>("list")
    const [derivedFrom, setDerivedFrom] = useState<string | null>(null)

    // Session
    const [actorId, setActorId] = useState(() => localStorage.getItem("fraudActorId") ?? "")
    const [actorRol, setActorRol] = useState<ActorRol | "">(() => {
        const stored = localStorage.getItem("fraudActorRol") ?? ""
        return (Object.keys(ROLES).includes(stored) ? stored : "") as ActorRol | ""
    })

    // Detail data
    const [detailCaso, setDetailCaso] = useState<CasoFraude | null>(null)
    const [auditEntries, setAuditEntries] = useState<AuditoriaEntry[]>([])
    const [loadingDetail, setLoadingDetail] = useState(false)

    // Action states
    const [saving, setSaving] = useState(false)
    const [transitioning, setTransitioning] = useState(false)
    const [refreshingAudit, setRefreshingAudit] = useState(false)

    // Toast
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null)

    // Persistir sesion
    useEffect(() => {
        localStorage.setItem("fraudActorId", actorId)
    }, [actorId])
    useEffect(() => {
        localStorage.setItem("fraudActorRol", actorRol)
    }, [actorRol])

    // -- Cargar detalle --
    const loadDetail = useCallback(async (radicado: string) => {
        setLoadingDetail(true)
        try {
            const caso = await getCaso(radicado)
            setDetailCaso(caso)
            setAuditEntries(caso.auditoria ?? [])
            setView("detail")
        } catch (err) {
            const apiErr = err as FraudApiError
            setToast({ message: apiErr.message, type: "error" })
        } finally {
            setLoadingDetail(false)
        }
    }, [])

    // -- Crear caso --
    const handleCreateCaso = async (payload: CrearCasoPayload) => {
        setSaving(true)
        try {
            const result = await createCaso(payload)
            if (result.wasExisting) {
                setToast({ message: "Caso ya existente — se vinculó el radicado", type: "info" })
            } else {
                setToast({ message: "Caso creado exitosamente", type: "success" })
            }
            setDerivedFrom(null)
            // Ir al detalle del caso creado/encontrado
            await loadDetail(result.caso.radicado)
        } catch (err) {
            const apiErr = err as FraudApiError
            setToast({ message: apiErr.message, type: "error" })
        } finally {
            setSaving(false)
        }
    }

    // -- Transicionar estado --
    const handleTransition = async (nuevoEstado: EstadoCaso, motivo: string) => {
        if (!detailCaso) return
        setTransitioning(true)
        try {
            const updated = await transicionarEstado(detailCaso.radicado, { nuevoEstado, motivo })
            setDetailCaso(updated)
            setAuditEntries(updated.auditoria ?? auditEntries)
            setToast({ message: `Estado actualizado a "${ESTADOS[nuevoEstado]}"`, type: "success" })
        } catch (err) {
            const apiErr = err as FraudApiError
            if (apiErr.isCasoCerrado) {
                // Ofrecer crear derivado
                setToast({
                    message: "El caso está cerrado de forma irreversible. Puede crear un caso derivado.",
                    type: "warning",
                })
                // Recargar para confirmar estado
                await loadDetail(detailCaso.radicado)
            } else {
                setToast({ message: apiErr.message, type: "error" })
            }
        } finally {
            setTransitioning(false)
        }
    }

    // -- Refrescar auditoria aislada --
    const handleRefreshAudit = async () => {
        if (!detailCaso) return
        setRefreshingAudit(true)
        try {
            const entries = await getAuditoria(detailCaso.radicado)
            setAuditEntries(entries)
        } catch (err) {
            const apiErr = err as FraudApiError
            setToast({ message: apiErr.message, type: "error" })
        } finally {
            setRefreshingAudit(false)
        }
    }

    // -- Crear caso derivado --
    const handleCreateDerived = (radicado: string) => {
        setDerivedFrom(radicado)
        setView("create")
    }

    // -- Navegacion --
    const goToList = () => {
        setView("list")
        setDetailCaso(null)
        setAuditEntries([])
    }
    const goToCreate = () => {
        setDerivedFrom(null)
        setView("create")
    }
    const goToDetail = (radicado: string) => {
        loadDetail(radicado)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f7]">
            <NavBar />

            <main className="flex-1 px-6 py-10">
                <div className="max-w-6xl mx-auto">
                    {/* Titulo */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Gestión de Casos de Fraude</h2>
                        <p className="text-gray-600">
                            Módulo SR-M6 — Registro, seguimiento y cierre de casos de fraude electoral.
                        </p>
                    </div>

                    {/* Panel de sesion simulada */}
                    <SessionPanel
                        actorId={actorId}
                        actorRol={actorRol}
                        onChangeActorId={setActorId}
                        onChangeActorRol={setActorRol}
                    />

                    {/* Loading detalle */}
                    {loadingDetail && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
                            <p className="text-gray-500">Cargando detalle del caso...</p>
                        </div>
                    )}

                    {/* Vista: Listado */}
                    {view === "list" && !loadingDetail && (
                        <CaseList onViewDetail={goToDetail} onCreate={goToCreate} />
                    )}

                    {/* Vista: Crear */}
                    {view === "create" && !loadingDetail && (
                        <CreateCaseForm
                            initialCasoPrecedente={derivedFrom}
                            onSave={handleCreateCaso}
                            onCancel={goToList}
                            saving={saving}
                        />
                    )}

                    {/* Vista: Detalle */}
                    {view === "detail" && detailCaso && !loadingDetail && (
                        <CaseDetail
                            caso={detailCaso}
                            onBack={goToList}
                            onTransition={handleTransition}
                            onRefreshAudit={handleRefreshAudit}
                            onCreateDerived={handleCreateDerived}
                            transitioning={transitioning}
                            refreshingAudit={refreshingAudit}
                            auditEntries={auditEntries}
                        />
                    )}
                </div>
            </main>

            <Footer />

            {/* Toast global */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}
