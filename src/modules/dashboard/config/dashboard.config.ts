import type { AppHealth, IncidentStatus, Severity } from '../interface/dashboard.interface'

export const SEVERITIES: Severity[] = ['P1', 'P2', 'P3', 'P4']

export const STATUSES: IncidentStatus[] = ['open', 'in_progress', 'in_review', 'resolved']

/** Clases literales para que Tailwind las detecte. */
export const SEVERITY_META: Record<
  Severity,
  {
    title: string
    sla: string
    hint: string
    card: string
    badge: string
    dot: string
    value: string
    bar: string
    text: string
  }
> = {
  P1: {
    title: 'Críticas',
    sla: '< 1h SLA',
    hint: 'Usuarios no pueden operar',
    card: 'border-l-red-500',
    badge: 'border-red-200 bg-red-50 text-red-700',
    dot: 'bg-red-600',
    value: 'text-red-600',
    bar: 'bg-red-500',
    text: 'text-red-700',
  },
  P2: {
    title: 'Altas',
    sla: '< 4h SLA',
    hint: 'Fallas en descarga o carga',
    card: 'border-l-amber-500',
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    dot: 'bg-amber-500',
    value: 'text-amber-700',
    bar: 'bg-amber-500',
    text: 'text-amber-700',
  },
  P3: {
    title: 'Medias',
    sla: '< 24h SLA',
    hint: 'Errores frontend acotados',
    card: 'border-l-accent-500',
    badge: 'border-accent-200 bg-accent-50 text-accent-700',
    dot: 'bg-accent-500',
    value: 'text-accent-600',
    bar: 'bg-accent-500',
    text: 'text-accent-700',
  },
  P4: {
    title: 'Bajas',
    sla: '< 72h SLA',
    hint: 'Inconsistencias visuales',
    card: 'border-l-silver-400',
    badge: 'border-silver-200 bg-silver-100 text-ink-700',
    dot: 'bg-silver-400',
    value: 'text-ink-700',
    bar: 'bg-silver-400',
    text: 'text-ink-600',
  },
}

export const STATUS_META: Record<IncidentStatus, { label: string; bar: string; dot: string }> = {
  open: { label: 'Abiertas', bar: 'bg-red-400', dot: 'bg-red-400' },
  in_progress: { label: 'En progreso', bar: 'bg-amber-400', dot: 'bg-amber-400' },
  in_review: { label: 'En revisión', bar: 'bg-accent-400', dot: 'bg-accent-400' },
  resolved: { label: 'Resueltas', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
}

export const HEALTH_META: Record<AppHealth, { label: string; dot: string; text: string }> = {
  operational: { label: 'Operativa', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  degraded: { label: 'Degradada', dot: 'bg-amber-500', text: 'text-amber-700' },
  alert: { label: 'En alerta', dot: 'bg-red-500', text: 'text-red-700' },
}

const BASE_COLORS = [
  '#0EA5E9',
  '#F97316',
  '#10B981',
  '#EC4899',
  '#6366F1',
  '#EAB308',
  '#14B8A6',
  '#EF4444',
  '#8B5CF6',
  '#84CC16',
]

/** Colores para N apps: paleta fija y, si hay más, ángulo áureo en HSL. */
export function colorForIndex(index: number): { fill: string; border: string } {
  const base = BASE_COLORS[index]
  if (base) return { fill: base, border: `color-mix(in srgb, ${base} 75%, black)` }

  const hue = Math.round((index * 137.508) % 360)
  return { fill: `hsl(${hue} 65% 50%)`, border: `hsl(${hue} 65% 38%)` }
}
