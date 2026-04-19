import apiClient from "./apiClient"
import type { TransparencyResponse } from "../types/transparency"

export const getTransparency = async (
  electionId: number
): Promise<TransparencyResponse> => {
  const response = await apiClient.get<TransparencyResponse>(
    "/api/v1/transparency",
    {
      params: { electionId },
    }
  )

  return response.data
}