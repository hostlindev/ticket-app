<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import AppLayout from '@core/layouts/AppLayout.vue'
import { useTickets } from '../composables/useTickets'
import { useTicketsStore } from '../store/tickets.store'
import type { Ticket } from '../interface/ticket.interface'
import TicketsMetricsCards from '../components/TicketsMetricsCards.vue'
import TicketsFilterBar from '../components/TicketsFilterBar.vue'
import TicketsPagination from '../components/TicketsPagination.vue'
import TicketsList from '../components/TicketsList.vue'
import TicketDetailModal from '../components/TicketDetailModal.vue'

const { init } = useTickets()

const store = useTicketsStore()

// Se guarda solo el id: el modal siempre recibe la versión más reciente de la store.
const selectedId = ref<string | null>(null)
const selectedSnapshot = ref<Ticket | null>(null)
const selectedTicket = computed(() => store.tickets.find((t) => t.id === selectedId.value) ?? selectedSnapshot.value)
const isDetailOpen = ref(false)

function openDetail(ticket: Ticket): void {
  selectedId.value = ticket.id
  selectedSnapshot.value = ticket
  isDetailOpen.value = true
}

onMounted(() => {
  init()
})
</script>

<template>
  <AppLayout
    title="Incidencias de aplicaciones web"
    subtitle="Reportes que envían los usuarios desde tus sistemas: lo que escribieron, su captura y los datos del reporte."
  >
    <div class="space-y-5 sm:space-y-6">
      <TicketsMetricsCards />
      <TicketsFilterBar />
      <TicketsPagination position="top" />
      <TicketsList @select="openDetail" />
      <TicketsPagination position="bottom" />
    </div>

    <TicketDetailModal v-model="isDetailOpen" :ticket="selectedTicket" />
  </AppLayout>
</template>
