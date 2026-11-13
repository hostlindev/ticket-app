<script setup lang="ts">
import type { Ticket } from '../interface/ticket.interface'
import { useTickets } from '../composables/useTickets'
import TicketCard from './TicketCard.vue'

const { tickets, isLoading, hasLoaded, meta, resetFilters } = useTickets()

const emit = defineEmits<{
  select: [ticket: Ticket]
}>()
</script>

<template>
  <section class="space-y-3 transition-opacity" :class="{ 'pointer-events-none opacity-60': isLoading && hasLoaded }" :aria-busy="isLoading" aria-live="polite">
    <!-- Esqueletos de carga -->
    <template v-if="!hasLoaded">
      <div v-for="n in 3" :key="n" class="console-card animate-pulse space-y-3 p-5">
        <div class="flex gap-2">
          <span class="h-5 w-16 rounded bg-silver-200" />
          <span class="h-5 w-20 rounded bg-silver-200" />
          <span class="h-5 w-24 rounded bg-silver-200" />
        </div>
        <span class="block h-4 w-3/4 rounded bg-silver-200" />
        <span class="block h-3 w-1/2 rounded bg-silver-100" />
      </div>
    </template>

    <div
      v-else-if="tickets.length === 0 && !isLoading"
      class="console-card flex flex-col items-center justify-center px-6 py-12 text-center"
    >
      <span class="grid size-14 place-items-center rounded-2xl bg-silver-100">
        <v-icon icon="mdi-ticket-outline" size="30" class="text-ink-400" />
      </span>
      <h4 class="mt-3 text-base font-bold text-ink-900 sm:text-lg">No hay reportes que mostrar</h4>
      <p class="mt-1 max-w-sm text-[13px] text-ink-500">
        Prueba cambiando los filtros o la búsqueda.
      </p>
      <v-btn
        v-if="meta.total === 0"
        variant="tonal"
        color="primary"
        size="small"
        class="mt-4 rounded-lg font-bold"
        prepend-icon="mdi-filter-remove-outline"
        @click="resetFilters"
      >
        Limpiar filtros
      </v-btn>
    </div>

    <TicketCard
      v-for="ticket in tickets"
      :key="ticket.id"
      :ticket="ticket"
      @select="emit('select', $event)"
    />
  </section>
</template>
