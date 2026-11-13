import type {
  IssueType,
  Paginated,
  Ticket,
  TicketSeverity,
  TicketStatus,
  TicketsQuery,
  TicketsSummary,
} from '../interface/ticket.interface'
import { ISSUE_TYPES } from '../config/ticket.config'

const minutesAgo = (minutes: number): string => new Date(Date.now() - minutes * 60_000).toISOString()

/** Captura de pantalla simulada (en producción vendrá del backend/almacenamiento). */
function mockScreenshot(system: string, message: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
<rect width="640" height="400" fill="#f1f5f9"/>
<rect width="640" height="34" fill="#e2e8f0"/>
<circle cx="18" cy="17" r="5" fill="#f87171"/><circle cx="36" cy="17" r="5" fill="#fbbf24"/><circle cx="54" cy="17" r="5" fill="#34d399"/>
<rect x="80" y="8" width="360" height="18" rx="9" fill="#fff"/>
<text x="32" y="80" font-family="sans-serif" font-size="20" font-weight="700" fill="#1e293b">${system}</text>
<rect x="32" y="104" width="576" height="48" rx="8" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
<text x="48" y="134" font-family="sans-serif" font-size="15" fill="#991b1b">${message}</text>
<rect x="32" y="180" width="270" height="150" rx="8" fill="#fff" stroke="#cbd5e1"/>
<rect x="338" y="180" width="270" height="150" rx="8" fill="#fff" stroke="#cbd5e1"/>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'INC-2050',
    description: 'No encuentro dónde cambiar mi foto de perfil, busqué en todos lados.',
    issueType: 'other',
    severity: null,
    status: 'open',
    system: 'EduPath Campus',
    reporter: { id: 'usr_8120', name: 'Camila Duarte', email: 'camila.duarte@edupath.edu' },
    browser: 'Safari 17 · iPhone (iOS 17)',
    ipAddress: '198.51.100.24',
    createdAt: minutesAgo(8),
    slaMinutesRemaining: null,
  },
  {
    id: 'INC-2049',
    description: 'Mi cita aparece para el martes pero yo la agendé para el jueves.',
    issueType: 'wrong_info',
    severity: null,
    status: 'open',
    system: 'MediBook Citas',
    reporter: { id: 'usr_7744', name: 'Andrés Pineda', email: 'andres.pineda@correo.com' },
    screenshotUrl: mockScreenshot('MediBook Citas', 'Tu cita: martes 18 · 10:00 a. m.'),
    browser: 'Chrome 124 · Android 14',
    ipAddress: '203.0.113.77',
    createdAt: minutesAgo(21),
    slaMinutesRemaining: null,
  },
  {
    id: 'INC-2048',
    description:
      'Le doy a "Confirmar pago" y la pantalla se queda congelada. No me llegó ningún número de orden y no sé si me cobraron.',
    issueType: 'blocks_flow',
    severity: 'P1',
    status: 'open',
    system: 'VelocePay Checkout',
    reporter: { id: 'usr_8921', name: 'Sofía Ramírez', email: 'sofia.ramirez@empresa.com' },
    screenshotUrl: mockScreenshot('VelocePay Checkout', 'Ha ocurrido un error inesperado al procesar su transacción.'),
    browser: 'Chrome 124 · macOS Sonoma',
    ipAddress: '203.0.113.15',
    createdAt: minutesAgo(45),
    assignee: { id: 'usr_ada', name: 'Ada Lovelace', email: 'ada@ticket.dev', role: 'Platform Eng' },
    slaMinutesRemaining: 18,
  },
  {
    id: 'INC-2046',
    description: 'No puedo terminar mi pedido: al finalizar la compra me dice que no hay stock, pero el producto sí aparece disponible.',
    issueType: 'blocks_flow',
    severity: 'P1',
    status: 'in_progress',
    system: 'KromaShop B2B',
    reporter: { id: 'usr_4412', name: 'Javier Morales', email: 'j.morales@distribuidor.es' },
    browser: 'Edge 123 · Windows 11',
    ipAddress: '198.51.100.62',
    createdAt: minutesAgo(70),
    assignee: { id: 'usr_linus', name: 'Linus Torvalds', email: 'linus@ticket.dev', role: 'Backend Dev' },
    slaMinutesRemaining: 42,
  },
  {
    id: 'INC-2045',
    description: 'Quiero descargar la factura de mi pedido y me sale un mensaje de que no se pudo generar.',
    issueType: 'not_working',
    severity: 'P2',
    status: 'in_progress',
    system: 'KromaShop B2B',
    reporter: { id: 'usr_4412', name: 'Javier Morales', email: 'j.morales@distribuidor.es' },
    screenshotUrl: mockScreenshot('KromaShop B2B', 'No se pudo generar el comprobante. Intente más tarde.'),
    browser: 'Edge 123 · Windows 11',
    ipAddress: '198.51.100.62',
    createdAt: minutesAgo(120),
    assignee: { id: 'usr_linus', name: 'Linus Torvalds', email: 'linus@ticket.dev', role: 'Backend Dev' },
    slaMinutesRemaining: 74,
  },
  {
    id: 'INC-2041',
    description: 'Estaba actualizando mi perfil y de repente me sacó de la sesión. Tuve que entrar otra vez y perdí lo que había escrito.',
    issueType: 'not_working',
    severity: 'P2',
    status: 'in_review',
    system: 'NexaPortal Clientes',
    reporter: { id: 'usr_3182', name: 'Lucía Fernández', email: 'lucia.fernandez@cliente.mx' },
    browser: 'Firefox 125 · Ubuntu 22.04',
    ipAddress: '203.0.113.108',
    createdAt: minutesAgo(195),
    assignee: { id: 'usr_ada', name: 'Ada Lovelace', email: 'ada@ticket.dev', role: 'Platform Eng' },
    slaMinutesRemaining: 150,
  },
  {
    id: 'INC-2039',
    description: 'El catálogo se queda cargando para siempre cuando elijo ver todas las sucursales.',
    issueType: 'slow',
    severity: 'P2',
    status: 'in_progress',
    system: 'NexaPortal Clientes',
    reporter: { id: 'usr_7109', name: 'Marcos Villalba', email: 'marcos.villalba@sucursal.com' },
    browser: 'Chrome 123 · Windows 10',
    ipAddress: '198.51.100.9',
    createdAt: minutesAgo(240),
    assignee: { id: 'usr_ada', name: 'Ada Lovelace', email: 'ada@ticket.dev', role: 'Platform Eng' },
    slaMinutesRemaining: 190,
  },
  {
    id: 'INC-2033',
    description: 'No me deja adjuntar el archivo en el formulario de quejas, dice que es inválido pero es un PDF normal.',
    issueType: 'not_working',
    severity: 'P3',
    status: 'in_progress',
    system: 'NexaPortal Clientes',
    reporter: { id: 'usr_2290', name: 'Patricia Gómez', email: 'patricia.gomez@correo.com' },
    screenshotUrl: mockScreenshot('NexaPortal Clientes', 'El archivo seleccionado no es válido.'),
    browser: 'Chrome 124 · macOS Sonoma',
    ipAddress: '203.0.113.201',
    createdAt: minutesAgo(1300),
    slaMinutesRemaining: 480,
  },
  {
    id: 'INC-2031',
    description: 'Los botones del formulario de nuevo reclamo se ven encimados en mi celular y no puedo tocar el de enviar.',
    issueType: 'visual',
    severity: 'P3',
    status: 'in_review',
    system: 'OmniDesk Soporte',
    reporter: { id: 'usr_5531', name: 'Diego Salazar', email: 'diego.salazar@empresa.com' },
    screenshotUrl: mockScreenshot('OmniDesk Soporte', 'Nuevo reclamo'),
    browser: 'Chrome 124 · Android 13',
    ipAddress: '198.51.100.141',
    createdAt: minutesAgo(1500),
    assignee: { id: 'usr_alan', name: 'Alan Turing', email: 'alan@ticket.dev', role: 'Frontend Dev' },
    slaMinutesRemaining: 600,
  },
  {
    id: 'INC-2022',
    description: 'El total de la nota de crédito no cuadra con la suma de las líneas, hay una diferencia de unos centavos.',
    issueType: 'wrong_info',
    severity: 'P4',
    status: 'resolved',
    system: 'FacturaCloud PyME',
    reporter: { id: 'usr_9910', name: 'Rosa Martínez', email: 'rosa.martinez@pyme.com' },
    browser: 'Chrome 122 · Windows 11',
    ipAddress: '203.0.113.56',
    createdAt: minutesAgo(2900),
    assignee: { id: 'usr_ada', name: 'Ada Lovelace', email: 'ada@ticket.dev', role: 'Platform Eng' },
    slaMinutesRemaining: 0,
  },
]

