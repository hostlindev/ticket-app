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
  /** Ruta del endpoint que recibe el reporte. Por defecto `/tickets`. */
  endpoint?: string
  /** Dónde se ancla el botón. Por defecto `bottom-right`. */
  position?: 'bottom-right' | 'bottom-left'
  /** Color de acento (CSS). Por defecto celeste Pixi. */
  accentColor?: string
  /** Peso máximo (KB) de la imagen una vez comprimida. Por defecto 800. */
  maxImageKB?: number
  /** API key del sistema; se envía como `X-System-Key` en reportes manuales y automáticos. */
  apiKey?: string | null | (() => string | null)
  /** Versión de la app anfitriona (se adjunta a los incidentes automáticos). */
  appVersion?: string
  /** Monitoreo automático (5xx, ORA-, errores JS). Apagado si se omite. */
  monitor?: boolean | PixibotMonitorOptions
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

export interface PixibotMonitorOptions {
  /** Ruta (relativa a `apiUrl`) que recibe incidentes automáticos. */
  endpoint?: string
  /** Detectar HTTP 5xx (fetch + XHR). Por defecto true. */
  network?: boolean
  /** Detectar códigos ORA- en cuerpos de respuesta. Por defecto true. */
  oracle?: boolean
  /** Buscar ORA- también en respuestas 2xx/3xx. Por defecto true. */
  scanSuccessBodies?: boolean
  /** Capturar window.error / unhandledrejection. Por defecto true. */
  frontend?: boolean
  /** Tiempo sin reenviar la misma firma. Por defecto 300000 (5 min). */
  cooldownMs?: number
  /** Tope global de envíos por minuto. Por defecto 10. */
  maxPerMinute?: number
  /** URLs que nunca se monitorean (además de `apiUrl`). */
  ignoreUrls?: Array<string | RegExp>
}

export type AutoErrorType = 'http_5xx' | 'oracle_error' | 'frontend_error'

export interface AutoIncident {
  error_type: AutoErrorType
  code: string
  error_message: string
  module_route: string
  telemetry: Record<string, unknown>
}

export interface TelemetrySnapshot {
  http_status: number | null
  failed_endpoint: string | null
  ora_code: string | null
  js_error: string | null
  last_ui_action: string
}
