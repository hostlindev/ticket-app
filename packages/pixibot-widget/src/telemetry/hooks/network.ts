import { dispatchAutoIncident } from '../dispatch'
import { inspectPayload, isReadableContentType, MAX_SCAN_CHARS } from '../detect'
import { normalizePath } from '../sanitize'
import { state } from '../state'

function ignored(url: string): boolean {
  const ctx = state.ctx
  if (!ctx) return true
  const bare = url.split(/[?#]/)[0]
  if (ctx.ownUrls.includes(bare!)) return true
  return ctx.opts.ignoreUrls.some((p) => (typeof p === 'string' ? url.includes(p) : p.test(url)))
}

/** Evalúa una respuesta ya recibida y, si corresponde, reporta. Nunca lanza. */
export function handleResponse(method: string, rawUrl: string, status: number, body: string | null): void {
  try {
    const ctx = state.ctx
    if (!ctx || ignored(new URL(rawUrl, location.origin).href)) return
    const { opts } = ctx
    const endpoint = normalizePath(new URL(rawUrl, location.origin).pathname)
    const route = normalizePath(location.pathname)
    const a = inspectPayload(status, body ?? '')
    const isOra = opts.oracle && a.isOracleError && (status >= 400 || opts.scanSuccessBodies)
    const is5xx = opts.network && a.isServerError
    if (status >= 400 || isOra) {
      state.lastNetworkError = { status, endpoint, oraCode: isOra ? a.oraCode : null, time: Date.now() }
    }
    if (!isOra && !is5xx) return
    dispatchAutoIncident({
      error_type: isOra ? 'oracle_error' : 'http_5xx',
      code: isOra ? a.oraCode! : `HTTP_${status}`,
      error_message: a.errorExcerpt || `Error HTTP ${status} en ${endpoint}`,
      module_route: route,
      telemetry: {
        http_status: status,
        http_method: method.toUpperCase(),
        failed_endpoint: endpoint,
        ora_code: isOra ? a.oraCode : null,
        last_ui_action: state.lastClickedElement,
      },
    })
  } catch { /* ignorar */ }
}

function wantsBody(status: number): boolean {
  const o = state.ctx?.opts
  return !!o && (status >= 400 || (o.oracle && o.scanSuccessBodies))
}

/** Solo JSON/texto/XML, nunca streams (SSE) ni binarios. */
function scannable(contentType: string | null): boolean {
  return isReadableContentType(contentType) && !/event-stream|ndjson/i.test(contentType ?? '')
}

/** Lee como máximo MAX_SCAN_CHARS bytes del clon y cancela el resto. */
async function readCapped(res: Response): Promise<string> {
  if (!res.body) return ''
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let out = ''
  try {
    while (out.length < MAX_SCAN_CHARS) {
      const { done, value } = await reader.read()
      if (done) break
      out += decoder.decode(value, { stream: true })
    }
  } finally {
    void reader.cancel().catch(() => {})
  }
  return out.slice(0, MAX_SCAN_CHARS)
}

export function installFetchHook(): () => void {
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') return () => {}
  const original = window.fetch
  const wrapped: typeof fetch = async function (this: unknown, ...args) {
    const response = await original.apply(window, args)
    try {
      const input = args[0]
      const url = input instanceof Request ? input.url : String(input ?? '')
      const method = args[1]?.method ?? (input instanceof Request ? input.method : 'GET')
      const status = response.status
      if (wantsBody(status)) {
        if (scannable(response.headers.get('content-type')) && !response.bodyUsed) {
          // Segundo plano y acotado: no se retrasa ni se bufferiza la respuesta del anfitrión.
          void readCapped(response.clone()).then(
            (t) => handleResponse(method, url, status, t),
            () => handleResponse(method, url, status, null),
          )
        } else {
          handleResponse(method, url, status, null)
        }
      }
    } catch { /* ignorar */ }
    return response
  }
  window.fetch = wrapped
  return () => {
    if (window.fetch === wrapped) window.fetch = original
  }
}

interface XhrMeta { method: string; url: string }
const metaKey = Symbol('pixibot')

export function installXhrHook(): () => void {
  if (typeof XMLHttpRequest === 'undefined') return () => {}
  const proto = XMLHttpRequest.prototype
  const origOpen = proto.open
  const origSend = proto.send
  const open = function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: unknown[]) {
    ;(this as unknown as Record<symbol, XhrMeta>)[metaKey] = { method, url: String(url) }
    return (origOpen as (...a: unknown[]) => void).call(this, method, url, ...rest)
  } as typeof proto.open
  const send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
    this.addEventListener('loadend', () => {
      try {
        const meta = (this as unknown as Record<symbol, XhrMeta>)[metaKey]
        if (!meta || !this.status) return
        let text: string | null = null
        if (wantsBody(this.status) && scannable(this.getResponseHeader('content-type'))) {
          if (this.responseType === '' || this.responseType === 'text') text = this.responseText.slice(0, MAX_SCAN_CHARS)
          else if (this.responseType === 'json' && this.response != null) text = JSON.stringify(this.response).slice(0, MAX_SCAN_CHARS)
        }
        handleResponse(meta.method, meta.url, this.status, text)
      } catch { /* ignorar */ }
    })
    return origSend.call(this, body)
  }
  proto.open = open
  proto.send = send
  return () => {
    if (proto.open === open) proto.open = origOpen
    if (proto.send === send) proto.send = origSend
  }
}
