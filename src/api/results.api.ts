import apiClient from "./apiClient"
import type {
  ElectionResults,
  HistoryResponse,
  ComparisonResponse,
  TrendsResponse,
} from "../types/results"

export const getElectionResults = async (
  electionId: number
): Promise<ElectionResults> => {
  const response = await apiClient.get<ElectionResults>(`/api/v1/results`, {
    params: { electionId },
  })
  return response.data
}

export const getResultsHistory = async (params?: {
  type?: string
  candidate?: string
}): Promise<HistoryResponse> => {
  const response = await apiClient.get<HistoryResponse>(
    `/api/v1/results/history`,
    { params }
  )
  return response.data
}

export const getResultsComparison = async (
  electionIds: number[]
): Promise<ComparisonResponse> => {
  const response = await apiClient.get<ComparisonResponse>(
    `/api/v1/results/comparison`,
    { params: { electionIds: electionIds.join(",") } }
  )
  return response.data
}


export const getResultsTrends = async (
  electionIds?: number[]
): Promise<TrendsResponse> => {
  const response = await apiClient.get<TrendsResponse>(
    `/api/v1/results/trends`,
    { params: electionIds?.length ? { electionIds: electionIds.join(",") } : {} }
  )
  return response.data
}