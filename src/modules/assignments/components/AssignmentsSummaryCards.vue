<script setup lang="ts">
import { computed } from 'vue'
import { useAssignments } from '../composables/useAssignments'

const { summary } = useAssignments()

const cards = computed(() => [
  {
    key: 'systems',
    icon: 'mdi-application-outline',
    label: 'Sistemas',
    hint: 'Registrados en el panel',
    value: summary.value.systems,
    accent: 'border-l-accent-500',
    label_tone: 'text-ink-500',
    value_tone: 'text-ink-900',
    icon_tone: 'bg-accent-100 text-accent-700',
  },
  {
    key: 'covered',
    icon: 'mdi-account-check-outline',
    label: 'Con equipo',
    hint: 'Tienen responsables',
    value: summary.value.covered,
    accent: 'border-l-emerald-500',
    label_tone: 'text-emerald-800',
    value_tone: 'text-emerald-700',
    icon_tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    key: 'unassigned',
    icon: 'mdi-account-alert-outline',
    label: 'Sin desarrolladores',
    hint: 'Nadie atiende sus reportes',
    value: summary.value.unassigned,
    accent: 'border-l-amber-500',
    label_tone: 'text-amber-800',
    value_tone: 'text-amber-700',
    icon_tone: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'devs',
    icon: 'mdi-account-group-outline',
    label: 'Desarrolladores',
    hint: 'Disponibles para asignar',
    value: summary.value.developers,
    accent: 'border-l-silver-400',
    label_tone: 'text-ink-600',
    value_tone: 'text-ink-700',
    icon_tone: 'bg-silver-100 text-ink-600',
  },
])
</script>

<template>
  <section class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    <div
      v-for="card in cards"
      :key="card.key"
      class="console-card min-w-0 border-l-4 p-3.5 sm:p-4"
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
