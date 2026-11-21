import type { PixibotMonitorOptions, PixibotUser, TelemetrySnapshot } from '../types'

export interface MonitorContext {
  apiUrl: string
  system: string
  appVersion?: string
  getUser: () => PixibotUser | null
  getApiKey: () => string | null
  /** fetch que usa el despacho (mock) o `undefined` para el nativo guardado. */
  fetcher?: typeof fetch
  /** Rutas propias de Pixibot (manual + automático), ya resueltas a URL absoluta. */
  ownUrls: string[]
  opts: Required<Omit<PixibotMonitorOptions, 'ignoreUrls'>> & { ignoreUrls: Array<string | RegExp> }
}

export const FRESH_MS = 120_000

export const state = {
  ctx: null as MonitorContext | null,
  lastNetworkError: null as { status: number; endpoint: string; oraCode: string | null; time: number } | null,
  lastJsError: null as { message: string; time: number } | null,
  lastClickedElement: 'none',
}

export function resetState(): void {
  state.ctx = null
  state.lastNetworkError = null
  state.lastJsError = null
  state.lastClickedElement = 'none'
}

export function getTelemetrySnapshot(): TelemetrySnapshot {
  const now = Date.now()
  const net = state.lastNetworkError && now - state.lastNetworkError.time < FRESH_MS ? state.lastNetworkError : null
  const js = state.lastJsError && now - state.lastJsError.time < FRESH_MS ? state.lastJsError : null
  return {
    http_status: net?.status ?? null,
    failed_endpoint: net?.endpoint ?? null,
    ora_code: net?.oraCode ?? null,
    js_error: js?.message ?? null,
    last_ui_action: state.lastClickedElement,
  }
}
