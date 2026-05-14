// Servicio API del modulo de casos de fraude electoral (SR-M6, puerto 8084)
// Headers: X-Actor-Id y X-Actor-Rol inyectados desde localStorage.

import apiClient from "./apiClient"
import type {
    CasoFraude,
    CrearCasoPayload,
    TransicionEstadoPayload,
    PaginatedResponse,
    AuditoriaEntry,
    ApiErrorResponse,
    EstadoCaso,
    NivelPrioridad,
    TipologiaFraude,
    EntidadCompetente,
} from "../types/fraudCases"

const BASE = "/api/v1/fraude/casos"

// -- Headers de identidad del actor en sesion simulada --

export function fraudAuthHeaders(): Record<string, string> {
    const actorId = localStorage.getItem("fraudActorId") ?? ""
    const actorRol = localStorage.getItem("fraudActorRol") ?? ""
    return {
        "X-Actor-Id": actorId,
        "X-Actor-Rol": actorRol,
    }
}

// -- Mapeo de codigos de error a mensajes UX --

const ERROR_MESSAGES: Record<string, string> = {
    TRANSICION_INVALIDA: "Esta acción no es posible desde el estado actual",
    VALIDACION_FALLIDA: "", // Se mostrara el campo "mensaje" directamente
    ACCESO_DENEGADO: "No tienes permiso para esta operación",
    RECURSO_NO_ENCONTRADO: "Caso no encontrado",
    CASO_CERRADO: "El caso está cerrado de forma irreversible",
    ERROR_INTERNO: "Ocurrió un error interno en el servidor. Intenta de nuevo.",
}

export interface FraudApiError {
    status: number
    errorCode: string
    message: string
    radicado?: string
    isCasoCerrado: boolean
}

function handleApiError(err: unknown): never {
    if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response: { status: number; data?: ApiErrorResponse } }).response
        const data = response.data
        const errorCode = data?.error ?? "ERROR_INTERNO"
        const mappedMessage = ERROR_MESSAGES[errorCode]
        const message =
            errorCode === "VALIDACION_FALLIDA"
                ? data?.mensaje ?? "Datos de entrada inválidos"
                : mappedMessage || data?.mensaje || "Ocurrió un error inesperado"

        console.error("[FraudCases API]", { status: response.status, errorCode, data })

        const apiError: FraudApiError = {
            status: response.status,
            errorCode,
            message,
            radicado: data?.radicado,
            isCasoCerrado: errorCode === "CASO_CERRADO" || response.status === 409,
        }
        throw apiError
    }
    console.error("[FraudCases API] Unknown error:", err)
    throw {
        status: 0,
        errorCode: "UNKNOWN",
        message: "Error de conexión con el servidor",
        isCasoCerrado: false,
    } as FraudApiError
}

// -- 1. Crear caso --

export const createCaso = async (
    payload: CrearCasoPayload
): Promise<{ caso: CasoFraude; wasExisting: boolean }> => {
    try {
        const response = await apiClient.post<CasoFraude>(BASE, payload, {
            headers: fraudAuthHeaders(),
        })
        return {
            caso: response.data,
            wasExisting: response.status === 200,
        }
    } catch (err) {
        handleApiError(err)
    }
}

// -- 2. Transicionar estado --

export const transicionarEstado = async (
    radicado: string,
    payload: TransicionEstadoPayload
): Promise<CasoFraude> => {
    try {
        const response = await apiClient.patch<CasoFraude>(
            `${BASE}/${radicado}/estado`,
            payload,
            { headers: fraudAuthHeaders() }
        )
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}

// -- 3. Detalle del caso (incluye auditoria embebida) --

export const getCaso = async (radicado: string): Promise<CasoFraude> => {
    try {
        const response = await apiClient.get<CasoFraude>(`${BASE}/${radicado}`, {
            headers: fraudAuthHeaders(),
        })
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}

// -- 4. Listado paginado con filtros --

export interface ListCasosFilters {
    estado?: EstadoCaso | ""
    nivelPrioridad?: NivelPrioridad | ""
    tipologiaFraude?: TipologiaFraude | ""
    entidadCompetente?: EntidadCompetente | ""
    responsableInstitucional?: string
    page?: number
    size?: number
}

export const listCasos = async (
    filters: ListCasosFilters = {}
): Promise<PaginatedResponse<CasoFraude>> => {
    try {
        // Construir query params, omitiendo los vacios
        const params: Record<string, string | number> = {}
        if (filters.estado) params.estado = filters.estado
        if (filters.nivelPrioridad) params.nivelPrioridad = filters.nivelPrioridad
        if (filters.tipologiaFraude) params.tipologiaFraude = filters.tipologiaFraude
        if (filters.entidadCompetente) params.entidadCompetente = filters.entidadCompetente
        if (filters.responsableInstitucional) params.responsableInstitucional = filters.responsableInstitucional
        params.page = filters.page ?? 0
        params.size = filters.size ?? 20

        const response = await apiClient.get<PaginatedResponse<CasoFraude>>(BASE, {
            params,
            headers: fraudAuthHeaders(),
        })
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}

// -- 5. Historial de auditoria aislado --

export const getAuditoria = async (radicado: string): Promise<AuditoriaEntry[]> => {
    try {
        const response = await apiClient.get<AuditoriaEntry[]>(
            `${BASE}/${radicado}/auditoria`,
            { headers: fraudAuthHeaders() }
        )
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}
