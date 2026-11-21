import { dispatchAutoIncident } from '../dispatch'
import { normalizePath, sanitizeText } from '../sanitize'
import { state } from '../state'

const NOISE = [/^Script error\.?$/i, /ResizeObserver loop/i]
const EXT = /^(chrome|moz|safari(-web)?)-extension:\/\//i

export function reportFrontendError(code: string, message: string, extra: Record<string, unknown> = {}): void {
  const ctx = state.ctx
  if (!ctx) return
  const msg = sanitizeText(message || 'Error de JavaScript')
  state.lastJsError = { message: msg, time: Date.now() }
  if (!ctx.opts.frontend) return
  dispatchAutoIncident({
    error_type: 'frontend_error',
    code,
    error_message: extra.vue_component ? `[${extra.vue_component}] ${msg}` : msg,
    module_route: normalizePath(location.pathname),
    telemetry: { http_status: null, js_error: msg, last_ui_action: state.lastClickedElement, ...extra },
  })
}

export function installErrorHooks(): () => void {
  if (typeof window === 'undefined') return () => {}
  const onError = (e: ErrorEvent) => {
    try {
      if (NOISE.some((r) => r.test(e.message || '')) || EXT.test(e.filename || '')) return
      reportFrontendError('JS_ERROR', e.message, { source: e.filename ? sanitizeText(e.filename, 200) : null })
    } catch { /* ignorar */ }
  }
  const onRejection = (e: PromiseRejectionEvent) => {
    try {
      const r = e.reason as unknown
      // Solo excepciones reales. Los objetos planos suelen ser errores HTTP normalizados
      // por el anfitrión (ya capturados por el hook de red) y las cancelaciones no son fallos.
      if (!(r instanceof Error) && typeof r !== 'string') return
      if (r instanceof Error && (r.name === 'AbortError' || (r as { isAxiosError?: boolean }).isAxiosError)) return
      reportFrontendError('UNHANDLED_REJECTION', r instanceof Error ? r.message : r)
    } catch { /* ignorar */ }
  }
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)
  return () => {
    window.removeEventListener('error', onError)
    window.removeEventListener('unhandledrejection', onRejection)
  }
}
