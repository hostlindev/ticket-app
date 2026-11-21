import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { attachVue, installMonitor, getTelemetrySnapshot } from '../src/telemetry'
import type { PixibotOptions } from '../src/types'

const API = 'https://api.test/api'
let sent: Array<{ url: string; init: RequestInit; body: any }>
let uninstall: () => void
let hostFetch: ReturnType<typeof vi.fn>

function setup(extra: Partial<PixibotOptions> = {}, hostResponse: () => Response = () => new Response('', { status: 200 })) {
  sent = []
  hostFetch = vi.fn(async () => hostResponse())
  window.fetch = hostFetch as unknown as typeof fetch
  const dispatchFetch = (async (url: string, init: RequestInit) => {
    sent.push({ url, init, body: JSON.parse(String(init.body)) })
    return new Response('{}', { status: 201 })
  }) as unknown as typeof fetch
  uninstall = installMonitor(
    { apiUrl: API, system: 'Sys', user: { id: 1, name: 'Ana' }, apiKey: 'key-1', monitor: true, fetch: dispatchFetch, ...extra },
    () => ({ id: 1, name: 'Ana' }),
    'pixibot-widget-host',
  )
}
const flush = () => new Promise((r) => setTimeout(r, 10))

beforeEach(() => sessionStorage.clear())
afterEach(() => uninstall?.())

describe('fetch hook', () => {
  it('500 → http_5xx, devuelve la respuesta original', async () => {
    setup({}, () => new Response('boom', { status: 500 }))
    const res = await fetch('/api/tickets/42', { method: 'POST' })
    expect(res.status).toBe(500)
    await flush()
    expect(sent).toHaveLength(1)
    expect(sent[0]!.url).toBe(`${API}/v1/pixibot/incidents/auto`)
    expect((sent[0]!.init.headers as Record<string, string>)['X-System-Key']).toBe('key-1')
    expect(sent[0]!.body).toMatchObject({ error_type: 'http_5xx', code: 'HTTP_500', telemetry: { http_status: 500, failed_endpoint: '/api/tickets/:id' } })
  })

  it('200 con ORA-00942 → oracle_error', async () => {
    setup({}, () => new Response('{"msg":"ORA-00942: tabla"}', { status: 200, headers: { 'content-type': 'application/json' } }))
    await fetch('/api/x')
    await flush()
    expect(sent[0]!.body).toMatchObject({ error_type: 'oracle_error', telemetry: { ora_code: 'ORA-00942' } })
  })

  it('400 sin ORA no envía pero guarda el snapshot', async () => {
    setup({}, () => new Response('bad', { status: 400 }))
    await fetch('/api/x')
    await flush()
    expect(sent).toHaveLength(0)
    expect(getTelemetrySnapshot().http_status).toBe(400)
  })

  it('cooldown: el mismo error no se reenvía', async () => {
    setup({}, () => new Response('boom', { status: 500 }))
    await fetch('/api/x'); await fetch('/api/x'); await fetch('/api/x')
    await flush()
    expect(sent).toHaveLength(1)
  })

  it('tope global por minuto', async () => {
    setup({ monitor: { maxPerMinute: 2 } }, () => new Response('boom', { status: 500 }))
    for (const p of ['a', 'b', 'c', 'd']) await fetch(`/api/${p}`)
    await flush()
    expect(sent).toHaveLength(2)
  })

  it('ignora la propia API de Pixibot (sin bucle)', async () => {
    setup({}, () => new Response('boom', { status: 500 }))
    await fetch(`${API}/tickets`)
    await flush()
    expect(sent).toHaveLength(0)
  })

  it('sí monitorea otras rutas de la misma API (base compartida con el anfitrión)', async () => {
    setup({}, () => new Response('boom', { status: 500 }))
    await fetch(`${API}/orders/5`)
    await flush()
    expect(sent).toHaveLength(1)
    expect(sent[0]!.body.telemetry.failed_endpoint).toBe('/api/orders/:id')
  })

  it('ignora el endpoint manual configurado y el automático, aunque apiUrl sea relativa', async () => {
    setup({ apiUrl: '/api', endpoint: '/v1/pixibot/tickets' }, () => new Response('boom', { status: 500 }))
    await fetch('/api/v1/pixibot/tickets')
    await fetch('/api/v1/pixibot/incidents/auto')
    await flush()
    expect(sent).toHaveLength(0)
  })

  it('no lee streams SSE', async () => {
    const stream = new ReadableStream({ start() { /* nunca termina */ } })
    setup({}, () => new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } }))
    const res = await fetch('/api/live')
    expect(res.bodyUsed).toBe(false)
    await flush()
    expect(sent).toHaveLength(0)
  })

  it('ORA en 200 queda en el snapshot del reporte manual', async () => {
    setup({}, () => new Response('ORA-01400 null', { status: 200, headers: { 'content-type': 'text/plain' } }))
    await fetch('/api/x')
    await flush()
    expect(getTelemetrySnapshot().ora_code).toBe('ORA-01400')
  })

  it('acota endpoints largos y el cuerpo sigue siendo JSON válido', async () => {
    setup({}, () => new Response('boom', { status: 500 }))
    await fetch('/api/' + 'z'.repeat(5000))
    await flush()
    expect(sent[0]!.body.telemetry.failed_endpoint.length).toBe(255)
  })

  it('sin apiKey no envía', async () => {
    setup({ apiKey: null }, () => new Response('boom', { status: 500 }))
    await fetch('/api/x')
    await flush()
    expect(sent).toHaveLength(0)
  })

  it('sanitiza el mensaje', async () => {
    setup({}, () => new Response('error token=abc123', { status: 500 }))
    await fetch('/api/x')
    await flush()
    expect(sent[0]!.body.error_message).toContain('[REDACTED]')
    expect(sent[0]!.body.error_message).not.toContain('abc123')
  })

  it('uninstall restaura fetch y reinstalar no apila wrappers', async () => {
    setup()
    const wrapped = window.fetch
    uninstall()
    expect(window.fetch).toBe(hostFetch)
    setup(); setup()
    await fetch('/api/x')
    expect(hostFetch).toHaveBeenCalledTimes(1)
    expect(window.fetch).not.toBe(wrapped)
  })
})

