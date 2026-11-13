import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiError } from './errors'
import { getAccessToken } from './token'

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

interface ErrorPayload {
  code?: string
  message?: string
  errors?: Record<string, string>
}

/** Adds the bearer token to every outgoing request. */
export function attachAuthToken(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })
}

/** Converts axios failures into a predictable {@link ApiError}. */
export function normalizeApiError(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ErrorPayload>) => {
      const status = error.response?.status
      const url = error.config?.url ?? ''

      if (status === 401 && !url.includes('/auth/login')) {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
      }

      const payload = error.response?.data
      const normalized: ApiError = {
        code: payload?.code ?? (status ? `ERR_HTTP_${status}` : 'ERR_NETWORK'),
        message: payload?.message ?? defaultMessage(status),
        fieldErrors: payload?.errors,
      }

      return Promise.reject(normalized)
    },
  )
}

function defaultMessage(status?: number): string {
  switch (status) {
    case 401:
      return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    case 403:
      return 'No tienes permisos para realizar esta acción.'
    case 404:
      return 'El recurso solicitado no existe.'
    case 429:
      return 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.'
    case 500:
      return 'El servidor encontró un error inesperado.'
    default:
      return status ? 'No se pudo completar la solicitud.' : 'No hay conexión con el servidor.'
  }
}
