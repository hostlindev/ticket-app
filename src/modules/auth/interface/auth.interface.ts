import type { ApiError } from '@core/api/errors'

export type UserRole = 'admin' | 'agent' | 'developer'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error'

export interface LoginCredentials {
  email: string
  password: string
  remember: boolean
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
  avatarUrl?: string
  assignedSystems?: string[]
}

export interface LoginResponse {
  accessToken: string
  expiresAt: number
  user: AuthUser
}

export interface AuthError extends ApiError {
  fieldErrors?: Partial<Record<'email' | 'password', string>>
}

export interface AuthSession {
  accessToken: string
  expiresAt: number
  user: AuthUser
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  expiresAt: number | null
  status: AuthStatus
  error: AuthError | null
  remember: boolean
}
