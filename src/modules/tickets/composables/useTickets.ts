import { storeToRefs } from 'pinia'
import { useTicketsStore } from '../store/tickets.store'

export function useTickets() {
  const store = useTicketsStore()

  const {
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
  } = storeToRefs(store)

  return {
    // Refs
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

    // Actions
    init: store.init,
    goToPage: store.goToPage,
    fetchTickets: store.fetchTickets,
    changeStatus: store.changeStatus,
    selectTicket: store.selectTicket,
    resetFilters: store.resetFilters,
  }
}
