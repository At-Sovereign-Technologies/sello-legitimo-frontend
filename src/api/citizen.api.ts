import apiClient from "./apiClient"
import type { CitizenResponse } from "../types/citizen"

export const getCitizen = async (
  document: string
): Promise<CitizenResponse> => {
  const response = await apiClient.get("/api/v1/citizen/polling-station", {
    params: { document },
  })

  return response.data
}