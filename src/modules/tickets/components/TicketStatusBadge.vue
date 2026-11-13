<script setup lang="ts">
import { computed } from 'vue'
import type { TicketStatus } from '../interface/ticket.interface'

const props = defineProps<{
  status: TicketStatus
}>()

interface StatusStyle {
  label: string
  bg: string
  text: string
  border: string
  icon: string
}

const statusConfig = computed<StatusStyle>(() => {
  switch (props.status) {
    case 'open':
      return {
        label: 'Abierto',
        bg: 'bg-red-500/10',
        text: 'text-red-700',
        border: 'border-red-500/40',
        icon: 'mdi-alert-circle-outline',
      }
    case 'in_progress':
      return {
        label: 'En progreso',
        bg: 'bg-amber-500/10',
        text: 'text-amber-800',
        border: 'border-amber-500/40',
        icon: 'mdi-progress-wrench',
      }
    case 'in_review':
      return {
        label: 'En revisión',
        bg: 'bg-accent-100',
        text: 'text-accent-700',
        border: 'border-accent-300',
        icon: 'mdi-eye-check-outline',
      }
    case 'resolved':
      return {
        label: 'Resuelto',
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-800',
        border: 'border-emerald-600/40',
        icon: 'mdi-check-circle-outline',
      }
    case 'closed':
    default:
      return {
        label: 'Cerrado',
        bg: 'bg-silver-200',
        text: 'text-ink-500',
        border: 'border-ink-900/20',
        icon: 'mdi-lock-outline',
      }
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-0.5 text-[11.5px] font-bold"
    :class="[statusConfig.bg, statusConfig.text, statusConfig.border]"
  >
    <v-icon :icon="statusConfig.icon" size="13" />
    <span>{{ statusConfig.label }}</span>
  </span>
</template>
