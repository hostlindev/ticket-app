<script setup lang="ts">
import { computed } from 'vue'
import type { Ticket, TicketSeverity } from '../interface/ticket.interface'
import { ISSUE_TYPES } from '../config/ticket.config'
import { formatRelativeTime } from '@core/utils/formatters'
import TicketSeverityBadge from './TicketSeverityBadge.vue'
import TicketStatusBadge from './TicketStatusBadge.vue'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  select: [ticket: Ticket]
}>()

const SEVERITY_BORDER: Record<TicketSeverity, string> = {
  P1: 'border-l-red-500',
  P2: 'border-l-amber-500',
  P3: 'border-l-accent-500',
  P4: 'border-l-silver-400',
}

const issue = computed(() => ISSUE_TYPES[props.ticket.issueType])
const created = computed(() => formatRelativeTime(props.ticket.createdAt))
const borderClass = computed(() => (props.ticket.severity ? SEVERITY_BORDER[props.ticket.severity] : 'border-l-silver-300'))
const slaUrgent = computed(() => (props.ticket.slaMinutesRemaining ?? 0) <= 60)
</script>

<template>
  <article
    class="console-card-interactive group flex flex-col gap-3 border-l-4 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 sm:p-5"
    :class="borderClass"
    role="button"
    tabindex="0"
    :aria-label="`${ticket.id}: ${issue.label}`"
    @click="emit('select', ticket)"
    @keydown.enter="emit('select', ticket)"
    @keydown.space.prevent="emit('select', ticket)"
  >
    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span class="rounded border border-silver-300 bg-silver-100 px-2 py-0.5 font-mono text-[11.5px] font-bold text-ink-800">
            {{ ticket.id }}
          </span>
          <TicketSeverityBadge :severity="ticket.severity" />
          <TicketStatusBadge :status="ticket.status" />
          <span
            class="inline-flex max-w-full items-center gap-1 truncate rounded border px-2 py-0.5 text-[11px] font-bold"
            :class="issue.chip"
          >
            <v-icon :icon="issue.icon" size="13" />
            {{ issue.label }}
          </span>
        </div>

        <p class="mt-2.5 line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink-900 transition-colors group-hover:text-accent-600 sm:text-[15px]">
          “{{ ticket.description }}”
        </p>

        <div class="mt-2.5 flex flex-col gap-1.5 text-[12px] text-ink-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
          <div class="flex min-w-0 items-center gap-1.5">
            <v-icon icon="mdi-account-circle-outline" size="14" class="shrink-0 text-ink-400" />
            <span class="min-w-0 truncate"><strong class="text-ink-800">{{ ticket.reporter.name }}</strong></span>
          </div>

          <div class="flex min-w-0 items-center gap-1.5 text-accent-700">
            <v-icon icon="mdi-web" size="14" class="shrink-0" />
            <span class="min-w-0 truncate font-semibold">{{ ticket.system }}</span>
          </div>

          <div v-if="ticket.screenshotUrl" class="flex items-center gap-1 text-[11.5px] text-ink-500">
            <v-icon icon="mdi-paperclip" size="14" />
            <span>Con captura</span>
          </div>
        </div>
      </div>

      <!-- SLA, responsable y acción -->
      <div
        class="grid grid-cols-2 items-center gap-x-4 gap-y-2 border-t border-silver-200 pt-3 lg:flex lg:w-44 lg:shrink-0 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0"
      >
        <div
          v-if="ticket.slaMinutesRemaining === null"
          class="inline-flex items-center gap-1.5 justify-self-start rounded-full border border-dashed border-silver-400 px-2.5 py-0.5 text-[11.5px] font-bold text-ink-500"
        >
          <v-icon icon="mdi-timer-sand" size="14" />
          <span>Sin SLA aún</span>
        </div>
        <div
          v-else-if="ticket.slaMinutesRemaining > 0"
          class="inline-flex items-center gap-1.5 justify-self-start rounded-full border px-2.5 py-0.5 text-[12px] font-bold"
          :class="slaUrgent ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'"
        >
          <v-icon icon="mdi-clock-outline" size="14" />
          <span>{{ ticket.slaMinutesRemaining }}m SLA</span>
        </div>
        <div
          v-else
          class="inline-flex items-center gap-1.5 justify-self-start rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[12px] font-bold text-emerald-700"
        >
          <v-icon icon="mdi-check" size="14" />
          <span>SLA Ok</span>
        </div>

        <div class="min-w-0 justify-self-end text-right text-[11.5px] text-ink-500 lg:justify-self-auto">
          <span class="block truncate">
            <span class="hidden sm:inline">Asignado: </span><strong class="text-ink-900">{{ ticket.assignee ? ticket.assignee.name : 'Sin asignar' }}</strong>
          </span>
          <span class="block text-[11px]">{{ created }}</span>
        </div>

        <v-btn
          variant="text"
          size="small"
          append-icon="mdi-chevron-right"
          class="col-span-2 justify-self-end font-bold text-accent-600 lg:col-span-1"
          @click.stop="emit('select', ticket)"
        >
          Ver reporte
        </v-btn>
      </div>
    </div>
  </article>
</template>
