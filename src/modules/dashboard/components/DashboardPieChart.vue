<script setup lang="ts">
import RefreshButton from '@core/components/RefreshButton.vue'
import { useDashboard } from '../composables/useDashboard'

const {
  tabCounts,
  systemTab,
  pieTotal,
  pieSlices,
  activeSliceId,
  activeSlice,
  setSystemTab,
  setActiveSliceId,
  loading,
  refreshData,
} = useDashboard()

function toggle(id: string) {
  setActiveSliceId(activeSliceId.value === id ? null : id)
}
</script>

<template>
  <div class="console-card flex flex-col justify-between p-5 sm:p-6">
    <div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <h3 class="text-lg font-bold text-ink-900">Reparto por app web</h3>
          <p class="text-[12px] text-ink-500">
            {{ systemTab === 'mine' ? 'Incidencias activas asignadas a ti, por aplicación.' : 'Incidencias activas de tus aplicaciones.' }}
          </p>
        </div>

        <div class="flex items-center gap-2 self-start">
        <!-- Tab switcher -->
        <div class="inline-flex self-start rounded-lg border border-silver-200 bg-silver-100 p-0.5">
          <button
            type="button"
            class="rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all"
            :class="systemTab === 'all' ? 'bg-white text-ink-900 font-bold shadow-xs' : 'text-ink-600 hover:text-ink-900'"
            @click="setSystemTab('all')"
          >
            Todas ({{ tabCounts.all }})
          </button>
          <button
            type="button"
            class="rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all"
            :class="systemTab === 'mine' ? 'bg-white text-ink-900 font-bold shadow-xs' : 'text-ink-600 hover:text-ink-900'"
            @click="setSystemTab('mine')"
          >
            A mi cargo ({{ tabCounts.mine }})
          </button>
        </div>
        <RefreshButton :loading="loading" @click="refreshData" />
        </div>
      </div>

      <div class="mt-5 flex flex-col items-center">
        <div class="relative w-full max-w-60 [container-type:inline-size]">
          <svg viewBox="0 0 240 240" class="aspect-square w-full select-none drop-shadow-md" role="img" aria-label="Gráfica de dona de incidencias por app">
            <!-- Anillo base cuando no hay datos -->
            <circle v-if="!pieTotal" cx="120" cy="120" r="85" fill="none" stroke="#e2e8f0" stroke-width="46" />
            <template v-for="slice in pieSlices" :key="slice.id">
              <path
                v-if="slice.pathData"
                :d="slice.pathData"
                :fill="slice.color"
                fill-rule="evenodd"
                stroke="#ffffff"
                stroke-width="2.5"
                stroke-linejoin="round"
                class="cursor-pointer transition-all duration-200"
                :class="{
                  'brightness-110': activeSliceId === slice.id,
                  'opacity-40': activeSliceId !== null && activeSliceId !== slice.id,
                }"
                @mouseenter="setActiveSliceId(slice.id)"
                @mouseleave="setActiveSliceId(null)"
                @click="toggle(slice.id)"
              >
                <title>{{ slice.name }}: {{ slice.count }} incidencias ({{ slice.percentage }}%)</title>
              </path>
            </template>
          </svg>

          <!-- Centro de la dona -->
          <!-- El agujero mide ~52 % del ancho: el texto se limita a ese círculo y escala con el gráfico. -->
          <div class="pointer-events-none absolute inset-0 grid place-items-center">
            <div class="flex w-[40%] flex-col items-center text-center">
              <span class="text-[13cqw] font-extrabold tabular-nums leading-none text-ink-900">
                {{ activeSlice ? activeSlice.count : pieTotal }}
              </span>
              <span
                class="mt-[1.5cqw] line-clamp-2 w-full break-words text-[4.2cqw] font-bold leading-tight text-ink-500"
                :class="activeSlice ? '' : 'uppercase tracking-wide'"
              >
                {{ activeSlice ? activeSlice.name : 'activas' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Alto fijo: si el panel cambiara de tamaño al hacer hover, la lista se movería y el hover parpadearía. -->
        <div class="mt-4 flex h-[4.5rem] w-full flex-col justify-center text-center">
          <div
            v-if="activeSlice"
            class="rounded-xl border border-accent-300 bg-accent-50/70 p-2.5 shadow-xs"
          >
            <div class="flex items-center justify-center gap-2">
              <span class="size-3 shrink-0 rounded-full" :style="{ backgroundColor: activeSlice.color }" />
              <span class="truncate text-[13.5px] font-bold text-ink-900">{{ activeSlice.name }}</span>
            </div>
            <p class="mt-0.5 text-[12px] font-bold text-accent-700">
              {{ activeSlice.count }} incidencias ({{ activeSlice.percentage }}% del total)
            </p>
          </div>
          <div v-else class="rounded-xl border border-silver-200 bg-silver-50 p-2 text-[12px] text-ink-500">
            Toca o pasa el cursor sobre un sector para ver su desglose.
          </div>
        </div>
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between gap-2 border-t border-silver-200 pt-3 text-[12px]">
      <span class="text-ink-500">Total en este corte:</span>
      <span class="text-sm font-extrabold text-ink-900">{{ pieTotal }} activas</span>
    </div>
  </div>
</template>
