<script setup lang="ts">
import { PAGE_SIZE_OPTIONS } from '../store/tickets.store'
import { useTickets } from '../composables/useTickets'

const props = withDefaults(defineProps<{ position?: 'top' | 'bottom' }>(), { position: 'bottom' })

const { meta, page, pageSize, rangeStart, rangeEnd, isLoading, goToPage } = useTickets()

function onPage(next: number): void {
  goToPage(next)
  // Abajo: sube para ver la nueva página desde el inicio. Arriba ya estás ahí.
  if (props.position === 'bottom') window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <nav
    v-if="meta.total > 0"
    class="console-card flex flex-col items-center gap-3 p-3 sm:flex-row sm:justify-between sm:p-4"
    :aria-label="`Paginación de reportes (${position === 'top' ? 'superior' : 'inferior'})`"
  >
    <p class="m-0 text-[12.5px] text-ink-500">
      Reportes <strong class="text-ink-900">{{ rangeStart }}–{{ rangeEnd }}</strong> de
      <strong class="text-ink-900">{{ meta.total }}</strong>
    </p>

    <v-pagination
      :model-value="page"
      :length="meta.totalPages"
      :total-visible="5"
      :disabled="isLoading"
      density="comfortable"
      rounded="lg"
      active-color="primary"
      class="tickets-pagination"
      @update:model-value="onPage"
    />

    <label class="flex items-center gap-2 text-[12.5px] text-ink-500">
      Por página
      <select
        :value="pageSize"
        class="rounded-lg border border-silver-300 bg-white px-2 py-1 text-[13px] font-semibold text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70"
        @change="pageSize = Number(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="n in PAGE_SIZE_OPTIONS" :key="n" :value="n">{{ n }}</option>
      </select>
    </label>
  </nav>
</template>
