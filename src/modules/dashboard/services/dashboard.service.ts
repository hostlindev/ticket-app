import type {
  DashboardApp,
  DashboardSnapshot,
  IncidentStatus,
  Severity,
  UserIncident,
} from '../interface/dashboard.interface'

type SeverityTuple = [p1: number, p2: number, p3: number, p4: number]
type StatusTuple = [open: number, inProgress: number, inReview: number, resolved: number]

interface AppSeed {
  id: string
  name: string
  domain: string
  lead: string
  health: DashboardApp['health']
  uptime: string
  /** Activas por severidad P1..P4 */
  severity: SeverityTuple
  /** Por estado: abiertas, en progreso, en revisión, resueltas */
  statuses: StatusTuple
  created: number[]
  resolved: number[]
}

function toApp(seed: AppSeed): DashboardApp {
  const [p1, p2, p3, p4] = seed.severity
  const [open, inProgress, inReview, resolved] = seed.statuses
  const severity: Record<Severity, number> = { P1: p1, P2: p2, P3: p3, P4: p4 }
  const statuses: Record<IncidentStatus, number> = {
    open,
    in_progress: inProgress,
    in_review: inReview,
    resolved,
  }

  return {
    id: seed.id,
    name: seed.name,
    domain: seed.domain,
    lead: seed.lead,
    health: seed.health,
    uptime: seed.uptime,
    severity,
    statuses,
    created: seed.created,
    resolved: seed.resolved,
  }
}

/**
 * Agrega o quita elementos aquí (o reemplaza por la API real): la UI se
 * adapta sola. Mantén sum(severity) == open + inProgress + inReview.
 */
const MOCK_APPS: AppSeed[] = [
  {
    id: 'app-nexaportal',
    name: 'NexaPortal Clientes',
    domain: 'clientes.nexa.io',
    lead: 'Ada Lovelace',
    health: 'degraded',
    uptime: '99.82%',
    severity: [2, 3, 4, 1],
    statuses: [4, 4, 2, 14],
    created: [3, 2, 4, 3, 5, 2, 4],
    resolved: [2, 3, 2, 3, 2, 1, 1],
  },
  {
    id: 'app-kromashop',
    name: 'KromaShop B2B',
    domain: 'tienda.kroma.com',
    lead: 'Ada Lovelace',
    health: 'operational',
    uptime: '99.98%',
    severity: [1, 2, 3, 2],
    statuses: [3, 3, 2, 11],
    created: [2, 1, 3, 2, 2, 3, 3],
    resolved: [1, 2, 1, 2, 2, 1, 2],
  },
  {
    id: 'app-velocepay',
    name: 'VelocePay Checkout',
    domain: 'checkout.veloce.io',
    lead: 'Ada Lovelace',
    health: 'alert',
    uptime: '99.89%',
    severity: [1, 2, 2, 1],
    statuses: [3, 2, 1, 9],
    created: [1, 2, 1, 2, 3, 2, 2],
    resolved: [1, 1, 2, 1, 1, 2, 1],
  },
  {
    id: 'app-omnidesk',
    name: 'OmniDesk Soporte',
    domain: 'ayuda.omnidesk.com',
    lead: 'Margaret Hamilton',
    health: 'operational',
    uptime: '99.95%',
    severity: [0, 2, 3, 2],
    statuses: [3, 3, 1, 8],
    created: [2, 2, 1, 1, 2, 2, 1],
    resolved: [1, 1, 2, 1, 1, 1, 1],
  },
  {
    id: 'app-facturacloud',
    name: 'FacturaCloud PyME',
    domain: 'app.facturacloud.io',
    lead: 'Alan Turing',
    health: 'operational',
    uptime: '99.91%',
    severity: [0, 1, 3, 2],
    statuses: [2, 3, 1, 6],
    created: [1, 1, 2, 1, 1, 2, 1],
    resolved: [1, 0, 1, 1, 1, 1, 1],
  },
  {
    id: 'app-logistix',
    name: 'LogistiX Tracking',
    domain: 'tracking.logistix.app',
    lead: 'Grace Hopper',
    health: 'degraded',
    uptime: '99.74%',
    severity: [1, 1, 2, 3],
    statuses: [2, 3, 2, 5],
    created: [1, 2, 2, 1, 2, 1, 2],
    resolved: [0, 1, 1, 1, 0, 1, 1],
  },
  {
    id: 'app-medibook',
    name: 'MediBook Citas',
    domain: 'citas.medibook.health',
    lead: 'Katherine Johnson',
    health: 'operational',
    uptime: '99.97%',
    severity: [0, 0, 2, 4],
    statuses: [3, 2, 1, 7],
    created: [1, 0, 1, 1, 1, 1, 0],
    resolved: [1, 1, 1, 1, 1, 1, 1],
  },
  {
    id: 'app-edupath',
    name: 'EduPath Campus',
    domain: 'campus.edupath.edu',
    lead: 'Dennis Ritchie',
    health: 'operational',
    uptime: '99.93%',
    severity: [0, 1, 1, 1],
    statuses: [1, 1, 1, 4],
    created: [0, 1, 0, 1, 1, 0, 1],
    resolved: [1, 0, 1, 0, 1, 0, 1],
  },
]

