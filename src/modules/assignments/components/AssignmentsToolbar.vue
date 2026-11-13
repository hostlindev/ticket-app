<script setup lang="ts">
import { computed } from 'vue'
import { useAssignments } from '../composables/useAssignments'
import { FILTER_OPTIONS } from '../config/assignments.config'

const { search, filter, filteredSystems, systems, resetFilters } = useAssignments()

const hasActiveFilters = computed(() => search.value.trim() !== '' || filter.value !== 'all')

const PILL_BASE =
  'shrink-0 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70'
const PILL_ON = 'border-accent-600 bg-accent-600 font-bold text-white shadow-[2px_2px_0_0_var(--shadow-accent)]'
const PILL_OFF =
  'border-silver-200 bg-silver-50 text-ink-700 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700'
</script>

<template>
  <section class="console-card p-4 sm:p-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-center">
      <v-text-field
        v-model="search"
        placeholder="Buscar sistema, dominio o desarrollador..."
        density="compact"
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
        class="min-w-0 flex-1"
      />

      <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:overflow-visible md:p-0" role="group" aria-label="Filtrar sistemas">
        <button
          v-for="option in FILTER_OPTIONS"
          :key="option.value"
          type="button"
          :class="[PILL_BASE, filter === option.value ? PILL_ON : PILL_OFF]"
          :aria-pressed="filter === option.value"
          @click="filter = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between gap-3 border-t border-silver-200 pt-3 text-[12px]">
      <span class="text-ink-500">
        Mostrando <strong class="text-ink-900">{{ filteredSystems.length }}</strong> de {{ systems.length }} sistemas
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
