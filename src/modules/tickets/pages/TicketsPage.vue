<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@core/layouts/AppLayout.vue'
import { useTickets } from '../composables/useTickets'
import type { Ticket } from '../interface/ticket.interface'
import TicketsMetricsCards from '../components/TicketsMetricsCards.vue'
import TicketsFilterBar from '../components/TicketsFilterBar.vue'
import TicketsPagination from '../components/TicketsPagination.vue'
import TicketsList from '../components/TicketsList.vue'
import TicketDetailModal from '../components/TicketDetailModal.vue'

const { init } = useTickets()

const selectedTicket = ref<Ticket | null>(null)
const isDetailOpen = ref(false)

function openDetail(ticket: Ticket): void {
  selectedTicket.value = ticket
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
