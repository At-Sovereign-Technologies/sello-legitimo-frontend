export interface TransparencyRecord {
  eventType: string
  description: string
  timestamp: string
  riskScore?: number | null
  algorithmVersion?: string | null
}

export interface TransparencyResponse {
  electionId: number
  records: TransparencyRecord[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
}

export type TransparencySeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export interface TransparencyAuditEvent {
  timestamp: string
  eventType: string
  description: string
  riskScore?: number | null
  algorithmVersion?: string | null
  originComponent?: string
  details?: Record<string, unknown>
}

export interface TransparencyAuditEventFilters {
  electionId: number
  page?: number
  size?: number
  eventType?: string
  severity?: TransparencySeverity
}