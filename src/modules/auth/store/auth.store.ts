import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { UNAUTHORIZED_EVENT } from '@core/api/interceptors'
import { setAccessToken } from '@core/api/token'
import {
  AUTH_SESSION_KEY,
  readStorage,
  removeStorage,
  writeStorage,
} from '@core/utils/storage'
import * as authService from '../services/auth.service'
import type {
  AuthError,
  AuthSession,
  AuthStatus,
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from '../interface/auth.interface'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const accessToken = ref<string | null>(null)
  const expiresAt = ref<number | null>(null)
  const status = ref<AuthStatus>('idle')
  const error = ref<AuthError | null>(null)
  const remember = ref(false)

  const isAuthenticated = computed(() => {
    if (!accessToken.value || !user.value) return false
    return !expiresAt.value || expiresAt.value > Date.now()
  })

  const firstName = computed(() => user.value?.name.split(/\s+/)[0] ?? '')

  const userInitials = computed(() => {
    const name = user.value?.name.trim()
    if (!name) return '??'

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  })

  function applySession(session: AuthSession): void {
    user.value = session.user
    accessToken.value = session.accessToken
    expiresAt.value = session.expiresAt
    setAccessToken(session.accessToken)
    status.value = 'authenticated'
  }

  function restore(): void {
    const session = readStorage<AuthSession>(AUTH_SESSION_KEY)
    if (!session) return

    if (session.expiresAt <= Date.now()) {
      removeStorage(AUTH_SESSION_KEY)
      return
    }

    applySession(session)
    remember.value = true
  }

  async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    status.value = 'loading'
    error.value = null

    try {
      const response = await authService.login(credentials)

      applySession({
        accessToken: response.accessToken,
        expiresAt: response.expiresAt,
        user: response.user,
      })

      remember.value = credentials.remember

      if (credentials.remember) {
        writeStorage<AuthSession>(AUTH_SESSION_KEY, {
          accessToken: response.accessToken,
          expiresAt: response.expiresAt,
          user: response.user,
        })
      } else {
        removeStorage(AUTH_SESSION_KEY)
      }

      return response
    } catch (caught) {
      const normalized = authService.toAuthError(caught)
      error.value = normalized
      status.value = 'error'
      throw normalized
    }
  }

  /** Actualiza los sistemas a cargo del usuario en sesión (y en el almacenamiento si se recordó). */
  function setAssignedSystems(names: string[]): void {
    if (!user.value) return
    user.value = { ...user.value, assignedSystems: names }

    if (remember.value && accessToken.value && expiresAt.value) {
      writeStorage<AuthSession>(AUTH_SESSION_KEY, {
        accessToken: accessToken.value,
        expiresAt: expiresAt.value,
        user: user.value,
      })
    }
  }

  async function logout(): Promise<void> {
    try {
      await authService.logout()
    } catch {
      // Logging out locally must succeed even if the API is unreachable.
    } finally {
      clearSession()
    }
  }

  function clearSession(): void {
    user.value = null
    accessToken.value = null
    expiresAt.value = null
    status.value = 'idle'
    error.value = null
    remember.value = false
    setAccessToken(null)
    removeStorage(AUTH_SESSION_KEY)
  }

  window.addEventListener(UNAUTHORIZED_EVENT, clearSession)
  restore()

  return {
    user,
    accessToken,
    expiresAt,
    status,
    error,
    remember,
    isAuthenticated,
    firstName,
    userInitials,
    login,
    logout,
    restore,
    clearSession,
    setAssignedSystems,
  }
})
