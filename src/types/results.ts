export interface CandidateResult {
  name: string
  votes: number
}

export interface ElectionResults {
  electionId: number
  totalVotes: number
  candidates: CandidateResult[]
}

export interface HistoryEntry {
  electionId: number
  electionName: string
  electionType: string
  date: string
  totalVotes: number
  winner: string
  winnerPct: number
}

export interface HistoryResponse {
  totalElections: number
  totalVotesCast: number
  elections: HistoryEntry[]
}

// /results/comparison
export interface CandidateTimeline {
  name: string
  votes: number[]
  percentages: number[]
}

export interface ComparisonResponse {
  electionNames: string[]
  candidates: CandidateTimeline[]
}

// /results/trends
export interface CandidateTrend {
  name: string
  percentages: number[]
  trend: "RISING" | "FALLING" | "STABLE"
}

export interface TrendsResponse {
  labels: string[]
  totalVotesPerElection: number[]
  participationTrend: "RISING" | "FALLING" | "STABLE"
  candidateTrends: CandidateTrend[]
}