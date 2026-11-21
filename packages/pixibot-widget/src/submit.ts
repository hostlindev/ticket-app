import type { ClientContext, IssueType, PixibotUser, TelemetrySnapshot } from './types'

export interface ReportPayload {
  issueType: IssueType
  description: string
  system: string
  user: PixibotUser
  context: ClientContext
  screenshot?: Blob | null
  telemetry?: TelemetrySnapshot | null
}

/** Envía el reporte como multipart/form-data (nombres en snake_case para Laravel). */
export async function submitReport(
  apiUrl: string,
  endpoint: string,
  p: ReportPayload,
  apiKey: string | null = null,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  const fd = new FormData()
  fd.append('issue_type', p.issueType)
  fd.append('description', p.description)
  fd.append('system', p.system)
  fd.append('source', 'pixibot')
  fd.append('reporter[id]', p.user.id != null ? String(p.user.id) : '')
  fd.append('reporter[name]', p.user.name)
  fd.append('reporter[email]', p.user.email ?? '')
  for (const [key, value] of Object.entries(p.context)) fd.append(`client[${key}]`, value)
  fd.append('browser', p.context.browser)
  if (p.telemetry) {
    for (const [k, v] of Object.entries(p.telemetry)) {
      if (v !== null && v !== undefined && v !== '' && v !== 'none') fd.append(`telemetry[${k}]`, String(v))
    }
  }
  if (p.screenshot) fd.append('screenshot', p.screenshot, 'captura.jpg')

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (apiKey) headers['X-System-Key'] = apiKey

  const url = apiUrl.replace(/\/+$/, '') + '/' + endpoint.replace(/^\/+/, '')
  const res = await fetcher(url, { method: 'POST', headers, body: fd })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = (body as { message?: string } | null)?.message
    throw new Error(msg ?? `No se pudo enviar el reporte (HTTP ${res.status}).`)
  }
  return body
}
