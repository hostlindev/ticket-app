<script setup lang="ts">
import { useDashboard } from '../composables/useDashboard'
import { SEVERITY_META } from '../config/dashboard.config'

const { priorityStats, totals } = useDashboard()
</script>

<template>
  <section>
    <div class="mb-3.5 flex flex-wrap items-end justify-between gap-2">
      <div class="min-w-0">
        <h3 class="text-lg font-bold text-ink-900">Incidencias por Prioridad</h3>
        <p class="text-[12.5px] text-ink-500">
          Incidencias activas de todas las apps web, por criticidad de impacto.
        </p>
      </div>

      <span
        class="rounded-lg border border-silver-300 bg-white px-3 py-1 text-[12px] font-bold text-ink-700 shadow-xs"
      >
        Total activas: {{ totals.active }}
      </span>
    </div>

    <div class="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      <div
        v-for="stat in priorityStats"
        :key="stat.severity"
        class="console-card rounded-xl border-l-4 p-4 sm:p-5"
        :class="SEVERITY_META[stat.severity].card"
      >
        <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span
            class="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
            :class="SEVERITY_META[stat.severity].badge"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="[SEVERITY_META[stat.severity].dot, { 'animate-pulse': stat.severity === 'P1' && stat.count > 0 }]"
            />
            {{ stat.severity }} · {{ SEVERITY_META[stat.severity].title }}
          </span>
          <span class="text-[11px] font-semibold" :class="SEVERITY_META[stat.severity].text">
            {{ SEVERITY_META[stat.severity].sla }}
          </span>
        </div>

        <div class="mt-3 flex items-end justify-between gap-2">
          <p class="text-3xl font-extrabold tabular-nums tracking-tight" :class="SEVERITY_META[stat.severity].value">
            {{ stat.count }}
          </p>
          <span class="pb-1 text-[12px] font-bold text-ink-500">{{ stat.percentage }}%</span>
        </div>
        <p class="mt-1 text-[13px] font-medium text-ink-600">{{ SEVERITY_META[stat.severity].hint }}</p>

        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-silver-100">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="SEVERITY_META[stat.severity].bar"
            :style="{ width: `${stat.percentage}%` }"
          />
        </div>
      </div>
    </div>
  </section>
</template>