/* ---------- Volumen simulado: ~56 reportes de 7 sistemas ---------- */

const GENERATED_SYSTEMS = [
  'EduPath Campus',
  'MediBook Citas',
  'VelocePay Checkout',
  'KromaShop B2B',
  'NexaPortal Clientes',
  'OmniDesk Soporte',
  'FacturaCloud PyME',
]

const GENERATED_TEXTS: Record<IssueType, string[]> = {
  blocks_flow: [
    'No puedo continuar: el botón de siguiente no responde.',
    'Se queda cargando y no me deja terminar el trámite.',
    'Me saca de la sesión cada vez que intento guardar.',
  ],
  not_working: [
    'Intento descargar el comprobante y no pasa nada.',
    'El buscador no me devuelve resultados aunque sé que existen.',
    'Subí un archivo y dice que se cargó, pero no aparece.',
  ],
  wrong_info: [
    'El total que veo no coincide con lo que me llegó por correo.',
    'Mi nombre aparece mal escrito en el perfil.',
    'Las fechas se muestran en un día distinto al que elegí.',
  ],
  slow: [
    'La página tarda más de un minuto en abrir.',
    'Cada vez que cambio de pestaña se demora mucho.',
  ],
  visual: [
    'Los botones se ven encimados en mi celular.',
    'El texto se sale de la caja y no se alcanza a leer.',
  ],
  other: [
    'Sugerencia: me gustaría poder exportar esto a Excel.',
    'No sé cómo cambiar mi contraseña desde aquí.',
  ],
}

