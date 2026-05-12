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
  // Use POST since backend expects ingestion via POST on this path.
  // Send filters in the request body and preserve query params for compatibility.
  const response = await apiClient.post<TransparencyAuditEvent[]>(
    "/api/v1/transparency/events",
    { ...(filters ?? {}) },
    {
      params: {
        eventType: filters?.eventType,
        severity: filters?.severity,
      },
    }
  )

  return response.data
}