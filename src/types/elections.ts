export interface Election {
    id: string
    title: string
    description: string
    type: string
    startDate: string
    endDate: string
    status: "active" | "upcoming" | "completed"
    totalRegisteredVoters?: number
}
