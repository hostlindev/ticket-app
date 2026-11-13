<script setup lang="ts">
import type { Developer, SystemAssignment } from '../interface/assignment.interface'
import { avatarTone, initials } from '../config/assignments.config'

defineProps<{
  system: SystemAssignment
  busy?: boolean
}>()

const emit = defineEmits<{
  manage: [system: SystemAssignment]
  remove: [system: SystemAssignment, developer: Developer]
}>()
</script>

<template>
  <article
    class="console-card flex min-w-0 flex-col border-l-4 p-4 sm:p-5"
    :class="system.developers.length ? 'border-l-accent-500' : 'border-l-amber-500'"
  >
    <header class="flex items-start gap-3">
      <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-100 text-accent-700">
        <v-icon icon="mdi-application-outline" size="22" />
      </span>
      <div class="min-w-0 flex-1">
        <h3 class="m-0 truncate text-[15px] font-bold leading-tight text-ink-900">{{ system.name }}</h3>
        <p class="m-0 mt-0.5 flex items-center gap-1 truncate text-[12px] text-ink-500">
          <v-icon icon="mdi-web" size="13" class="shrink-0" />
          <span class="truncate">{{ system.domain }}</span>
        </p>
      </div>
      <span
        class="shrink-0 rounded-lg border px-2 py-0.5 text-[11px] font-bold"
        :class="
          system.developers.length
            ? 'border-accent-200 bg-accent-50 text-accent-700'
            : 'border-amber-200 bg-amber-50 text-amber-800'
        "
      >
        {{ system.developers.length ? `${system.developers.length} dev` : 'Sin equipo' }}
      </span>
    </header>

    <div class="mt-4 flex-1">
      <ul v-if="system.developers.length" class="m-0 flex list-none flex-wrap gap-2 p-0">
        <li
          v-for="dev in system.developers"
          :key="dev.id"
          class="flex min-w-0 max-w-full items-center gap-2 rounded-full border border-silver-200 bg-silver-50 py-1 pl-1 pr-1.5"
        >
          <v-avatar size="24" :class="avatarTone(dev.id)" class="text-[10px] font-bold text-white">
            {{ initials(dev.name) }}
          </v-avatar>
          <span class="min-w-0 truncate text-[12.5px] font-semibold text-ink-800">{{ dev.name }}</span>
          <button
            type="button"
            class="grid size-5 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-40"
            :aria-label="`Quitar a ${dev.name} de ${system.name}`"
            :disabled="busy"
            @click="emit('remove', system, dev)"
          >
            <v-icon icon="mdi-close" size="13" />
          </button>
        </li>
      </ul>

      <div
        v-else
        class="flex items-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-3 py-3 text-[12.5px] text-amber-900"
      >
        <v-icon icon="mdi-account-alert-outline" size="18" />
        Nadie atiende los reportes de este sistema todavía.
      </div>
    </div>

    <v-btn
      :variant="system.developers.length ? 'tonal' : 'flat'"
      color="primary"
      block
      class="mt-4 rounded-lg font-bold"
      :prepend-icon="system.developers.length ? 'mdi-account-multiple-plus-outline' : 'mdi-account-plus-outline'"
      :disabled="busy"
      @click="emit('manage', system)"
    >
      {{ system.developers.length ? 'Gestionar equipo' : 'Asignar desarrolladores' }}
    </v-btn>
  </article>
</template>
