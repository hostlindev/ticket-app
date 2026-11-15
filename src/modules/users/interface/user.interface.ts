import type { UserRole } from '@modules/auth/interface/auth.interface'

/** Usuario de la plataforma tal como lo ve el administrador. */
export interface ManagedUser {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string | null
  /** Especialidad (Frontend, Backend, QA…) */
  specialty?: string | null
  /** Sistemas que atiende */
  systemsCount: number
  /** Incidencias que resolvió (se conservan aunque se elimine al usuario) */
  resolvedCount: number
}

export interface UserInput {
  name: string
  email: string
  role: UserRole
  department?: string
  specialty?: string
  /** Obligatoria al crear; al editar solo se envía si se quiere cambiar. */
  password?: string
}

export type UserRoleFilter = UserRole | 'all'
