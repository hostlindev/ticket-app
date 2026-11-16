export type AppHealth = 'operational' | 'degraded' | 'alert'

export type Severity = 'P1' | 'P2' | 'P3' | 'P4'

export type IncidentStatus = 'open' | 'in_progress' | 'in_review' | 'resolved'

export type SeverityCounts = Record<Severity, number>

export type StatusCounts = Record<IncidentStatus, number>

/**
 * Aplicación web monitoreada tal como la entrega el backend (mock hoy).
 * Todo lo demás del dashboard (totales, porcentajes, gráficas) se deriva de
 * esta lista, así que agregar/quitar apps no requiere tocar la UI.
 */
export interface DashboardApp {
  id: string
  name: string
  domain: string
  lead: string
  health: AppHealth
  uptime: string
  /** Incidencias ACTIVAS por severidad */
  severity: SeverityCounts
  /** Incidencias por estado (la suma de los estados activos == suma de severity) */
  statuses: StatusCounts
  /** Incidencias creadas por día, de más antiguo a más reciente (últimos 7 días) */
  created: number[]
  /** Incidencias resueltas por día, mismo orden que `created` */
  resolved: number[]
}

export interface UserIncident {
  id: string
  title: string
  systemName: string
  systemCode: string
  severity: Severity
  status: IncidentStatus
  slaTime: string
  slaStatus: 'normal' | 'warning' | 'critical'
  createdAt: string
  /** true si la incidencia está asignada a la persona en sesión */
  assignedToMe?: boolean
}

/** Respuesta completa del endpoint (mock) del dashboard */
export interface DashboardSnapshot {
  apps: DashboardApp[]
  userIncidents: UserIncident[]
  /** Horas promedio de resolución */
  mttrHours: number
  /** Porcentaje 0-100 de incidencias atendidas dentro del plazo */
  slaCompliance: number
  resolvedSprint: number
}

/* ---------- Modelos derivados (los calcula el store) ---------- */

export interface DashboardAppStats extends DashboardApp {
  active: number
  total: number
  assigned: boolean
}

export interface DashboardTotals {
  apps: number
  active: number
  resolved: number
  total: number
  bySeverity: SeverityCounts
  byStatus: StatusCounts
  /** % de incidencias activas que son P1 */
  criticalShare: number
}

export interface PriorityStat {
  severity: Severity
  count: number
  percentage: number
}

export interface StatusStat {
  status: IncidentStatus
  count: number
  percentage: number
}

export interface TrendPoint {
  label: string
  /** Ej. "15 nov" */
  dayMonth: string
  year: string
  /** Ej. "domingo, 15 de noviembre de 2026" */
  fullDate: string
  created: number
  resolved: number
}

export interface PieSlice {
  id: string
  name: string
  domain: string
  count: number
  percentage: number
  color: string
  borderColor: string
  pathData: string
  assigned: boolean
  health: AppHealth
  lead: string
  severity: SeverityCounts
}

export interface UserDashboardMetrics {
  assignedSystemsCount: number
  assignedSystems: string[]
  assignedIncidentsCount: number
  assignedCriticalCount: number
  mttrHours: string
  slaCompliance: string
}
