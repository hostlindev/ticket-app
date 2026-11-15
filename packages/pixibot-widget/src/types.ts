export type IssueType = 'blocks_flow' | 'not_working' | 'wrong_info' | 'slow' | 'visual' | 'other'

/** Usuario que tiene la sesión abierta en el sistema anfitrión. */
export interface PixibotUser {
  id?: string | number
  name: string
  email?: string
}

export interface PixibotOptions {
  /** URL base de la API de incidencias, p. ej. `https://api.pixi.dev/api`. */
  apiUrl: string
  /** Nombre del sistema donde está instalado (se envía con cada reporte). */
  system: string
  /** Usuario logueado. Puede ser una función si cambia durante la sesión. */
  user: PixibotUser | (() => PixibotUser | null)
  /** Token Bearer (o función que lo entregue). Opcional. */
  token?: string | null | (() => string | null)
  /** Ruta del endpoint que recibe el reporte. Por defecto `/tickets`. */
  endpoint?: string
  /** Dónde se ancla el botón. Por defecto `bottom-right`. */
  position?: 'bottom-right' | 'bottom-left'
  /** Color de acento (CSS). Por defecto celeste Pixi. */
  accentColor?: string
  /** Peso máximo (KB) de la imagen una vez comprimida. Por defecto 800. */
  maxImageKB?: number
  /** `fetch` alternativo (pruebas o mocks). Por defecto el global. */
  fetch?: typeof fetch
  /** Se llama tras enviar con éxito. */
  onSubmitted?: (result: unknown) => void
  /** Se llama si el envío falla. */
  onError?: (error: Error) => void
}

/** Datos técnicos que Pixibot captura sin intervención del usuario. */
export interface ClientContext {
  browser: string
  userAgent: string
  platform: string
  language: string
  timezone: string
  screen: string
  viewport: string
  url: string
  referrer: string
}

export interface PixibotHandle {
  open(): void
  close(): void
  destroy(): void
  /** Actualiza el usuario (útil tras login/logout en una SPA). */
  setUser(user: PixibotUser | null): void
}
