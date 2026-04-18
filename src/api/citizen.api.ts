import apiClient from "./apiClient"
import type { VotingStation, ParticipationStatus } from "../types/citizen"

export const lookupStation = async (cedula: string): Promise<VotingStation> => {
    const response = await apiClient.get<VotingStation>("/api/citizen/station", {
        params: { cedula },
    })
    return response.data
}

export const getParticipationStatus = async (
    cedula: string
): Promise<ParticipationStatus> => {
    const response = await apiClient.get<ParticipationStatus>(
        "/api/citizen/participation",
        { params: { cedula } }
    )
    return response.data
}
