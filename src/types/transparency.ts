export interface TransparencyRecord {
  eventType: string
  description: string
  timestamp: string
}

export interface TransparencyResponse {
  electionId: number
  records: TransparencyRecord[]
}

export type TransparencySeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export interface TransparencyAuditEvent {
  timestamp: string
  originComponent: string
  eventType: string
  severity: TransparencySeverity
  details: Record<string, unknown>
  riskScore?: number
  algorithmVersion?: string
}

export interface TransparencyAuditEventFilters {
  eventType?: string
  severity?: TransparencySeverity
}