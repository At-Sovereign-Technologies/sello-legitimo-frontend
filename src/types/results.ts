export interface CandidateResult {
    candidateId: string
    name: string
    party: string
    votes: number
    percentage: number
}

export interface ElectionResults {
    electionId: string
    title: string
    totalVotes: number
    blankVotes: number
    results: CandidateResult[]
    lastUpdated: string
}
