import apiClient from "./apiClient"
import type { Election } from "../types/elections"

export const getActiveElections = async (): Promise<Election[]> => {
    const response = await apiClient.get<Election[]>("/api/elections")
    return response.data
}

export const getElectionById = async (id: string): Promise<Election> => {
    const response = await apiClient.get<Election>(`/api/elections/${id}`)
    return response.data
}
