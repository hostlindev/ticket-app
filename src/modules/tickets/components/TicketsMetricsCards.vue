<script setup lang="ts">
import { computed } from 'vue'
import { useTickets } from '../composables/useTickets'

const { metrics } = useTickets()

const cards = computed(() => [
  {
    key: 'total',
    icon: 'mdi-ticket-outline',
    label: 'Total reportes',
    hint: 'Enviados por usuarios',
    value: metrics.value.total,
    accent: 'border-l-accent-500',
    label_tone: 'text-ink-500',
    value_tone: 'text-ink-900',
    icon_tone: 'bg-accent-100 text-accent-700',
  },
  {
    key: 'p1',
    icon: 'mdi-alert-octagon-outline',
    label: 'P1 críticas',
    hint: 'Bloquean al usuario',
    value: metrics.value.criticalP1,
    accent: 'border-l-red-500',
    label_tone: 'text-red-700',
    value_tone: 'text-red-600',
    icon_tone: 'bg-red-50 text-red-700',
  },
  {
    key: 'pending',
    icon: 'mdi-help-circle-outline',
    label: 'Por clasificar',
    hint: 'Esperando prioridad',
    value: metrics.value.pending,
    accent: 'border-l-silver-400',
    label_tone: 'text-ink-600',
    value_tone: 'text-ink-700',
    icon_tone: 'bg-silver-100 text-ink-600',
  },
  {
    key: 'progress',
    icon: 'mdi-progress-wrench',
    label: 'En análisis',
    hint: 'Abiertas o en progreso',
    value: metrics.value.inProgress,
    accent: 'border-l-amber-500',
    label_tone: 'text-amber-800',
    value_tone: 'text-amber-700',
    icon_tone: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'resolved',
    icon: 'mdi-check-circle-outline',
    label: 'Resueltas',
    hint: 'Verificadas y cerradas',
    value: metrics.value.resolved,
    accent: 'border-l-emerald-500',
    label_tone: 'text-emerald-800',
    value_tone: 'text-emerald-700',
    icon_tone: 'bg-emerald-50 text-emerald-700',
  },
])
</script>

<template>
  <section class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
    <div
      v-for="card in cards"
      :key="card.key"
      class="console-card min-w-0 border-l-4 p-3.5 last:col-span-2 sm:p-4 lg:last:col-span-1"
      :class="card.accent"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="truncate text-[10.5px] font-bold uppercase tracking-wider sm:text-[11px]" :class="card.label_tone">
          {{ card.label }}
        </span>
        <span class="grid size-7 shrink-0 place-items-center rounded-lg" :class="card.icon_tone">
          <v-icon :icon="card.icon" size="16" />
        </span>
      </div>
      <p class="mt-2 text-2xl font-extrabold tabular-nums tracking-tight sm:text-3xl" :class="card.value_tone">
        {{ card.value }}
      </p>
      <span class="mt-0.5 block truncate text-[11px] text-ink-500 sm:text-[11.5px]">{{ card.hint }}</span>
    </div>
  </section>
</template>
