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
  filters: TransparencyAuditEventFilters
): Promise<TransparencyAuditEvent[]> => {
  const response = await apiClient.get<TransparencyResponse>(
    "/api/v1/transparency",
    {
      params: {
        electionId: filters.electionId,
        page: filters.page ?? 0,
        size: filters.size ?? 50,
      },
    }
  )

  const records = response.data.records ?? []

  if (filters.eventType) {
    return records.filter((record) => record.eventType === filters.eventType)
  }

  return records
}