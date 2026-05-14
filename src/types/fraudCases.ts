// Tipos del modulo de gestion de casos de fraude electoral (SR-M6)

// -- Enums del catalogo --

export type TipologiaFraude =
    | "SUPLANTACION"
    | "DOBLE_VOTO"
    | "ALTERACION_ACTA"
    | "COMPRA_VOTO"
    | "OTRO"

export type NivelPrioridad = "BAJO" | "MEDIO" | "ALTO" | "CRITICO"

export type EntidadCompetente = "RNEC" | "CNE" | "MESA_JUSTICIA" | "FISCALIA"

export type EstadoCaso =
    | "DETECTADO"
    | "EN_EVALUACION"
    | "EN_INVESTIGACION"
    | "ESCALADO"
    | "CONFIRMADO"
    | "DESCARTADO"
    | "CERRADO"

export type ActorRol =
    | "ADMIN_RNEC"
    | "DELEGADO_CNE"
    | "DELEGADO_MESA_JUSTICIA"
    | "DELEGADO_FISCALIA"

// -- Entidad principal: Caso de fraude --

export interface CasoFraude {
    radicado: string
    alertasOrigen: string[]
    tipologiaFraude: TipologiaFraude
    nivelPrioridad: NivelPrioridad
    estado: EstadoCaso
    responsableInstitucional: string
    entidadCompetente: EntidadCompetente
    casoPrecedente: string | null
    creadoEn: string
    actualizadoEn: string
    auditoria?: AuditoriaEntry[]
}

// -- Entrada de auditoria --

export interface AuditoriaEntry {
    id: string
    accion: string
    actor: string
    rol: string
    timestamp: string
    metadatos: string // JSON serializado — usar JSON.parse()
}

// -- Respuesta paginada (Spring Page) --

export interface PaginatedResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
    numberOfElements: number
    empty: boolean
}

// -- Payload para crear caso --

export interface CrearCasoPayload {
    alertasOrigen: string[]
    tipologiaFraude: TipologiaFraude
    nivelPrioridad: NivelPrioridad
    responsableInstitucional: string
    entidadCompetente: EntidadCompetente
    casoPrecedente: string | null
}

// -- Payload para transicionar estado --

export interface TransicionEstadoPayload {
    nuevoEstado: EstadoCaso
    motivo: string
}

// -- Esquema de error uniforme de la API --

export interface ApiErrorResponse {
    error: string
    mensaje: string
    radicado?: string
    timestamp: string
}