const REPORTERS = [
  ['Lucía Herrera', 'lucia.herrera@correo.com'],
  ['Mateo Salinas', 'mateo.salinas@empresa.com'],
  ['Valentina Rojas', 'v.rojas@cliente.org'],
  ['Diego Castaño', 'diego.castano@correo.com'],
  ['Paula Mendoza', 'paula.mendoza@empresa.com'],
  ['Hugo Beltrán', 'hugo.beltran@cliente.org'],
  ['Marta Quiroga', 'marta.quiroga@correo.com'],
]
const BROWSERS = [
  'Chrome 124 · Windows 11',
  'Firefox 125 · Ubuntu 22.04',
  'Safari 17 · macOS Sonoma',
  'Chrome 124 · Android 14',
  'Edge 123 · Windows 10',
  'Safari 17 · iPhone (iOS 17)',
]
const ISSUE_KEYS = Object.keys(ISSUE_TYPES) as IssueType[]
const STATUS_POOL: TicketStatus[] = ['open', 'open', 'in_progress', 'in_review', 'resolved', 'closed']
const SEVERITY_POOL: Array<TicketSeverity | null> = ['P1', 'P2', 'P2', 'P3', 'P3', 'P4', 'P4']
const SLA_MINUTES: Record<TicketSeverity, number> = { P1: 60, P2: 240, P3: 1440, P4: 4320 }

