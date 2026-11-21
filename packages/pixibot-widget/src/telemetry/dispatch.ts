import type { AutoIncident } from '../types'
import { state } from './state'

const nativeFetch: typeof fetch | null = typeof window !== 'undefined' && typeof window.fetch === 'function' ? window.fetch.bind(window) : null
const STORE_KEY = 'pixibot:cooldowns'

const cooldowns = new Map<string, number>()
let sentTimes: number[] = []

function loadCooldowns(): void {
  if (cooldowns.size) return
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (raw) for (const [k, v] of Object.entries(JSON.parse(raw) as Record<string, number>)) cooldowns.set(k, v)
  } catch { /* storage bloqueado */ }
}

function persistCooldowns(now: number, ttl: number): void {
  for (const [k, t] of cooldowns) if (now - t > ttl) cooldowns.delete(k)
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify(Object.fromEntries(cooldowns))) } catch { /* ignorar */ }
}

export function resetDispatch(): void {
  cooldowns.clear()
  sentTimes = []
  try { sessionStorage.removeItem(STORE_KEY) } catch { /* ignorar */ }
}

/** Firma alineada con la agrupación del backend (red: ruta+endpoint+status; JS: mensaje). */
export function buildSignature(i: AutoIncident): string {
  const t = i.telemetry
  const sys = state.ctx?.system ?? ''
  if (i.error_type === 'frontend_error') {
    return `JS|${sys}|${i.module_route}|${i.code}|${String(t.js_error ?? i.error_message).slice(0, 80)}`
  }
  return `NET|${sys}|${i.module_route}|${t.http_method ?? ''} ${t.failed_endpoint ?? ''}|${t.http_status ?? ''}|${t.ora_code ?? ''}`
}

function allow(signature: string): boolean {
  const ctx = state.ctx!
  const now = Date.now()
  loadCooldowns()
  const prev = cooldowns.get(signature)
  if (prev && now - prev < ctx.opts.cooldownMs) return false
  sentTimes = sentTimes.filter((t) => now - t < 60_000)
  if (sentTimes.length >= ctx.opts.maxPerMinute) return false
  cooldowns.set(signature, now)
  sentTimes.push(now)
  persistCooldowns(now, ctx.opts.cooldownMs)
  return true
}

/** Envío silencioso: nunca lanza ni espera al llamador. */
export function dispatchAutoIncident(incident: AutoIncident): void {
  try {
    const ctx = state.ctx
    if (!ctx) return
    const apiKey = ctx.getApiKey()
    if (!ctx.apiUrl || !apiKey) return
    if (!allow(buildSignature(incident))) return

    const fetcher = ctx.fetcher ?? nativeFetch
    if (!fetcher) return
    const user = ctx.getUser()
    const body = JSON.stringify({
      system_name: ctx.system,
      app_version: ctx.appVersion ?? null,
      source: 'pixibot-auto',
      user_agent: navigator.userAgent,
      occurred_at: new Date().toISOString(),
      reporter_data: user ? { id: user.id ?? null, name: user.name, email: user.email ?? null } : null,
      ...incident,
      module_route: incident.module_route.slice(0, 255),
      telemetry: {
        ...incident.telemetry,
        ...(typeof incident.telemetry.failed_endpoint === 'string'
          ? { failed_endpoint: incident.telemetry.failed_endpoint.slice(0, 255) }
          : {}),
      },
    }) // campos acotados: el cuerpo queda muy por debajo del límite de 64 KB de keepalive
    const url = ctx.apiUrl.replace(/\/+$/, '') + '/' + ctx.opts.endpoint.replace(/^\/+/, '')
    void fetcher(url, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-System-Key': apiKey },
      body,
    }).catch(() => {})
  } catch { /* no interrumpir la app anfitriona */ }
}
