import type { Developer, SystemAssignment } from '../interface/assignment.interface'

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

const SYSTEMS = [
  { id: 'app-nexaportal', name: 'NexaPortal Clientes', domain: 'clientes.nexa.io' },
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

function toSystem(base: (typeof SYSTEMS)[number]): SystemAssignment {
  return { ...base, developers: byId(assignments.get(base.id) ?? []) }
}

/** Equivale a `GET /systems` (con sus desarrolladores asignados). */
export async function getSystems(): Promise<SystemAssignment[]> {
  await delay(250)
  return SYSTEMS.map(toSystem)
}

/** Equivale a `GET /developers`. */
export async function getDevelopers(): Promise<Developer[]> {
  await delay(150)
  return DEVELOPERS.map((d) => ({ ...d }))
}

/** Equivale a `PUT /systems/:id/developers` con la lista completa de ids. */
export async function setSystemDevelopers(systemId: string, developerIds: string[]): Promise<SystemAssignment> {
  await delay(300)
  const base = SYSTEMS.find((s) => s.id === systemId)
  if (!base) throw new Error('El sistema ya no existe.')
  assignments.set(systemId, [...new Set(developerIds)])
  return toSystem(base)
}
