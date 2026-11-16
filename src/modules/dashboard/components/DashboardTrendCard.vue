<script setup lang="ts">
import RefreshButton from '@core/components/RefreshButton.vue'
import { computed } from 'vue'
import { useDashboard } from '../composables/useDashboard'

const { trend, trendMax, loading, refreshData } = useDashboard()

const createdTotal = computed(() => trend.value.reduce((acc, p) => acc + p.created, 0))
const resolvedTotal = computed(() => trend.value.reduce((acc, p) => acc + p.resolved, 0))

function height(value: number): string {
  return `${Math.max((value / trendMax.value) * 100, value > 0 ? 6 : 0)}%`
}
</script>

<template>
  <div class="console-card flex flex-col p-5 sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div class="min-w-0">
        <h3 class="text-lg font-bold text-ink-900">Actividad últimos {{ trend.length }} días</h3>
        <p class="text-[12px] text-ink-500">Incidencias creadas vs. resueltas en todas las apps.</p>
      </div>
      <div class="flex items-center gap-3 text-[11px] font-bold text-ink-600">
        <RefreshButton :loading="loading" @click="refreshData" />
        <span class="inline-flex items-center gap-1.5">
          <span class="size-2.5 rounded-sm bg-accent-500" />Creadas {{ createdTotal }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="size-2.5 rounded-sm bg-ink-700" />Resueltas {{ resolvedTotal }}
        </span>
      </div>
    </div>

    <div class="mt-5 flex h-44 items-end gap-1.5 sm:gap-3">
      <div
        v-for="(point, i) in trend"
        :key="i"
        class="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5"
      >
        <div class="flex min-h-0 flex-1 items-end justify-center gap-1">
          <div
            class="w-full max-w-5 rounded-t-md bg-accent-500 transition-all duration-500"
            :style="{ height: height(point.created) }"
            :title="`Creadas: ${point.created}`"
          />
          <div
            class="w-full max-w-5 rounded-t-md bg-ink-700 transition-all duration-500"
            :style="{ height: height(point.resolved) }"
            :title="`Resueltas: ${point.resolved}`"
          />
        </div>
        <div class="flex flex-col items-center leading-tight text-ink-500" :title="point.fullDate">
          <span class="max-w-full truncate text-[10.5px] font-bold capitalize text-ink-700">{{ point.label }}</span>
          <span class="max-w-full truncate text-[10px] font-semibold">{{ point.dayMonth }}</span>
          <span class="max-w-full truncate text-[9.5px]">{{ point.year }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
