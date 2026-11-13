import http from '@core/api/http'
import type {
  AuthError,
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from '../interface/auth.interface'

export const DEMO_CREDENTIALS = {
  email: 'admin@ticket.dev',
  password: 'Ticket123!',
} as const

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'
const LATENCY_MS = 800
const SESSION_TTL_MS = 8 * 60 * 60 * 1_000

const DEMO_USER: AuthUser = {
  id: 'usr_ada',
  name: 'Ada Lovelace',
  email: DEMO_CREDENTIALS.email,
  role: 'admin',
  department: 'Frontend & Web Platforms',
  assignedSystems: ['NexaPortal Clientes', 'KromaShop B2B', 'VelocePay Checkout'],
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createAuthError(
  code: string,
  message: string,
  fieldErrors?: AuthError['fieldErrors'],
): AuthError {
  return { code, message, fieldErrors }
}

export function toAuthError(error: unknown): AuthError {
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const candidate = error as { code: unknown; message: unknown; fieldErrors?: unknown }

    if (typeof candidate.code === 'string' && typeof candidate.message === 'string') {
      return {
        code: candidate.code,
        message: candidate.message,
        fieldErrors: candidate.fieldErrors as AuthError['fieldErrors'],
      }
    }
  }

  return createAuthError('ERR_UNEXPECTED', 'Algo salió mal al iniciar tu sesión. Inténtalo de nuevo.')
}

function issueDemoToken(): string {
  const payload = window.btoa(
    JSON.stringify({ sub: DEMO_USER.id, role: DEMO_USER.role, iat: Date.now() }),
  )
  const nonce =
    typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : Math.random().toString(36).slice(2)

  return `demo.${payload}.${nonce}`
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  if (!USE_MOCK) {
    const { data } = await http.post<LoginResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      remember: credentials.remember,
    })

    return data
  }

  await delay(LATENCY_MS)

  const emailMatches = credentials.email.trim().toLowerCase() === DEMO_CREDENTIALS.email
  const passwordMatches = credentials.password === DEMO_CREDENTIALS.password

  if (!emailMatches || !passwordMatches) {
    throw createAuthError(
      'ERR_AUTH_INVALID_CREDENTIALS',
      'El correo o la contraseña no son correctos.',
      { password: 'Revisa tus datos o pide ayuda a quien administra el equipo.' },
    )
  }

  return {
    accessToken: issueDemoToken(),
    expiresAt: Date.now() + SESSION_TTL_MS,
    user: DEMO_USER,
  }
}

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    await delay(150)
    return
  }

  await http.post('/auth/logout')
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  if (USE_MOCK) {
    return DEMO_USER
  }

  const { data } = await http.get<AuthUser>('/auth/me')
  return data
}
