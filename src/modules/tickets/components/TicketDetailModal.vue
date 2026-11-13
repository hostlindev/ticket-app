<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import type { Ticket, TicketStatus } from '../interface/ticket.interface'
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

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Abierto',
  in_progress: 'En progreso',
  in_review: 'En revisión',
  resolved: 'Resuelto',
  closed: 'Cerrado',
}

async function handleStatusChange(status: TicketStatus): Promise<void> {
  if (!props.ticket) return
  await store.changeStatus(props.ticket.id, status)
  toast.success(`Estado actualizado a: ${STATUS_LABELS[status]}`)
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

        <p v-if="ticket.severity === null" class="mt-2 text-[12px] text-ink-500">
          La prioridad (P1–P4) la asigna el sistema automáticamente; este reporte aún no ha sido clasificado.
        </p>

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
          </dl>
        </section>

        <!-- Gestión del estado -->
        <section class="mt-5 grid grid-cols-2 items-center gap-2 rounded-xl border border-silver-200 bg-silver-50 p-2.5 sm:flex sm:flex-wrap">
          <span class="col-span-2 mr-2 text-[11.5px] font-bold uppercase tracking-wider text-ink-500">Estado del reporte:</span>
          <v-btn
            size="small"
            variant="flat"
            density="comfortable"
            :color="ticket.status === 'in_progress' ? 'primary' : undefined"
            class="rounded-lg text-[12px] font-bold shadow-xs"
            @click="handleStatusChange('in_progress')"
          >
            En progreso
          </v-btn>
          <v-btn
            size="small"
            variant="flat"
            density="comfortable"
            :color="ticket.status === 'in_review' ? 'primary' : undefined"
            class="rounded-lg text-[12px] font-bold shadow-xs"
            @click="handleStatusChange('in_review')"
          >
            En revisión
          </v-btn>
          <v-btn size="small" variant="flat" density="comfortable" color="success" class="rounded-lg text-[12px] font-bold shadow-xs" @click="handleStatusChange('resolved')">
            Resolver
          </v-btn>
          <v-btn size="small" variant="text" density="comfortable" class="rounded-lg text-[12px] font-bold text-ink-500" @click="handleStatusChange('closed')">
            Cerrar
          </v-btn>
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
