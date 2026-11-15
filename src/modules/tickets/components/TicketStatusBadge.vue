<script setup lang="ts">
import { computed } from 'vue'
import { normalizeStatus, type TicketStatus } from '../interface/ticket.interface'

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
  switch (normalizeStatus(props.status)) {
    case 'open':
      return {
        label: 'Abierto',
        bg: 'bg-red-500/10',
        text: 'text-red-700',
        border: 'border-red-500/40',
        icon: 'mdi-alert-circle-outline',
      }
    case 'in_review':
      return {
        label: 'En revisión',
        bg: 'bg-amber-400/20',
        text: 'text-amber-900',
        border: 'border-amber-500/60',
        icon: 'mdi-eye-check-outline',
      }
    case 'resolved':
    default:
      return {
        label: 'Resuelto',
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-800',
        border: 'border-emerald-600/40',
        icon: 'mdi-check-circle-outline',
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
