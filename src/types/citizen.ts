export interface CitizenLookupRequest {
  cedula: string
}

export interface VotingStation {
  id: string
  name: string
  address: string
  city: string
  department: string
}

export interface ParticipationStatus {
  cedula: string
  hasVoted: boolean
  votedAt?: string
  stationName?: string
}
