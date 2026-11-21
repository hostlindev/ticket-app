import type { PixibotMonitorOptions, PixibotOptions, PixibotUser } from '../types'
import { reportFrontendError, installErrorHooks } from './hooks/errors'
import { installClickHook } from './hooks/clicks'
import { installFetchHook, installXhrHook } from './hooks/network'
import { resetDispatch } from './dispatch'
import { resetState, state, type MonitorContext } from './state'
import { sanitizeText } from './sanitize'

export { getTelemetrySnapshot } from './state'

function toAbsolute(url: string): string {
  try { return new URL(url, location.origin).href.split(/[?#]/)[0]! } catch { return url }
}

let uninstallCurrent: (() => void) | null = null

export function resolveMonitorOptions(m: PixibotOptions['monitor']): MonitorContext['opts'] | null {
  if (!m) return null
  const o: PixibotMonitorOptions = m === true ? {} : m
  return {
    endpoint: o.endpoint ?? '/v1/pixibot/incidents/auto',
    network: o.network ?? true,
    oracle: o.oracle ?? true,
    scanSuccessBodies: o.scanSuccessBodies ?? true,
    frontend: o.frontend ?? true,
    cooldownMs: o.cooldownMs ?? 300_000,
    maxPerMinute: o.maxPerMinute ?? 10,
    ignoreUrls: o.ignoreUrls ?? [],
  }
}

/** Instala el monitoreo (idempotente). Devuelve `uninstall`. */
export function installMonitor(
  options: PixibotOptions,
  getUser: () => PixibotUser | null,
  hostId: string,
): () => void {
  uninstallCurrent?.()
  const opts = resolveMonitorOptions(options.monitor)
  if (!opts) return () => {}
  const getApiKey = () => (typeof options.apiKey === 'function' ? options.apiKey() : (options.apiKey ?? null))
  const join = (ep: string) => options.apiUrl.replace(/\/+$/, '') + '/' + ep.replace(/^\/+/, '')
  const ownUrls = [join(options.endpoint ?? '/tickets'), join(opts.endpoint)].map(toAbsolute)
  state.ctx = { apiUrl: options.apiUrl, system: options.system, appVersion: options.appVersion, getUser, getApiKey, fetcher: options.fetch, ownUrls, opts }
  const offs = [installFetchHook(), installXhrHook(), installErrorHooks(), installClickHook(hostId)]
  const uninstall = () => {
    offs.forEach((off) => off())
    resetState()
    resetDispatch()
    if (uninstallCurrent === uninstall) uninstallCurrent = null
  }
  uninstallCurrent = uninstall
  return uninstall
}

/** Reporta manualmente un error capturado por el sistema anfitrión. */
export function captureError(error: unknown, meta: { code?: string; component?: string; info?: string } = {}): void {
  let message: string
  if (error instanceof Error) message = error.message
  else if (typeof error === 'string') message = error
  else {
    try { message = JSON.stringify(error) } catch { message = String(error) }
  }
  message = sanitizeText(message)
  reportFrontendError(meta.code ?? 'CAPTURED_ERROR', message, {
    ...(meta.component ? { vue_component: meta.component } : {}),
    ...(meta.info ? { lifecycle_hook: meta.info } : {}),
  })
}

interface VueAppLike {
  config: { // `any` en instance: la app de Vue declara un tipo propio y el parámetro es contravariante.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorHandler?: ((err: unknown, instance: any, info: string) => void) | undefined }
}

/** Envuelve `app.config.errorHandler` conservando el handler previo del anfitrión. */
export function attachVue(app: VueAppLike): void {
  if (!app?.config) return
  const previous = app.config.errorHandler
  app.config.errorHandler = (err, instance, info) => {
    try {
      const inst = instance as { type?: { name?: string; __name?: string } } | null
      captureError(err, { code: 'VUE_ERROR', component: inst?.type?.name ?? inst?.type?.__name ?? 'AnonymousComponent', info })
    } catch { /* ignorar */ }
    if (typeof previous === 'function') previous(err, instance, info)
    else console.error(err)
  }
}
