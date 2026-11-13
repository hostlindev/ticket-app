<script setup lang="ts">
import { useDashboard } from '../composables/useDashboard'
import { STATUS_META } from '../config/dashboard.config'

const { statusStats, totals } = useDashboard()
</script>

<template>
  <div class="console-card flex flex-col p-5 sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div class="min-w-0">
        <h3 class="text-lg font-bold text-ink-900">Estado de las incidencias</h3>
        <p class="text-[12px] text-ink-500">Distribución del total histórico por etapa de atención.</p>
      </div>
      <span class="text-[12px] font-bold text-ink-700">{{ totals.total }} en total</span>
    </div>

    <!-- Barra apilada -->
    <div class="mt-5 flex h-4 overflow-hidden rounded-full bg-silver-100" role="img" aria-label="Distribución por estado">
      <div
        v-for="stat in statusStats"
        :key="stat.status"
        class="h-full transition-all duration-500"
        :class="STATUS_META[stat.status].bar"
        :style="{ width: `${(stat.count / (totals.total || 1)) * 100}%` }"
        :title="`${STATUS_META[stat.status].label}: ${stat.count}`"
      />
    </div>

    <ul class="m-0 mt-5 grid list-none p-0 grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
      <li
        v-for="stat in statusStats"
        :key="stat.status"
        class="flex items-center justify-between gap-3 rounded-xl border border-silver-200 bg-silver-50/60 px-3 py-2.5"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span class="size-2.5 shrink-0 rounded-full" :class="STATUS_META[stat.status].dot" />
          <span class="truncate text-[12.5px] font-semibold text-ink-700">{{ STATUS_META[stat.status].label }}</span>
        </span>
        <span class="shrink-0 text-right">
          <span class="text-sm font-extrabold tabular-nums text-ink-900">{{ stat.count }}</span>
          <span class="ml-1.5 text-[11px] font-bold text-ink-500">{{ stat.percentage }}%</span>
        </span>
      </li>
    </ul>
  </div>
</template>
