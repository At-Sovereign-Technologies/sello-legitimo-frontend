// Servicio API del motor antifraude -- ConfiguracionEleccion (puerto 8081)
// Inyecta X-User-Id y X-User-Role en cada llamada desde localStorage.

import apiClient from "./apiClient"
import type {
    FraudRule,
    FraudRuleCreatePayload,
    FraudRulePatchPayload,
    RejectPayload,
    EvaluateRequest,
    EvaluateResponse,
} from "../types/fraudEngine"

const BASE = "/api/v1/fraud-engine"

// Genera los headers de identidad requeridos por el backend
function authHeaders(): Record<string, string> {
    const role = localStorage.getItem("mockRole") ?? ""
    const userIdMap: Record<string, string> = {
        ADMIN_RNEC: "admin.rnec.01",
        DELEGADO_CNE: "delegado.cne.01",
        ADMINISTRADOR: "admin.rnec.01",
        SUPERADMIN: "admin.rnec.01",
        AUDITOR: "auditor.01",
        OPERADOR: "operador.01",
        REGISTRADOR: "registrador.01",
        MAGISTRADO: "magistrado.01",
    }
    return {
        "X-User-Id": userIdMap[role] ?? role.toLowerCase(),
        "X-User-Role": role,
    }
}

// Traduce codigos de error HTTP a mensajes legibles en espanol
function handleApiError(err: unknown): never {
    // Connection/network errors (no response from server)
    if (typeof err === "object" && err !== null) {
        const axiosErr = err as { response?: { status: number; data?: { message?: string } }; request?: unknown; message?: string };
        if (!axiosErr.response) {
            if (axiosErr.request || axiosErr.message?.includes("Network") || axiosErr.message?.includes("fetch")) {
                throw new Error("El servicio no está disponible en este momento. Intente de nuevo más tarde.");
            }
            throw new Error("Error de conexión al servidor.");
        }
        switch (axiosErr.response.status) {
            case 400:
                throw new Error(axiosErr.response.data?.message ?? "Datos de entrada invalidos. Revise los campos del formulario.");
            case 403:
                throw new Error("No tiene permisos para realizar esta accion con su rol actual.");
            case 404:
                throw new Error("El recurso solicitado no fue encontrado en el servidor.");
            case 409:
                throw new Error(axiosErr.response.data?.message ?? "Operacion invalida para el estado actual del recurso.");
            default:
                throw new Error(axiosErr.response.data?.message ?? "El servicio no está disponible en este momento. Intente de nuevo más tarde.");
        }
    }
    throw err;
}

// 1. Listar todas las reglas
export const getRules = async (): Promise<FraudRule[]> => {
    try {
        const response = await apiClient.get<FraudRule[]>(`${BASE}/rules`, {
            headers: authHeaders(),
        })
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}

// 2. Obtener detalle de una regla
export const getRuleById = async (id: number): Promise<FraudRule> => {
    try {
        const response = await apiClient.get<FraudRule>(`${BASE}/rules/${id}`, {
            headers: authHeaders(),
        })
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}

// 3. Crear una regla (ADMIN_RNEC)
export const createRule = async (payload: FraudRuleCreatePayload): Promise<FraudRule> => {
    try {
        const response = await apiClient.post<FraudRule>(`${BASE}/rules`, payload, {
            headers: authHeaders(),
        })
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}

// 4. Editar una regla (ADMIN_RNEC) -- devuelve la regla a PENDING
export const patchRule = async (id: number, payload: FraudRulePatchPayload): Promise<FraudRule> => {
    try {
        const response = await apiClient.patch<FraudRule>(`${BASE}/rules/${id}`, payload, {
            headers: authHeaders(),
        })
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}

// 5. Aprobar una regla (DELEGADO_CNE)
export const approveRule = async (id: number): Promise<FraudRule> => {
    try {
        const response = await apiClient.post<FraudRule>(`${BASE}/rules/${id}/approve`, {}, {
            headers: authHeaders(),
        })
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}

// 6. Rechazar una regla (DELEGADO_CNE)
export const rejectRule = async (id: number, payload: RejectPayload): Promise<FraudRule> => {
    try {
        const response = await apiClient.post<FraudRule>(`${BASE}/rules/${id}/reject`, payload, {
            headers: authHeaders(),
        })
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}

// 7. Desactivar/eliminar una regla (DELEGADO_CNE) -- soft delete
export const deleteRule = async (id: number): Promise<FraudRule> => {
    try {
        const response = await apiClient.delete<FraudRule>(`${BASE}/rules/${id}`, {
            headers: authHeaders(),
        })
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}

// 8. Evaluar eventos contra el motor antifraude
export const evaluateEvents = async (payload: EvaluateRequest): Promise<EvaluateResponse> => {
    try {
        const response = await apiClient.post<EvaluateResponse>(`${BASE}/evaluate`, payload, {
            headers: authHeaders(),
        })
        return response.data
    } catch (err) {
        handleApiError(err)
    }
}
