<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useDashboard } from '../composables/useDashboard'

const { userMetrics } = useDashboard()
</script>

<template>
  <div class="console-card flex flex-col justify-between p-6">
    <div>
      <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span class="text-[11px] font-bold uppercase tracking-wider text-ink-500">
          Incidencias de Usuarios Asignadas
        </span>
        <span
          v-if="userMetrics.assignedCriticalCount > 0"
          class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase leading-5 tracking-wide text-red-700 sm:text-[11px]"
        >
          <span class="size-1.5 rounded-full bg-red-500" aria-hidden="true" />
          <span class="tabular-nums">{{ userMetrics.assignedCriticalCount }}</span>
          <span>P1 Críticas</span>
        </span>
      </div>

      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-3xl font-extrabold tracking-tight text-ink-900">
          {{ userMetrics.assignedIncidentsCount }}
        </span>
        <span class="text-[13px] font-medium text-ink-500">tickets en tu cola de triage</span>
      </div>

      <p class="mt-2 text-[12.5px] leading-relaxed text-ink-500">
        Analiza las excepciones, logs y usuarios afectados desde la opción <strong>Incidencias Web</strong> en el menú lateral.
      </p>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-silver-200 pt-2.5">
      <span class="text-[11.5px] text-ink-500">SLA: <strong class="text-emerald-700">{{ userMetrics.slaCompliance }}</strong></span>
      <RouterLink
        to="/tickets"
        class="text-[12px] font-bold text-accent-600 hover:text-accent-700 hover:underline"
      >
        Ver tickets de usuarios →
      </RouterLink>
    </div>
  </div>
</template>
