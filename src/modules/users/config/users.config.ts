import type { UserRole } from '@modules/auth/interface/auth.interface'
import type { UserRoleFilter } from '../interface/user.interface'

export const ROLE_OPTIONS: Array<{ label: string; value: UserRole; description: string }> = [
  { label: 'Administrador', value: 'admin', description: 'Gestiona sistemas, equipo y usuarios.' },
  { label: 'Agente', value: 'agent', description: 'Atiende y clasifica reportes.' },
  { label: 'Desarrollador', value: 'developer', description: 'Resuelve incidencias de sus sistemas.' },
]

export const ROLE_FILTERS: Array<{ label: string; value: UserRoleFilter }> = [
  { label: 'Todos', value: 'all' },
  ...ROLE_OPTIONS.map((r) => ({ label: r.label, value: r.value })),
]

export function roleLabel(role: UserRole): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role
}

/** Clases literales para que Tailwind las detecte. */
export const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'border-rose-200 bg-rose-50 text-rose-700',
  agent: 'border-amber-200 bg-amber-50 text-amber-800',
  developer: 'border-accent-200 bg-accent-50 text-accent-700',
}
