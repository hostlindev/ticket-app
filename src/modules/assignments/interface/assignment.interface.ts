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
  /** Descripción breve del sistema (opcional). */
  description?: string
  /** Lead (coordinador) del proyecto. */
  lead?: Developer | null
  leadId?: string | null
  developers: Developer[]
}

/** Datos necesarios para registrar un sistema nuevo. */
export interface NewSystemInput {
  name: string
  domain: string
  description?: string
  /** Id del lead del proyecto (usuario de `GET /developers`). */
  leadId: string
}

export type AssignmentFilter = 'all' | 'unassigned' | 'assigned'

export interface AssignmentsSummary {
  systems: number
  covered: number
  unassigned: number
  developers: number
}
