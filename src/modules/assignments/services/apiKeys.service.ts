import http, { type ApiResponse } from '@core/api/http'
import { USE_MOCK } from '@core/api/config'

/** Sistema que el usuario coordina (lead), con su API key vigente. */
export interface LedSystem {
  id: string
  name: string
  domain: string
  apiKey: string
}

interface RawKey {
  id?: string
  systemId?: string
  name?: string
  systemName?: string
  domain?: string
  apiKey?: string
}

function normalize(raw: RawKey): LedSystem {
  return {
    id: String(raw.systemId ?? raw.id ?? ''),
    name: raw.systemName ?? raw.name ?? '',
    domain: raw.domain ?? '',
    apiKey: raw.apiKey ?? '',
  }
}

/** Equivale a `GET /systems/lead`: sistemas donde el usuario en sesión es lead. */
export async function getLedSystems(): Promise<LedSystem[]> {
  if (USE_MOCK) return []
  const { data: body } = await http.get<ApiResponse<RawKey[]>>('/systems/lead')
  return body.data.map(normalize)
}

/** Equivale a `POST /systems/:id/api-key`: genera una clave nueva e invalida la anterior. */
export async function rotateSystemApiKey(systemId: string): Promise<LedSystem> {
  if (USE_MOCK) throw new Error('Disponible solo con la API real.')
  const { data: body } = await http.post<ApiResponse<RawKey>>(`/systems/${encodeURIComponent(systemId)}/api-key`)
  return normalize(body.data)
}