/** Pool de incidencias por sistema; el store filtra las de los sistemas a cargo del usuario. */
const MOCK_USER_INCIDENTS: UserIncident[] = [
  {
    id: 'INC-2048',
    title: 'Fallo 500 al procesar pago con tarjeta en pasarela de checkout',
    systemName: 'VelocePay Checkout',
    systemCode: 'checkout.veloce.io',
    severity: 'P1',
    status: 'open',
    slaTime: '18 min restantes',
    slaStatus: 'critical',
    createdAt: 'Hace 45 min',
  },
  {
    id: 'INC-2046',
    title: 'Fallo al procesar orden en carrito de compra B2B por validación de stock',
    systemName: 'KromaShop B2B',
    systemCode: 'tienda.kroma.com',
    severity: 'P1',
    status: 'in_progress',
    slaTime: '42 min restantes',
    slaStatus: 'critical',
    createdAt: 'Hace 1h 10m',
  },
  {
    id: 'INC-2045',
    title: 'Error al generar PDF de factura fiscal tras confirmación de compra',
    systemName: 'KromaShop B2B',
    systemCode: 'tienda.kroma.com',
    severity: 'P2',
    status: 'in_progress',
    slaTime: '1h 14m restantes',
    slaStatus: 'warning',
    createdAt: 'Hace 2h',
  },
  {
    id: 'INC-2041',
    title: 'Sesión expirada prematuramente en modal de actualización de perfil',
    systemName: 'NexaPortal Clientes',
    systemCode: 'clientes.nexa.io',
    severity: 'P2',
    status: 'in_review',
    slaTime: '2h 30m restantes',
    slaStatus: 'normal',
    createdAt: 'Hace 3h 15m',
  },
  {
    id: 'INC-2038',
    title: 'Spike de latencia al consultar historial de facturas emitidas',
    systemName: 'NexaPortal Clientes',
    systemCode: 'clientes.nexa.io',
    severity: 'P2',
    status: 'open',
    slaTime: '3h 10m restantes',
    slaStatus: 'normal',
    createdAt: 'Hace 4h',
  },
  {
    id: 'INC-2033',
    title: 'Error 422 al subir archivo adjunto en formulario de quejas',
    systemName: 'NexaPortal Clientes',
    systemCode: 'clientes.nexa.io',
    severity: 'P3',
    status: 'in_progress',
    slaTime: '8h restantes',
    slaStatus: 'normal',
    createdAt: 'Ayer',
  },
  {
    id: 'INC-2022',
    title: 'Inconsistencia de centavos en desglose de subtotal de compra',
    systemName: 'VelocePay Checkout',
    systemCode: 'checkout.veloce.io',
    severity: 'P3',
    status: 'resolved',
    slaTime: 'Cumplido',
    slaStatus: 'normal',
    createdAt: 'Ayer',
  },
  {
    id: 'INC-2044',
    title: 'Tickets de soporte duplicados al responder desde el correo',
    systemName: 'OmniDesk Soporte',
    systemCode: 'ayuda.omnidesk.com',
    severity: 'P2',
    status: 'in_progress',
    slaTime: '1h 40m restantes',
    slaStatus: 'warning',
    createdAt: 'Hace 2h 30m',
  },
  {
    id: 'INC-2040',
    title: 'Chat en vivo no muestra el historial de la conversación',
    systemName: 'OmniDesk Soporte',
    systemCode: 'ayuda.omnidesk.com',
    severity: 'P3',
    status: 'open',
    slaTime: '10h restantes',
    slaStatus: 'normal',
    createdAt: 'Hace 5h',
  },
  {
    id: 'INC-2043',
    title: 'Facturas con IVA incorrecto en clientes de régimen simplificado',
    systemName: 'FacturaCloud PyME',
    systemCode: 'app.facturacloud.io',
    severity: 'P1',
    status: 'open',
    slaTime: '25 min restantes',
    slaStatus: 'critical',
    createdAt: 'Hace 50 min',
  },
  {
    id: 'INC-2037',
    title: 'Exportación a Excel se corta después de 500 filas',
    systemName: 'FacturaCloud PyME',
    systemCode: 'app.facturacloud.io',
    severity: 'P3',
    status: 'in_review',
    slaTime: '6h restantes',
    slaStatus: 'normal',
    createdAt: 'Hace 6h',
  },
  {
    id: 'INC-2042',
    title: 'Seguimiento de envíos muestra estado desactualizado',
    systemName: 'LogistiX Tracking',
    systemCode: 'tracking.logistix.app',
    severity: 'P2',
    status: 'open',
    slaTime: '2h 10m restantes',
    slaStatus: 'normal',
    createdAt: 'Hace 3h',
  },
  {
    id: 'INC-2036',
    title: 'Mapa de ruta no carga en navegadores móviles',
    systemName: 'LogistiX Tracking',
    systemCode: 'tracking.logistix.app',
    severity: 'P3',
    status: 'in_progress',
    slaTime: '9h restantes',
    slaStatus: 'normal',
    createdAt: 'Hace 7h',
  },
  {
    id: 'INC-2035',
    title: 'Citas duplicadas al reprogramar desde la app móvil',
    systemName: 'MediBook Citas',
    systemCode: 'citas.medibook.health',
    severity: 'P2',
    status: 'in_progress',
    slaTime: '1h 55m restantes',
    slaStatus: 'warning',
    createdAt: 'Hace 3h 30m',
  },
  {
    id: 'INC-2034',
    title: 'Recordatorios de cita llegan con la hora equivocada',
    systemName: 'MediBook Citas',
    systemCode: 'citas.medibook.health',
    severity: 'P3',
    status: 'open',
    slaTime: '12h restantes',
    slaStatus: 'normal',
    createdAt: 'Ayer',
  },
  {
    id: 'INC-2032',
    title: 'Calificaciones no se reflejan en el boletín del estudiante',
    systemName: 'EduPath Campus',
    systemCode: 'campus.edupath.edu',
    severity: 'P2',
    status: 'open',
    slaTime: '3h restantes',
    slaStatus: 'normal',
    createdAt: 'Hace 4h',
  },
  {
    id: 'INC-2030',
    title: 'Botón de inscripción deshabilitado para cursos con cupo',
    systemName: 'EduPath Campus',
    systemCode: 'campus.edupath.edu',
    severity: 'P4',
    status: 'in_review',
    slaTime: '2d restantes',
    slaStatus: 'normal',
    createdAt: 'Hace 2 días',
  },
]

const SIMULATED_LATENCY_MS = 250

/**
 * Punto único de datos del dashboard. Para conectar la API real basta con
 * reemplazar el cuerpo por una llamada HTTP que devuelva un DashboardSnapshot.
 */
export async function fetchDashboardSnapshot(): Promise<DashboardSnapshot> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS))

  return {
    apps: MOCK_APPS.map(toApp),
    userIncidents: MOCK_USER_INCIDENTS.map((incident) => ({ ...incident })),
    mttrHours: 1.8,
    slaCompliance: 98.4,
    resolvedSprint: 24,
  }
}
