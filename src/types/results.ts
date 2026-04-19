export interface CandidateResult {
  name: string
  votes: number
}

export interface ElectionResults {
  electionId: number
  totalVotes: number
  candidates: CandidateResult[]
}