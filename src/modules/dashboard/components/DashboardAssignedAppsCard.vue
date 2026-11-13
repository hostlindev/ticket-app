<script setup lang="ts">
import { useDashboard } from '../composables/useDashboard'

const { userMetrics } = useDashboard()
</script>

<template>
  <div class="console-card flex flex-col justify-between p-6 border-l-4 border-l-accent-500">
    <div>
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold uppercase tracking-wider text-ink-500">
          Tus Apps Web a Cargo
        </span>
        <span
          class="rounded-full border border-accent-400 bg-accent-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs"
        >
          {{ userMetrics.assignedSystemsCount }} supervisadas
        </span>
      </div>

      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-3xl font-extrabold tracking-tight text-accent-600">
          {{ userMetrics.assignedSystemsCount }}
        </span>
        <span class="text-[13px] font-medium text-ink-500">aplicaciones bajo tu guardia</span>
      </div>

      <ul class="mt-3 space-y-1.5">
        <li
          v-for="sys in userMetrics.assignedSystems"
          :key="sys"
          class="flex items-center gap-2 text-[12px] font-semibold text-ink-700"
        >
          <v-icon icon="mdi-web" size="13" class="text-accent-600" />
          <span class="truncate">{{ sys }}</span>
        </li>
      </ul>
    </div>

    <div class="mt-4 border-t border-silver-200 pt-2.5 text-[11.5px] font-bold text-accent-700">
      Monitoreo en vivo activo
    </div>
  </div>
</template>
