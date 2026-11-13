<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useDashboard } from '../composables/useDashboard'
import { HEALTH_META, SEVERITIES, SEVERITY_META } from '../config/dashboard.config'

const { pieSlices, activeSliceId, setActiveSliceId } = useDashboard()

function toggle(id: string) {
  setActiveSliceId(activeSliceId.value === id ? null : id)
}
</script>

<template>
  <div class="console-card flex flex-col justify-between p-5 sm:p-6">
    <div class="min-h-0">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-lg font-bold text-ink-900">Aplicaciones Web Monitoreadas</h3>
          <p class="text-[12px] text-ink-500">
            Desglose por severidad y responsable de cada aplicación.
          </p>
        </div>

        <RouterLink
          to="/tickets"
          class="hidden shrink-0 items-center gap-1 text-[12px] font-bold text-accent-600 hover:underline sm:inline-flex"
        >
          <span>Ver tickets</span>
          <v-icon icon="mdi-arrow-right" size="14" />
        </RouterLink>
      </div>

      <p v-if="!pieSlices.length" class="mt-4 rounded-xl border border-dashed border-silver-300 p-6 text-center text-[12.5px] text-ink-500">
        No hay aplicaciones para mostrar.
      </p>

      <div v-else class="mt-4 max-h-[34rem] space-y-2.5 overflow-y-auto pr-0.5">
        <div
          v-for="slice in pieSlices"
          :key="slice.id"
          class="cursor-pointer rounded-xl border p-3 transition-all"
          :class="
            activeSliceId === slice.id
              ? 'border-accent-400 bg-accent-50/60 shadow-xs'
              : 'border-silver-200 bg-silver-50/50 hover:border-silver-300 hover:bg-white'
          "
          tabindex="0"
          @mouseenter="setActiveSliceId(slice.id)"
          @mouseleave="setActiveSliceId(null)"
          @focus="setActiveSliceId(slice.id)"
          @blur="setActiveSliceId(null)"
          @click="toggle(slice.id)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-start gap-2.5">
              <span
                class="mt-1 size-3.5 shrink-0 rounded-full border border-white shadow-xs"
                :style="{ backgroundColor: slice.color }"
              />
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span class="truncate text-[13px] font-bold text-ink-900">{{ slice.name }}</span>
                  <span
                    v-if="slice.assigned"
                    class="rounded border border-accent-200 bg-accent-100 px-1.5 py-px text-[9.5px] font-bold text-accent-700"
                  >
                    A tu cargo
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-x-2 text-[11px] text-ink-500">
                  <span class="truncate font-mono">{{ slice.domain }}</span>
                  <span class="inline-flex items-center gap-1 font-semibold" :class="HEALTH_META[slice.health].text">
                    <span class="size-1.5 rounded-full" :class="HEALTH_META[slice.health].dot" />
                    {{ HEALTH_META[slice.health].label }}
                  </span>
                </div>
              </div>
            </div>

            <div class="shrink-0 text-right">
              <span class="text-sm font-extrabold tabular-nums text-ink-900">{{ slice.count }}</span>
              <span
                class="ml-1.5 inline-block rounded-md px-1.5 py-0.5 text-[10.5px] font-bold text-white"
                :style="{ backgroundColor: slice.color }"
              >
                {{ slice.percentage }}%
              </span>
            </div>
          </div>

          <!-- Barra de severidad -->
          <div v-if="slice.count" class="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-silver-100">
            <div
              v-for="sev in SEVERITIES"
              :key="sev"
              :class="SEVERITY_META[sev].bar"
              :style="{ width: `${(slice.severity[sev] / slice.count) * 100}%` }"
            />
          </div>

          <div class="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-silver-200/80 pt-2 text-[11px] text-ink-500">
            <span class="font-semibold text-ink-600">Prioridad:</span>
            <template v-for="(sev, i) in SEVERITIES" :key="sev">
              <span v-if="i" class="hidden min-[400px]:inline">·</span>
              <span class="font-bold" :class="SEVERITY_META[sev].text">{{ sev }}: {{ slice.severity[sev] }}</span>
            </template>
            <span class="w-full truncate font-medium text-ink-500 sm:ml-auto sm:w-auto">Lead: {{ slice.lead }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-3 rounded-xl border border-accent-200 bg-accent-50/70 p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <p class="text-[12.5px] font-bold text-ink-900">¿Revisar incidencias reportadas en producción?</p>
        <p class="text-[11.5px] text-ink-500">
          Accede a la cola filtrada por aplicación web o usuario final.
        </p>
      </div>

      <RouterLink
        to="/tickets"
        class="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-accent-600/25 transition-all hover:bg-accent-700"
      >
        <v-icon icon="mdi-alert-octagon-outline" size="14" />
        <span>Ver Incidencias Web</span>
      </RouterLink>
    </div>
  </div>
</template>
