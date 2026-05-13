import apiClient from "./apiClient"
import type {
  TransparencyAuditEvent,
  TransparencyAuditEventFilters,
  TransparencyResponse,
} from "../types/transparency"

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

export const fetchRealTimeAuditEvents = async (
  filters?: TransparencyAuditEventFilters
): Promise<TransparencyAuditEvent[]> => {
  const response = await apiClient.get<TransparencyAuditEvent[]>(
    "/api/v1/transparency",
    {
      params: {
        eventType: filters?.eventType,
        severity: filters?.severity,
      },
    }
  )

  return response.data
}