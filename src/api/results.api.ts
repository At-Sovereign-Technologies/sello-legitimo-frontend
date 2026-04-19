import apiClient from "./apiClient"
import type { ElectionResults } from "../types/results"

export const getElectionResults = async (
  electionId: number
): Promise<ElectionResults> => {
  const response = await apiClient.get<ElectionResults>(
    `/api/v1/results`,
    {
      params: { electionId },
    }
  )

  return response.data
}