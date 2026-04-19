export interface Election {
  id: number
  name: string
  status: "ACTIVE" | "UPCOMING" | "COMPLETED"
}