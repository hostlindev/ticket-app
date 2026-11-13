<script setup lang="ts">
import { computed } from 'vue'
import { useDashboard } from '../composables/useDashboard'

const { totals, userMetrics } = useDashboard()

const kpis = computed(() => [
  { key: 'apps', icon: 'mdi-web', label: 'Apps monitoreadas', value: totals.value.apps, tone: 'text-accent-600' },
  { key: 'total', icon: 'mdi-ticket-outline', label: 'Incidencias totales', value: totals.value.total, tone: 'text-ink-900' },
  { key: 'active', icon: 'mdi-alert-circle-outline', label: 'Activas', value: totals.value.active, tone: 'text-amber-700' },
  { key: 'resolved', icon: 'mdi-check-circle-outline', label: 'Resueltas', value: totals.value.resolved, tone: 'text-emerald-700' },
  { key: 'mttr', icon: 'mdi-timer-outline', label: 'MTTR', value: userMetrics.value.mttrHours, tone: 'text-ink-900' },
  { key: 'sla', icon: 'mdi-shield-check-outline', label: 'Cumplimiento SLA', value: userMetrics.value.slaCompliance, tone: 'text-emerald-700' },
])
</script>

<template>
  <section class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
    <div v-for="kpi in kpis" :key="kpi.key" class="console-card min-w-0 p-4">
      <div class="flex items-center gap-1.5 text-ink-500">
        <v-icon :icon="kpi.icon" size="15" />
        <span class="truncate text-[10.5px] font-bold uppercase tracking-wider">{{ kpi.label }}</span>
      </div>
      <p class="mt-2 text-2xl font-extrabold tabular-nums tracking-tight" :class="kpi.tone">
        {{ kpi.value }}
      </p>
    </div>
  </section>
</template>
