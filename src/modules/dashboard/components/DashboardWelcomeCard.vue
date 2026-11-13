<script setup lang="ts">
import { computed } from 'vue'
import PixelBuddy from '@core/components/PixelBuddy.vue'
import { useDashboard } from '../composables/useDashboard'

const { user, firstName, roleLabel, userMetrics } = useDashboard()

const department = computed(() => user.value?.department ?? 'Frontend & Web Platforms')
</script>

<template>
  <div class="console-card flex flex-col justify-between p-5 sm:p-6">
    <div class="flex items-start gap-3.5 sm:gap-4">
      <PixelBuddy :size="64" bob class="shrink-0" />
      <div class="min-w-0 flex-1">
        <!-- Chip de departamento con mejoras en diseño y responsive -->
        <span
          class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent-200 bg-accent-100/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-700 shadow-2xs transition-colors hover:bg-accent-100 sm:px-3 sm:text-[11px]"
          :title="department"
        >
          <span class="relative flex h-2 w-2 shrink-0">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-accent-600" />
          </span>
          <span class="truncate">
            {{ department }}
          </span>
        </span>

        <h2 class="mt-2 text-xl font-bold text-ink-900 sm:text-2xl">
          Bienvenido, {{ firstName }}
        </h2>
        <p class="mt-1 text-[13px] leading-relaxed text-ink-500">
          Tienes <strong>{{ userMetrics.assignedIncidentsCount }} incidencias reportadas</strong> por usuarios en tus <strong>{{ userMetrics.assignedSystemsCount }} aplicaciones web a cargo</strong>.
        </p>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-silver-200 pt-3 text-[12px] text-ink-500">
      <span class="truncate">{{ user?.email }}</span>
      <span class="shrink-0 rounded bg-accent-100 px-2 py-0.5 text-[11px] font-bold text-accent-700 border border-accent-200">
        Soporte: {{ roleLabel }}
      </span>
    </div>
  </div>
</template>
