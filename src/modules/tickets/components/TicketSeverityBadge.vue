<script setup lang="ts">
import { computed } from 'vue'
import type { TicketSeverity } from '../interface/ticket.interface'

const props = defineProps<{
  /** null = aún sin clasificar por el sistema */
  severity: TicketSeverity | null
}>()

interface SeverityStyle {
  label: string
  classes: string
  dot: string
}

const config = computed<SeverityStyle>(() => {
  switch (props.severity) {
    case 'P1':
      return { label: 'P1 · Crítica', classes: 'border-red-600 bg-red-500/15 text-red-700', dot: 'bg-red-500 animate-pulse' }
    case 'P2':
      return { label: 'P2 · Alta', classes: 'border-amber-600 bg-amber-500/15 text-amber-800', dot: 'bg-amber-500' }
    case 'P3':
      return { label: 'P3 · Media', classes: 'border-accent-600 bg-accent-100 text-accent-700', dot: 'bg-accent-500' }
    case 'P4':
      return { label: 'P4 · Baja', classes: 'border-ink-900/30 bg-silver-200 text-ink-700', dot: 'bg-silver-400' }
    default:
      return {
        label: 'Por clasificar',
        classes: 'border-dashed border-silver-400 bg-white text-ink-500',
        dot: 'bg-silver-300',
      }
  }
})
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold" :class="config.classes">
    <span class="size-1.5 rounded-full" :class="config.dot" aria-hidden="true" />
    <span>{{ config.label }}</span>
  </span>
</template>
