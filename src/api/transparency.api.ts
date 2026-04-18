import apiClient from "./apiClient"
import type { Acta, AuditEntry } from "../types/transparency"

export const getActas = async (): Promise<Acta[]> => {
    const response = await apiClient.get<Acta[]>("/api/transparency/actas")
    return response.data
}

export const getAuditTrail = async (): Promise<AuditEntry[]> => {
    const response = await apiClient.get<AuditEntry[]>(
        "/api/transparency/audit"
    )
    return response.data
}
