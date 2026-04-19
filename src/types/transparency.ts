export interface TransparencyRecord {
  eventType: string
  description: string
  timestamp: string
}

export interface TransparencyResponse {
  electionId: number
  records: TransparencyRecord[]
}