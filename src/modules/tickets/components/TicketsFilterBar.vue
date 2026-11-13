<script setup lang="ts">
import { computed } from 'vue'
import { useTickets } from '../composables/useTickets'
import type { SeverityFilter, TicketStatus } from '../interface/ticket.interface'
import { ISSUE_TYPES, ISSUE_TYPE_KEYS } from '../config/ticket.config'

const {
  search,
  severityFilter,
  statusFilter,
  systemFilter,
  issueTypeFilter,
  availableSystems,
  meta,
  metrics,
  resetFilters,
} = useTickets()

const severityOptions: Array<{ label: string; value: SeverityFilter }> = [
  { label: 'Todas', value: 'all' },
  { label: 'P1 · Crítica', value: 'P1' },
  { label: 'P2 · Alta', value: 'P2' },
  { label: 'P3 · Media', value: 'P3' },
  { label: 'P4 · Baja', value: 'P4' },
  { label: 'Por clasificar', value: 'pending' },
]

const statusOptions: Array<{ label: string; value: TicketStatus | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Abiertos', value: 'open' },
  { label: 'En progreso', value: 'in_progress' },
  { label: 'En revisión', value: 'in_review' },
  { label: 'Resueltos', value: 'resolved' },
]

const hasActiveFilters = computed(
  () =>
    !!search.value?.trim() ||
    severityFilter.value !== 'all' ||
    statusFilter.value !== 'all' ||
    systemFilter.value !== 'all' ||
    issueTypeFilter.value !== 'all',
)

const PILL_BASE = 'shrink-0 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70'
const PILL_ON = 'border-accent-600 bg-accent-600 font-bold text-white shadow-[2px_2px_0_0_var(--shadow-accent)]'
const PILL_OFF = 'border-silver-200 bg-silver-50 text-ink-700 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700'
</script>

<template>
  <section class="console-card p-4 sm:p-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-center">
      <v-text-field
        v-model="search"
        placeholder="Buscar por texto del reporte, usuario, sistema o ID..."
        density="compact"
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
        class="min-w-0 flex-1"
      />

      <v-select
        v-model="systemFilter"
        :items="['all', ...availableSystems]"
        label="Sistema"
        density="compact"
        hide-details
        class="w-full md:w-60 md:shrink-0"
      >
        <template #item="{ item, props: itemProps }">
          <v-list-item v-bind="itemProps" :title="item === 'all' ? 'Todos los sistemas' : item" />
        </template>
        <template #selection="{ item }">
          <span class="truncate text-[12px] font-bold">
            {{ item === 'all' ? 'Todos los sistemas' : item }}
          </span>
        </template>
      </v-select>
    </div>

    <div class="mt-4 space-y-3 border-t border-silver-200 pt-4">
      <!-- En móvil cada grupo hace scroll horizontal en vez de apilarse en muchas líneas -->
      <div class="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-ink-500 lg:w-20">Severidad</span>
        <div class="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <button
            v-for="opt in severityOptions"
            :key="opt.value"
            type="button"
            :class="[PILL_BASE, severityFilter === opt.value ? PILL_ON : PILL_OFF]"
            :aria-pressed="severityFilter === opt.value"
            @click="severityFilter = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-ink-500 lg:w-20">Estado</span>
        <div class="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            type="button"
            :class="[PILL_BASE, statusFilter === opt.value ? PILL_ON : PILL_OFF]"
            :aria-pressed="statusFilter === opt.value"
            @click="statusFilter = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-ink-500 lg:w-20">Tipo</span>
        <div class="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <button
            type="button"
            :class="[PILL_BASE, issueTypeFilter === 'all' ? PILL_ON : PILL_OFF]"
            :aria-pressed="issueTypeFilter === 'all'"
            @click="issueTypeFilter = 'all'"
          >
            Todos
          </button>
          <button
            v-for="key in ISSUE_TYPE_KEYS"
            :key="key"
            type="button"
            :class="[PILL_BASE, issueTypeFilter === key ? PILL_ON : PILL_OFF]"
            :aria-pressed="issueTypeFilter === key"
            @click="issueTypeFilter = key"
          >
            {{ ISSUE_TYPES[key].label }}
          </button>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between gap-3 border-t border-silver-200 pt-3 text-[12px]">
      <span class="text-ink-500">
        Encontrados <strong class="text-ink-900">{{ meta.total }}</strong> de {{ metrics.total }} reportes
      </span>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="inline-flex items-center gap-1 font-bold text-accent-600 hover:text-accent-700 hover:underline"
        @click="resetFilters"
      >
        <v-icon icon="mdi-filter-remove-outline" size="15" />
        Limpiar filtros
      </button>
    </div>
  </section>
</template>
