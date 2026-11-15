export type TicketSeverity = 'P1' | 'P2' | 'P3' | 'P4'

/** Flujo: open (sin dueño) -> in_review (un desarrollador la tomó) -> resolved (cerrada). `in_progress` y `closed` son valores heredados. */
export type TicketStatus = 'open' | 'in_progress' | 'in_review' | 'resolved' | 'closed'

/** Reduce los estados heredados a los tres vigentes. */
export function normalizeStatus(status: TicketStatus): 'open' | 'in_review' | 'resolved' {
  if (status === 'in_progress' || status === 'in_review') return 'in_review'
  if (status === 'closed' || status === 'resolved') return 'resolved'
  return 'open'
}

/** Tipo de problema que elige el propio usuario al reportar (lenguaje no técnico). */
export type IssueType = 'blocks_flow' | 'not_working' | 'wrong_info' | 'slow' | 'visual' | 'other'

export interface TicketAssignee {
  id: string
  name: string
  email: string
  role?: string
}

/** Quien resolvió el reporte; se conserva aunque ya no esté en la plataforma. */
export interface TicketResolver extends TicketAssignee {
  /** true si la persona fue eliminada de la plataforma */
  removed: boolean
}

/** Usuario del sistema que envió el reporte. */
export interface TicketReporter {
  id: string
  name: string
  email: string
}

/**
 * Reporte enviado por un usuario desde un sistema.
 * - El usuario aporta: descripción, tipo de problema y (opcional) una captura.
 * - El backend completa: fecha, usuario, sistema, navegador, IP y severidad.
 */
export interface Ticket {
  id: string
  /** Texto libre escrito por el usuario */
  description: string
  /** Clasificación elegida por el usuario */
  issueType: IssueType
  /** P1–P4 asignada por el backend; null mientras no se ha clasificado */
  severity: TicketSeverity | null
  status: TicketStatus
  /** Sistema donde se generó el reporte */
  system: string
  reporter: TicketReporter
  /** Captura de pantalla adjunta (opcional) */
  screenshotUrl?: string
  browser: string
  ipAddress: string
  createdAt: string
  assignee?: TicketAssignee
  /** Quien lo resolvió (null mientras siga activo) */
  resolvedBy?: TicketResolver | null
  /** Minutos que quedan para atenderla a tiempo (0 = plazo vencido); null si aún no tiene prioridad o ya se resolvió */
  slaMinutesRemaining: number | null
}

export type SeverityFilter = TicketSeverity | 'all'

/** Parámetros que se envían al backend para listar reportes. */
export interface TicketsQuery {
  page: number
  pageSize: number
  search: string
  severity: SeverityFilter
  status: TicketStatus | 'all'
  system: string | 'all'
  issueType: IssueType | 'all'
}

export interface PaginationMeta {
  page: number
  pageSize: number
  /** Total de reportes que cumplen los filtros (no solo los de la página) */
  total: number
  totalPages: number
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}

/** Totales globales para las tarjetas y el selector de sistemas. */
export interface TicketsSummary {
  total: number
  criticalP1: number
  /** Activas de prioridad baja (P4); incluye los reportes de tipo "Otro" */
  lowPriority: number
  inProgress: number
  resolved: number
  systems: string[]
}
