export interface Acta {
    id: string
    stationId: string
    stationName: string
    totalVotes: number
    digitalSignature: string
    createdAt: string
    verified: boolean
}

export interface AuditEntry {
    id: string
    action: string
    actor: string
    timestamp: string
    details: string
}
