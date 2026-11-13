export interface Developer {
  id: string
  name: string
  email: string
  /** Especialidad (Frontend, Backend, QA…) */
  specialty: string
}

/** Sistema (app web) con los desarrolladores que lo atienden. */
export interface SystemAssignment {
  id: string
  name: string
  domain: string
  developers: Developer[]
}

export type AssignmentFilter = 'all' | 'unassigned' | 'assigned'

export interface AssignmentsSummary {
  systems: number
  covered: number
  unassigned: number
  developers: number
}
