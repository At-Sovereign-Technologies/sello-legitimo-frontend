import apiClient from "./apiClient"
import type { Acta, AuditEntry } from "../types/transparency"

export const getActas = async (): Promise<Acta[]> => {
    const response = await apiClient.get<Acta[]>("/api/v1/transparency/election/${id}")
    return response.data
}

export const getAuditTrail = async (): Promise<AuditEntry[]> => {
    const response = await apiClient.get<AuditEntry[]>(
        "/api/v1/transparency/audit"
    )
    return response.data
}
