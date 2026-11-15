<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { normalizeStatus, type Ticket, type TicketStatus } from '../interface/ticket.interface'
import { ISSUE_TYPES } from '../config/ticket.config'
import { useTicketsStore } from '../store/tickets.store'
import { useToast } from '@core/composables/useToast'
import { formatDateTime, formatRelativeTime } from '@core/utils/formatters'
import TicketSeverityBadge from './TicketSeverityBadge.vue'
import TicketStatusBadge from './TicketStatusBadge.vue'

const props = defineProps<{
  ticket: Ticket | null
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { xs } = useDisplay()
const store = useTicketsStore()
const toast = useToast()
const zoomOpen = ref(false)

const issue = computed(() => (props.ticket ? ISSUE_TYPES[props.ticket.issueType] : null))

const STATUS_LABELS: Record<'open' | 'in_review' | 'resolved', string> = {
  open: 'Abierto',
  in_review: 'En revisión',
  resolved: 'Resuelto',
}

/** Estado vigente (los valores heredados in_progress/closed se reducen a los tres del flujo). */
const currentStatus = computed(() => (props.ticket ? normalizeStatus(props.ticket.status) : null))

/** Pasos del flujo. Cada tarjeta indica qué significa y qué hace al pulsarla. */
const STATUS_STEPS: Array<{
  status: 'open' | 'in_review' | 'resolved'
  title: string
  hint: string
  icon: string
  active: string
  dot: string
}> = [
  {
    status: 'open',
    title: 'Abierto',
    hint: 'Reportado, sin responsable',
    icon: 'mdi-alert-circle-outline',
    active: 'border-red-500/60 bg-red-500/10 text-red-800',
    dot: 'bg-red-500 text-white',
  },
  {
    status: 'in_review',
    title: 'En revisión',
    hint: 'Te la asignas y la atiendes',
    icon: 'mdi-eye-check-outline',
    active: 'border-amber-500/60 bg-amber-400/20 text-amber-900',
    dot: 'bg-amber-500 text-white',
  },
  {
    status: 'resolved',
    title: 'Resuelto',
    hint: 'Terminada y cerrada',
    icon: 'mdi-check-circle-outline',
    active: 'border-emerald-600/50 bg-emerald-500/15 text-emerald-800',
    dot: 'bg-emerald-600 text-white',
  },
]

const STEP_ORDER = ['open', 'in_review', 'resolved'] as const
const currentIndex = computed(() => (currentStatus.value ? STEP_ORDER.indexOf(currentStatus.value) : -1))

async function handleStatusChange(status: TicketStatus): Promise<void> {
  if (!props.ticket || currentStatus.value === status || store.isUpdatingStatus) return
  const saved = await store.changeStatus(props.ticket.id, status)
  if (saved) toast.success(`Estado actualizado a: ${STATUS_LABELS[normalizeStatus(status)]}`)
  else toast.error(store.error ?? 'No pudimos actualizar el estado.')
}

function close(): void {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    :fullscreen="xs"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div
      v-if="ticket && issue"
      class="console-card flex flex-col overflow-hidden border border-silver-300 bg-white shadow-xl"
      :class="xs ? 'h-full rounded-none' : 'max-h-[90vh] rounded-xl'"
    >
      <header
        class="flex shrink-0 items-start justify-between gap-3 border-b border-silver-200 bg-silver-50 px-4 py-3 sm:items-center sm:px-6 sm:py-4"
      >
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <span class="rounded border border-silver-300 bg-white px-2 py-0.5 font-mono text-[12px] font-bold text-ink-900 shadow-xs">
            {{ ticket.id }}
          </span>
          <span class="max-w-full truncate rounded border border-accent-300 bg-accent-100 px-2.5 py-0.5 text-[11px] font-bold text-accent-700">
            {{ ticket.system }}
          </span>
        </div>

        <button
          type="button"
          class="grid size-9 shrink-0 place-items-center rounded-lg border border-silver-300 bg-white text-ink-700 shadow-xs transition-colors hover:bg-silver-100"
          aria-label="Cerrar"
          @click="close"
        >
          <v-icon icon="mdi-close" size="18" />
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        <!-- Clasificación -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-bold" :class="issue.chip">
            <v-icon :icon="issue.icon" size="15" />
            {{ issue.label }}
          </span>
          <TicketSeverityBadge :severity="ticket.severity" />
          <TicketStatusBadge :status="ticket.status" />
        </div>

        <!-- Lo que escribió el usuario -->
        <section class="mt-5">
          <h4 class="text-[11.5px] font-bold uppercase tracking-wider text-ink-500">Lo que reportó el usuario</h4>
          <div
            class="mt-2 rounded-xl border-2 border-silver-300 bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-colors focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-400/30"
          >
            <textarea
              :value="ticket.description"
              readonly
              rows="5"
              aria-label="Descripción escrita por el usuario"
              class="block max-h-72 min-h-28 w-full resize-y rounded-xl bg-transparent p-4 text-[15px] leading-relaxed text-ink-800 outline-none"
            />
            <div class="flex items-center justify-between border-t border-silver-200 px-4 py-1.5 text-[11px] text-ink-500">
              <span class="flex items-center gap-1.5"><v-icon icon="mdi-lock-outline" size="13" />Solo lectura</span>
              <span>{{ ticket.description.length }} caracteres</span>
            </div>
          </div>
        </section>

        <!-- Captura -->
        <section v-if="ticket.screenshotUrl" class="mt-5">
          <h4 class="text-[11.5px] font-bold uppercase tracking-wider text-ink-500">Captura adjunta</h4>
          <button
            type="button"
            class="group relative mt-2 block w-full overflow-hidden rounded-xl border border-silver-300 bg-silver-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70"
            aria-label="Ampliar captura"
            @click="zoomOpen = true"
          >
            <img :src="ticket.screenshotUrl" alt="Captura de pantalla enviada por el usuario" class="max-h-72 w-full object-contain" />
            <span
              class="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-ink-900/80 px-2 py-1 text-[11px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:opacity-100"
            >
              <v-icon icon="mdi-magnify-plus-outline" size="14" />
              Ampliar
            </span>
          </button>
        </section>

        <!-- Datos del reporte -->
        <section class="mt-5">
          <h4 class="text-[11.5px] font-bold uppercase tracking-wider text-ink-500">Datos del reporte</h4>
          <dl class="mt-2 grid gap-2.5 sm:grid-cols-2">
            <div class="rounded-xl border border-silver-200 bg-silver-50 p-3">
              <dt class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
                <v-icon icon="mdi-account-outline" size="14" />Reportado por
              </dt>
              <dd class="m-0 mt-1 text-[13px] font-semibold text-ink-900">{{ ticket.reporter.name }}</dd>
              <dd class="m-0 break-all text-[12px] text-ink-500">{{ ticket.reporter.email }}</dd>
            </div>

            <div class="rounded-xl border border-silver-200 bg-silver-50 p-3">
              <dt class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
                <v-icon icon="mdi-clock-outline" size="14" />Fecha
              </dt>
              <dd class="m-0 mt-1 text-[13px] font-semibold text-ink-900">{{ formatDateTime(ticket.createdAt) }}</dd>
              <dd class="m-0 text-[12px] text-ink-500">{{ formatRelativeTime(ticket.createdAt) }}</dd>
            </div>

            <div class="rounded-xl border border-silver-200 bg-silver-50 p-3">
              <dt class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
                <v-icon icon="mdi-web" size="14" />Sistema
              </dt>
              <dd class="m-0 mt-1 text-[13px] font-semibold text-ink-900">{{ ticket.system }}</dd>
            </div>

            <div class="rounded-xl border border-silver-200 bg-silver-50 p-3">
              <dt class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
                <v-icon icon="mdi-monitor" size="14" />Navegador
              </dt>
              <dd class="m-0 mt-1 text-[13px] font-semibold text-ink-900">{{ ticket.browser }}</dd>
            </div>

            <div class="rounded-xl border border-silver-200 bg-silver-50 p-3">
              <dt class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
                <v-icon icon="mdi-ip-network-outline" size="14" />IP
              </dt>
              <dd class="m-0 mt-1 text-[13px] font-semibold text-ink-900">{{ ticket.ipAddress }}</dd>
            </div>

            <div class="rounded-xl border border-silver-200 bg-silver-50 p-3">
              <dt class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
                <v-icon icon="mdi-account-hard-hat-outline" size="14" />Asignado a
              </dt>
              <dd class="m-0 mt-1 text-[13px] font-semibold text-ink-900">
                {{ ticket.assignee ? ticket.assignee.name : 'Sin asignar' }}
                <span v-if="ticket.assignee?.role" class="font-normal text-ink-500">({{ ticket.assignee.role }})</span>
              </dd>
            </div>
            <div v-if="ticket.resolvedBy" class="rounded-xl border border-silver-200 bg-silver-50 p-3">
              <dt class="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
                <v-icon icon="mdi-check-decagram-outline" size="14" />Resuelto por
              </dt>
              <dd class="m-0 mt-1 text-[13px] font-semibold text-ink-900">
                {{ ticket.resolvedBy.name }}
                <span v-if="ticket.resolvedBy.role" class="font-normal text-ink-500">({{ ticket.resolvedBy.role }})</span>
                <span
                  v-if="ticket.resolvedBy.removed"
                  class="ml-1 rounded-md border border-silver-300 bg-silver-100 px-1.5 py-0.5 text-[10.5px] font-bold text-ink-600"
                >
                  Ya no está en la plataforma
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <!-- Gestión del estado -->
        <section class="mt-5" aria-label="Estado del reporte">
          <h4 class="text-[11.5px] font-bold uppercase tracking-wider text-ink-500">Estado del reporte</h4>
          <ol class="m-0 mt-2 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-3">
            <li v-for="(step, i) in STATUS_STEPS" :key="step.status" class="min-w-0">
              <button
                type="button"
                class="status-step block w-full min-w-0 overflow-hidden rounded-xl border px-3.5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70"
                :class="
                  currentIndex === i
                    ? [step.active, 'pointer-events-none shadow-xs']
                    : 'border-silver-300 bg-white text-ink-700 hover:border-ink-900/30 hover:bg-silver-100'
                "
                :disabled="!ticket"
                :aria-current="currentIndex === i ? 'step' : undefined"
                @click="handleStatusChange(step.status)"
              >
                <span class="flex items-center justify-between gap-2 text-[10.5px] font-bold uppercase tracking-wider opacity-70">
                  <span>Paso {{ i + 1 }}</span>
                  <v-icon :icon="i < currentIndex ? 'mdi-check-circle' : step.icon" size="16" />
                </span>
                <span class="mt-1 block text-[14px] font-bold leading-tight">{{ step.title }}</span>
                <span class="mt-0.5 block text-[11.5px] leading-snug opacity-75">{{ step.hint }}</span>
              </button>
            </li>
          </ol>
        </section>
      </div>

      <footer class="flex shrink-0 justify-end gap-3 border-t border-silver-200 bg-silver-50 px-4 py-3 sm:px-6">
        <v-btn variant="tonal" class="rounded-lg font-bold max-sm:flex-1" @click="close">Cerrar</v-btn>
      </footer>
    </div>
  </v-dialog>

  <!-- Captura ampliada -->
  <v-dialog v-model="zoomOpen" max-width="1100">
    <div v-if="ticket?.screenshotUrl" class="relative overflow-hidden rounded-xl bg-white p-2 shadow-xl">
      <button
        type="button"
        class="absolute right-3 top-3 grid size-9 place-items-center rounded-lg bg-ink-900/80 text-white hover:bg-ink-900"
        aria-label="Cerrar captura"
        @click="zoomOpen = false"
      >
        <v-icon icon="mdi-close" size="18" />
      </button>
      <img :src="ticket.screenshotUrl" alt="Captura de pantalla enviada por el usuario" class="max-h-[85vh] w-full object-contain" />
    </div>
  </v-dialog>
</template>

<style scoped>
.status-step {
  transition:
    background-color 120ms ease-out,
    border-color 120ms ease-out,
    color 120ms ease-out;
}
</style>