function generateTickets(count: number): Ticket[] {
  // Generador pseudoaleatorio determinista: el mock es estable entre recargas.
  let seed = 7
  const rnd = (n: number): number => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed % n
  }

  return Array.from({ length: count }, (_, i) => {
    const issueType = ISSUE_KEYS[rnd(ISSUE_KEYS.length)]!
    const texts = GENERATED_TEXTS[issueType]
    const system = GENERATED_SYSTEMS[rnd(GENERATED_SYSTEMS.length)]!
    const [name, email] = REPORTERS[rnd(REPORTERS.length)]!
    const status = STATUS_POOL[rnd(STATUS_POOL.length)]!
    const closed = status === 'resolved' || status === 'closed'
    const severity = i < 2 && !closed ? null : SEVERITY_POOL[rnd(SEVERITY_POOL.length)]!
    const age = 120 + i * 190 + rnd(120)
    const hasShot = rnd(3) === 0

    return {
      id: `INC-${1950 - i}`,
      description: texts[rnd(texts.length)]!,
      issueType,
      severity,
      status,
      system,
      reporter: { id: `usr_${3000 + rnd(900)}`, name: name!, email: email! },
      screenshotUrl: hasShot ? mockScreenshot(system, 'Algo salió mal') : undefined,
      browser: BROWSERS[rnd(BROWSERS.length)]!,
      ipAddress: `203.0.113.${1 + rnd(250)}`,
      createdAt: minutesAgo(age),
      slaMinutesRemaining: severity && !closed ? Math.max(0, SLA_MINUTES[severity] - rnd(SLA_MINUTES[severity])) : null,
    }
  })
}

/** "Base de datos" en memoria: los 10 reportes escritos a mano + los generados. */
let ticketsCache: Ticket[] = [...MOCK_TICKETS, ...generateTickets(46)]

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const isActive = (t: Ticket): boolean => t.status !== 'resolved' && t.status !== 'closed'

/** Equivale a `GET /tickets?page=&pageSize=&search=&severity=&status=&system=&issueType=` */
export async function getTickets(query: TicketsQuery): Promise<Paginated<Ticket>> {
  await delay(220)

  const search = query.search.trim().toLowerCase()

  const matches = ticketsCache
    .filter((t) => {
      if (query.severity === 'pending') {
        if (t.severity !== null) return false
      } else if (query.severity !== 'all' && t.severity !== query.severity) return false

      if (query.status !== 'all' && t.status !== query.status) return false
      if (query.system !== 'all' && t.system !== query.system) return false
      if (query.issueType !== 'all' && t.issueType !== query.issueType) return false

      if (search) {
        const haystack = [t.id, t.description, t.system, t.reporter.name, t.reporter.email, ISSUE_TYPES[t.issueType].label]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const total = matches.length
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize))
  const page = Math.min(Math.max(1, query.page), totalPages)
  const start = (page - 1) * query.pageSize

  return {
    items: matches.slice(start, start + query.pageSize).map((t) => ({ ...t })),
    meta: { page, pageSize: query.pageSize, total, totalPages },
  }
}

/** Equivale a `GET /tickets/summary`: totales globales, sin paginar ni filtrar. */
export async function getTicketsSummary(): Promise<TicketsSummary> {
  await delay(120)
  return {
    total: ticketsCache.length,
    criticalP1: ticketsCache.filter((t) => t.severity === 'P1' && isActive(t)).length,
    pending: ticketsCache.filter((t) => t.severity === null && isActive(t)).length,
    inProgress: ticketsCache.filter((t) => t.status === 'in_progress' || t.status === 'open').length,
    resolved: ticketsCache.filter((t) => !isActive(t)).length,
    systems: Array.from(new Set(ticketsCache.map((t) => t.system))).sort(),
  }
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  await delay(120)
  const ticket = ticketsCache.find((t) => t.id === id)
  return ticket ? { ...ticket } : null
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  await delay(150)
  const index = ticketsCache.findIndex((t) => t.id === id)
  const current = index === -1 ? undefined : ticketsCache[index]

  if (!current) {
    throw new Error(`Ticket con ID ${id} no encontrado`)
  }

  const updated: Ticket = {
    ...current,
    status,
  }

  ticketsCache[index] = updated
  return { ...updated }
}
