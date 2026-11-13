import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@modules/auth/store/auth.store'
import type {
  DashboardApp,
  DashboardAppStats,
  DashboardTotals,
  IncidentStatus,
  PieSlice,
  PriorityStat,
  Severity,
  SeverityCounts,
  StatusCounts,
  StatusStat,
  TrendPoint,
  UserDashboardMetrics,
  UserIncident,
} from '../interface/dashboard.interface'
import { SEVERITIES, STATUSES, colorForIndex } from '../config/dashboard.config'
import { fetchDashboardSnapshot } from '../services/dashboard.service'

const ACTIVE_STATUSES: IncidentStatus[] = ['open', 'in_progress', 'in_review']

const PIE_CENTER = 120
const PIE_OUTER = 108
const PIE_INNER = 62

function emptySeverity(): SeverityCounts {
  return { P1: 0, P2: 0, P3: 0, P4: 0 }
}

function emptyStatuses(): StatusCounts {
  return { open: 0, in_progress: 0, in_review: 0, resolved: 0 }
}

function percentOf(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

function polar(radius: number, angle: number): string {
  const x = PIE_CENTER + radius * Math.cos(angle)
  const y = PIE_CENTER + radius * Math.sin(angle)
  return `${x.toFixed(3)} ${y.toFixed(3)}`
}

/** Sector de dona entre dos ángulos (en radianes). */
function donutPath(start: number, end: number): string {
  const span = end - start

  // Un único sector ocupa el círculo completo: dos semiarcos por borde.
  if (span >= Math.PI * 2 - 1e-6) {
    const o = PIE_OUTER
    const i = PIE_INNER
    const c = PIE_CENTER
    return (
      `M ${c - o} ${c} A ${o} ${o} 0 1 1 ${c + o} ${c} A ${o} ${o} 0 1 1 ${c - o} ${c} Z ` +
      `M ${c - i} ${c} A ${i} ${i} 0 1 0 ${c + i} ${c} A ${i} ${i} 0 1 0 ${c - i} ${c} Z`
    )
  }

  const large = span > Math.PI ? 1 : 0
  return (
    `M ${polar(PIE_OUTER, start)} ` +
    `A ${PIE_OUTER} ${PIE_OUTER} 0 ${large} 1 ${polar(PIE_OUTER, end)} ` +
    `L ${polar(PIE_INNER, end)} ` +
    `A ${PIE_INNER} ${PIE_INNER} 0 ${large} 0 ${polar(PIE_INNER, start)} Z`
  )
}

function formatHours(hours: number): string {
  return `${hours.toFixed(1)} hrs`
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

const WEEKDAY_FORMAT = new Intl.DateTimeFormat('es', { weekday: 'short' })

export const useDashboardStore = defineStore('dashboard', () => {
  const auth = useAuthStore()

  // State
  const rawApps = ref<DashboardApp[]>([])
  const userIncidents = ref<UserIncident[]>([])
  const mttrHours = ref(0)
  const slaCompliance = ref(0)
  const resolvedSprint = ref(0)
  const loading = ref(false)
  const loaded = ref(false)
  const systemTab = ref<'all' | 'mine'>('all')
  const activeSliceId = ref<string | null>(null)

  // Apps con métricas derivadas
  const apps = computed<DashboardAppStats[]>(() => {
    const assignedNames = auth.user?.assignedSystems
    const userName = auth.user?.name

    return rawApps.value.map((app) => {
      const active = SEVERITIES.reduce((acc, s) => acc + app.severity[s], 0)
      const assigned = assignedNames
        ? assignedNames.includes(app.name)
        : !!userName && app.lead === userName

      return { ...app, active, total: active + app.statuses.resolved, assigned }
    })
  })

  // Estadísticas globales: SIEMPRE sobre todas las apps, sin filtros
  const totals = computed<DashboardTotals>(() => {
    const bySeverity = emptySeverity()
    const byStatus = emptyStatuses()

    for (const app of rawApps.value) {
      for (const s of SEVERITIES) bySeverity[s] += app.severity[s]
      for (const st of STATUSES) byStatus[st] += app.statuses[st]
    }

    const active = ACTIVE_STATUSES.reduce((acc, st) => acc + byStatus[st], 0)

    return {
      apps: rawApps.value.length,
      active,
      resolved: byStatus.resolved,
      total: active + byStatus.resolved,
      bySeverity,
      byStatus,
      criticalShare: percentOf(bySeverity.P1, active),
    }
  })

  const priorityStats = computed<PriorityStat[]>(() =>
    SEVERITIES.map((severity: Severity) => ({
      severity,
      count: totals.value.bySeverity[severity],
      percentage: percentOf(totals.value.bySeverity[severity], totals.value.active),
    })),
  )

  const statusStats = computed<StatusStat[]>(() =>
    STATUSES.map((status) => ({
      status,
      count: totals.value.byStatus[status],
      percentage: percentOf(totals.value.byStatus[status], totals.value.total),
    })),
  )

  const trend = computed<TrendPoint[]>(() => {
    const days = rawApps.value.reduce((max, app) => Math.max(max, app.created.length, app.resolved.length), 0)
    const today = new Date()

    return Array.from({ length: days }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (days - 1 - i))

      return {
        label: WEEKDAY_FORMAT.format(date).replace('.', ''),
        created: rawApps.value.reduce((acc, app) => acc + (app.created[i] ?? 0), 0),
        resolved: rawApps.value.reduce((acc, app) => acc + (app.resolved[i] ?? 0), 0),
      }
    })
  })

  const trendMax = computed<number>(() =>
    Math.max(1, ...trend.value.flatMap((point) => [point.created, point.resolved])),
  )

  const assignedApps = computed(() => apps.value.filter((app) => app.assigned))

  // Cola personal: incidencias activas de los sistemas a cargo del usuario.
  const assignedIncidents = computed(() => {
    const names = new Set(assignedApps.value.map((app) => app.name))
    return userIncidents.value.filter((i) => names.has(i.systemName) && i.status !== 'resolved')
  })

  const userMetrics = computed<UserDashboardMetrics>(() => ({
    assignedSystemsCount: assignedApps.value.length,
    assignedSystems: assignedApps.value.map((app) => app.name),
    assignedIncidentsCount: assignedIncidents.value.length,
    assignedCriticalCount: assignedIncidents.value.filter((i) => i.severity === 'P1').length,
    mttrHours: formatHours(mttrHours.value),
    slaCompliance: formatPercent(slaCompliance.value),
  }))

  // Tab "todas / a mi cargo": solo afecta a la gráfica y al listado
  const displayedApps = computed<DashboardAppStats[]>(() => {
    const list = systemTab.value === 'mine' ? assignedApps.value : apps.value
    return [...list].sort((a, b) => b.active - a.active)
  })

  const pieTotal = computed<number>(() => displayedApps.value.reduce((acc, app) => acc + app.active, 0))

  const pieSlices = computed<PieSlice[]>(() => {
    const total = pieTotal.value
    let angle = -Math.PI / 2

    return displayedApps.value.map((app, index) => {
      const color = colorForIndex(index)
      const fraction = total > 0 ? app.active / total : 0
      const start = angle
      const end = angle + fraction * Math.PI * 2
      angle = end

      return {
        id: app.id,
        name: app.name,
        domain: app.domain,
        count: app.active,
        percentage: percentOf(app.active, total),
        color: color.fill,
        borderColor: color.border,
        // Las apps sin incidencias activas se listan pero no dibujan sector.
        pathData: fraction > 0 ? donutPath(start, end) : '',
        assigned: app.assigned,
        health: app.health,
        lead: app.lead,
        severity: app.severity,
      }
    })
  })

  const activeSlice = computed<PieSlice | null>(() => {
    if (!activeSliceId.value) return null
    return pieSlices.value.find((s) => s.id === activeSliceId.value) ?? null
  })

  // Actions
  function setSystemTab(tab: 'all' | 'mine') {
    systemTab.value = tab
    activeSliceId.value = null
  }

  function setActiveSliceId(id: string | null) {
    activeSliceId.value = id
  }

  async function refreshData() {
    if (loading.value) return
    loading.value = true
    try {
      const snapshot = await fetchDashboardSnapshot()
      rawApps.value = snapshot.apps
      userIncidents.value = snapshot.userIncidents
      mttrHours.value = snapshot.mttrHours
      slaCompliance.value = snapshot.slaCompliance
      resolvedSprint.value = snapshot.resolvedSprint
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    loaded,
    systemTab,
    activeSliceId,
    resolvedSprint,
    // Getters
    apps,
    totals,
    priorityStats,
    statusStats,
    trend,
    trendMax,
    userMetrics,
    displayedApps,
    pieTotal,
    pieSlices,
    activeSlice,
    // Actions
    setSystemTab,
    setActiveSliceId,
    refreshData,
  }
})
