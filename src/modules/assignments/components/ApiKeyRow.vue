<script setup lang="ts">
import type { LedSystem } from '../services/apiKeys.service'

defineProps<{ system: LedSystem; visible: boolean; copied: boolean; rotating: boolean }>()
defineEmits<{ toggle: []; copy: []; rotate: [] }>()

const mask = (key: string) => (key.length > 12 ? `${key.slice(0, 7)}${'•'.repeat(14)}${key.slice(-4)}` : '•'.repeat(key.length))
</script>

<template>
  <div class="mt-2 flex items-center gap-1 border-t border-silver-200 pt-2">
    <v-icon icon="mdi-key-outline" size="14" class="shrink-0 text-ink-500" />
    <code
      class="min-w-0 flex-1 truncate rounded-md border border-silver-200 bg-silver-50 px-2 py-1 font-mono text-[11px] text-ink-800"
      :title="visible ? system.apiKey : 'API key oculta'"
    >
      {{ visible ? system.apiKey : mask(system.apiKey) }}
    </code>
    <button
      type="button"
      class="grid size-7 shrink-0 place-items-center rounded-md text-ink-500 transition-colors hover:bg-silver-100 hover:text-ink-900"
      :aria-label="visible ? 'Ocultar API key' : 'Mostrar API key'"
      @click="$emit('toggle')"
    >
      <v-icon :icon="visible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="16" />
    </button>
    <button
      type="button"
      class="grid size-7 shrink-0 place-items-center rounded-md transition-colors hover:bg-silver-100"
      :class="copied ? 'text-emerald-600' : 'text-ink-500 hover:text-ink-900'"
      aria-label="Copiar API key"
      title="Copiar"
      @click="$emit('copy')"
    >
      <v-icon :icon="copied ? 'mdi-check' : 'mdi-content-copy'" size="16" />
    </button>
    <button
      type="button"
      class="grid size-7 shrink-0 place-items-center rounded-md text-ink-500 transition-colors hover:bg-silver-100 hover:text-ink-900 disabled:opacity-40"
      aria-label="Generar nueva API key"
      title="Generar nueva"
      :disabled="rotating"
      @click="$emit('rotate')"
    >
      <v-icon icon="mdi-autorenew" size="16" :class="{ 'animate-spin': rotating }" />
    </button>
  </div>
</template>
