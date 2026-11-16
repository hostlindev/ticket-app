import http, { type ApiResponse } from '@core/api/http'
import { USE_MOCK } from '@core/api/config'
import type { Developer, NewSystemInput, SystemAssignment } from '../interface/assignment.interface'

const DEVELOPERS: Developer[] = [
  { id: 'usr_ada', name: 'Ada Lovelace', email: 'ada@ticket.dev', specialty: 'Plataforma' },
  { id: 'usr_linus', name: 'Linus Torvalds', email: 'linus@ticket.dev', specialty: 'Backend' },
  { id: 'usr_grace', name: 'Grace Hopper', email: 'grace@ticket.dev', specialty: 'Backend' },
  { id: 'usr_alan', name: 'Alan Turing', email: 'alan@ticket.dev', specialty: 'Backend' },
  { id: 'usr_kath', name: 'Katherine Johnson', email: 'katherine@ticket.dev', specialty: 'Datos' },
  { id: 'usr_dennis', name: 'Dennis Ritchie', email: 'dennis@ticket.dev', specialty: 'Backend' },
  { id: 'usr_margaret', name: 'Margaret Hamilton', email: 'margaret@ticket.dev', specialty: 'QA' },
  { id: 'usr_tim', name: 'Tim Berners-Lee', email: 'tim@ticket.dev', specialty: 'Frontend' },
  { id: 'usr_hedy', name: 'Hedy Lamarr', email: 'hedy@ticket.dev', specialty: 'Frontend' },
  { id: 'usr_brendan', name: 'Brendan Eich', email: 'brendan@ticket.dev', specialty: 'Frontend' },
  { id: 'usr_barbara', name: 'Barbara Liskov', email: 'barbara@ticket.dev', specialty: 'QA' },
  { id: 'usr_evan', name: 'Evan You', email: 'evan@ticket.dev', specialty: 'Frontend' },
]

const byId = (ids: string[]): Developer[] =>
  ids.map((id) => DEVELOPERS.find((d) => d.id === id)).filter((d): d is Developer => !!d)

/** Asignaciones guardadas: systemId → ids de desarrolladores. */
const assignments = new Map<string, string[]>([
  ['app-nexaportal', ['usr_ada', 'usr_tim']],
  ['app-kromashop', ['usr_ada', 'usr_linus', 'usr_hedy']],
  ['app-velocepay', ['usr_ada', 'usr_grace']],
  ['app-omnidesk', ['usr_margaret']],
  ['app-facturacloud', ['usr_alan', 'usr_brendan']],
  ['app-logistix', []],
  ['app-medibook', ['usr_kath', 'usr_evan', 'usr_barbara']],
  ['app-edupath', []],
])

const SYSTEMS: Array<Omit<SystemAssignment, 'developers' | 'lead'>> = [
  { id: 'app-nexaportal', name: 'NexaPortal Clientes', domain: 'clientes.nexa.io', leadId: 'usr_ada' },
  { id: 'app-kromashop', name: 'KromaShop B2B', domain: 'tienda.kroma.com' },
  { id: 'app-velocepay', name: 'VelocePay Checkout', domain: 'checkout.veloce.io' },
  { id: 'app-omnidesk', name: 'OmniDesk Soporte', domain: 'ayuda.omnidesk.com' },
  { id: 'app-facturacloud', name: 'FacturaCloud PyME', domain: 'app.facturacloud.io' },
  { id: 'app-logistix', name: 'LogistiX Tracking', domain: 'tracking.logistix.app' },
  { id: 'app-medibook', name: 'MediBook Citas', domain: 'citas.medibook.health' },
  { id: 'app-edupath', name: 'EduPath Campus', domain: 'campus.edupath.edu' },
]

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toSystem(base: Omit<SystemAssignment, 'developers' | 'lead'>): SystemAssignment {
  const lead = byId(base.leadId ? [base.leadId] : [])[0] ?? null
  return { ...base, lead, developers: byId(assignments.get(base.id) ?? []) }
}

/** Equivale a `GET /systems` (con sus desarrolladores asignados). */
export async function getSystems(): Promise<SystemAssignment[]> {
  if (!USE_MOCK) {
    const { data: body } = await http.get<ApiResponse<SystemAssignment[]>>('/systems')
    return body.data
  }

  await delay(250)
  return SYSTEMS.map(toSystem)
}

/** Equivale a `GET /developers`. */
export async function getDevelopers(): Promise<Developer[]> {
  if (!USE_MOCK) {
    const { data: body } = await http.get<ApiResponse<Developer[]>>('/developers')
    return body.data
  }

  await delay(150)
  return DEVELOPERS.map((d) => ({ ...d }))
}

/** Equivale a `PUT /systems/:id/developers` con la lista completa de ids. */
export async function setSystemDevelopers(systemId: string, developerIds: string[]): Promise<SystemAssignment> {
  if (!USE_MOCK) {
    const { data: body } = await http.put<ApiResponse<SystemAssignment>>(`/systems/${encodeURIComponent(systemId)}/developers`, {
      developerIds: [...new Set(developerIds)],
    })
    return body.data
  }

  await delay(300)
  const base = SYSTEMS.find((s) => s.id === systemId)
  if (!base) throw new Error('El sistema ya no existe.')
  assignments.set(systemId, [...new Set(developerIds)])
  return toSystem(base)
}

/** Equivale a `PUT /systems/:id` (nombre, dominio y descripción). */
export async function updateSystem(systemId: string, input: NewSystemInput): Promise<SystemAssignment> {
  if (!USE_MOCK) {
    const { data: body } = await http.put<ApiResponse<SystemAssignment>>(
      `/systems/${encodeURIComponent(systemId)}`,
      input,
    )
    return body.data
  }

  await delay(300)
  const base = SYSTEMS.find((s) => s.id === systemId)
  if (!base) throw new Error('El sistema ya no existe.')
  const domain = input.domain.trim().toLowerCase()
  if (SYSTEMS.some((s) => s.id !== systemId && s.domain.toLowerCase() === domain)) {
    throw new Error('Ya existe un sistema registrado con ese dominio.')
  }
  base.name = input.name.trim()
  base.domain = domain
  base.description = input.description?.trim() || undefined
  base.leadId = input.leadId
  return toSystem(base)
}

/** Equivale a `DELETE /systems/:id`. */
export async function deleteSystem(systemId: string): Promise<void> {
  if (!USE_MOCK) {
    await http.delete(`/systems/${encodeURIComponent(systemId)}`)
    return
  }

  await delay(300)
  const index = SYSTEMS.findIndex((s) => s.id === systemId)
  if (index === -1) throw new Error('El sistema ya no existe.')
  SYSTEMS.splice(index, 1)
  assignments.delete(systemId)
}

/** Equivale a `POST /systems`. */
export async function createSystem(input: NewSystemInput): Promise<SystemAssignment> {
  if (!USE_MOCK) {
    const { data: body } = await http.post<ApiResponse<SystemAssignment>>('/systems', input)
    return body.data
  }

  await delay(400)
  const name = input.name.trim()
  const domain = input.domain.trim().toLowerCase()
  if (SYSTEMS.some((s) => s.domain.toLowerCase() === domain)) {
    throw new Error('Ya existe un sistema registrado con ese dominio.')
  }
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
  const base = {
    id: `app-${slug || 'sistema'}-${Date.now().toString(36)}`,
    name,
    domain,
    description: input.description?.trim() || undefined,
    leadId: input.leadId,
  }
  SYSTEMS.push(base)
  assignments.set(base.id, [])
  return toSystem(base)
}