describe('XHR hook', () => {
  it('500 vía XMLHttpRequest se reporta', async () => {
    const realSend = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.send = function () {} // sin red real
    setup()
    const x = new XMLHttpRequest()
    x.open('GET', '/api/orders/7')
    Object.defineProperty(x, 'status', { value: 500 })
    Object.defineProperty(x, 'responseText', { value: 'ORA-06512 at line 1' })
    x.send()
    x.dispatchEvent(new Event('loadend'))
    await flush()
    uninstall()
    XMLHttpRequest.prototype.send = realSend
    expect(sent[0]!.body).toMatchObject({ error_type: 'oracle_error', telemetry: { ora_code: 'ORA-06512', failed_endpoint: '/api/orders/:id' } })
  })
})

describe('errores de frontend', () => {
  it('window error → frontend_error', async () => {
    setup()
    window.dispatchEvent(new ErrorEvent('error', { message: 'x is not a function', filename: 'app.js' }))
    await flush()
    expect(sent[0]!.body).toMatchObject({ error_type: 'frontend_error', code: 'JS_ERROR', telemetry: { js_error: 'x is not a function' } })
  })

  it('rechazo con Error se reporta; objetos planos (errores HTTP normalizados) no', async () => {
    setup()
    window.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: { code: 'ERR_HTTP_500', message: 'El servidor…' } }))
    window.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: new TypeError('a is undefined') }))
    await flush()
    expect(sent).toHaveLength(1)
    expect(sent[0]!.body).toMatchObject({ code: 'UNHANDLED_REJECTION', telemetry: { js_error: 'a is undefined' } })
  })

  it('filtra ruido', async () => {
    setup()
    window.dispatchEvent(new ErrorEvent('error', { message: 'Script error.' }))
    window.dispatchEvent(new ErrorEvent('error', { message: 'boom', filename: 'chrome-extension://abc/x.js' }))
    await flush()
    expect(sent).toHaveLength(0)
  })

  it('attachVue reporta y conserva el handler previo', async () => {
    setup()
    const prev = vi.fn()
    const app = { config: { errorHandler: prev as any } }
    attachVue(app)
    app.config.errorHandler!(new Error('render fail'), { type: { name: 'Foo' } }, 'setup')
    await flush()
    expect(prev).toHaveBeenCalled()
    expect(sent[0]!.body).toMatchObject({ code: 'VUE_ERROR', telemetry: { vue_component: 'Foo', js_error: 'render fail' } })
  })
})

describe('última acción UI', () => {
  it('etiqueta botones, no lee texto de contenedores', async () => {
    setup()
    document.body.innerHTML = '<div id="big"><p>texto enorme</p><button aria-label="Guardar">x</button></div><section><p>dato</p></section>'
    document.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(getTelemetrySnapshot().last_ui_action).toBe('button:Guardar')
    document.querySelector('section p')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(getTelemetrySnapshot().last_ui_action).toBe('p:')
  })
})
