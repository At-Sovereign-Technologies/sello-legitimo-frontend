import apiClient from "./apiClient"
import type { ElectionResults } from "../types/results"

export const getElectionResults = async (
    electionId?: string
): Promise<ElectionResults> => {
    const url = electionId
        ? `/api/results/${electionId}`
        : "/api/results"
    const response = await apiClient.get<ElectionResults>(url)
    return response.data
}
