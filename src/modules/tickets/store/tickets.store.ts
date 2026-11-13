import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  IssueType,
  PaginationMeta,
  SeverityFilter,
  Ticket,
  TicketStatus,
  TicketsQuery,
  TicketsSummary,
} from '../interface/ticket.interface'
import { getTickets, getTicketsSummary, updateTicketStatus } from '../services/tickets.service'

export const PAGE_SIZE_OPTIONS = [10, 20, 50]

const EMPTY_SUMMARY: TicketsSummary = { total: 0, criticalP1: 0, pending: 0, inProgress: 0, resolved: 0, systems: [] }

export const useTicketsStore = defineStore('tickets', () => {
  // La lista contiene SOLO la página actual; el resto vive en el backend.
  const tickets = ref<Ticket[]>([])
  const meta = ref<PaginationMeta>({ page: 1, pageSize: PAGE_SIZE_OPTIONS[0]!, total: 0, totalPages: 1 })
  const summary = ref<TicketsSummary>({ ...EMPTY_SUMMARY })
  const selectedTicket = ref<Ticket | null>(null)
  const isLoading = ref(false)
  const hasLoaded = ref(false)
  const error = ref<string | null>(null)

  // Paginación y filtros (se envían al backend)
  const page = ref(1)
  const pageSize = ref(PAGE_SIZE_OPTIONS[0]!)
  const search = ref('')
  const severityFilter = ref<SeverityFilter>('all')
  const statusFilter = ref<TicketStatus | 'all'>('all')
  const systemFilter = ref<string | 'all'>('all')
  const issueTypeFilter = ref<IssueType | 'all'>('all')

  const metrics = computed(() => summary.value)
  const availableSystems = computed(() => summary.value.systems)

  const rangeStart = computed(() => (meta.value.total === 0 ? 0 : (meta.value.page - 1) * meta.value.pageSize + 1))
  const rangeEnd = computed(() => rangeStart.value === 0 ? 0 : rangeStart.value + tickets.value.length - 1)

  function currentQuery(): TicketsQuery {
    return {
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
      severity: severityFilter.value,
      status: statusFilter.value,
      system: systemFilter.value,
      issueType: issueTypeFilter.value,
    }
  }

  // Evita que una respuesta lenta pise a una más reciente.
  let requestId = 0

  async function fetchTickets(): Promise<void> {
    const id = ++requestId
    isLoading.value = true
    error.value = null
    try {
      const result = await getTickets(currentQuery())
      if (id !== requestId) return
      tickets.value = result.items
      meta.value = result.meta
      page.value = result.meta.page
      hasLoaded.value = true
    } catch (err) {
      if (id !== requestId) return
      error.value = err instanceof Error ? err.message : 'Error al cargar tickets'
    } finally {
      if (id === requestId) isLoading.value = false
    }
  }

  async function fetchSummary(): Promise<void> {
    try {
      summary.value = await getTicketsSummary()
    } catch {
      /* las tarjetas quedan en su último valor */
    }
  }

  async function init(): Promise<void> {
    await Promise.all([fetchTickets(), fetchSummary()])
  }

  function goToPage(next: number): void {
    page.value = next
    fetchTickets()
  }

  // Cambiar un filtro vuelve a la página 1; la búsqueda espera a que el usuario deje de teclear.
  let searchTimer: ReturnType<typeof setTimeout> | undefined
  function refetchFromStart(): void {
    page.value = 1
    fetchTickets()
  }

  watch([severityFilter, statusFilter, systemFilter, issueTypeFilter, pageSize], refetchFromStart)
  watch(search, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(refetchFromStart, 300)
  })

  async function changeStatus(ticketId: string, status: TicketStatus): Promise<void> {
    isLoading.value = true
    try {
      const updated = await updateTicketStatus(ticketId, status)
      const index = tickets.value.findIndex((t) => t.id === ticketId)
      if (index !== -1) {
        tickets.value[index] = updated
      }
      fetchSummary()
      if (selectedTicket.value?.id === ticketId) {
        selectedTicket.value = updated
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar estado'
    } finally {
      isLoading.value = false
    }
  }

  function resetFilters(): void {
    search.value = ''
    severityFilter.value = 'all'
    statusFilter.value = 'all'
    systemFilter.value = 'all'
    issueTypeFilter.value = 'all'
  }

  function selectTicket(ticket: Ticket | null): void {
    selectedTicket.value = ticket
  }

  return {
    tickets,
    selectedTicket,
    isLoading,
    error,
    search,
    severityFilter,
    statusFilter,
    systemFilter,
    issueTypeFilter,
    metrics,
    availableSystems,
    meta,
    page,
    pageSize,
    hasLoaded,
    rangeStart,
    rangeEnd,
    init,
    goToPage,
    fetchTickets,
    changeStatus,
    resetFilters,
    selectTicket,
  }
})
