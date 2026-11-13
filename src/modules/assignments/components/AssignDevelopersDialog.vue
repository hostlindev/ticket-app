<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useAssignments } from '../composables/useAssignments'
import type { SystemAssignment } from '../interface/assignment.interface'
import { avatarTone, initials } from '../config/assignments.config'

const props = defineProps<{
  modelValue: boolean
  system: SystemAssignment | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [systemId: string, developerIds: string[]]
}>()

const { xs } = useDisplay()
const { developers, workload, isSaving } = useAssignments()

const selected = ref<string[]>([])
const query = ref('')

// Cada vez que se abre, parte de los desarrolladores actuales del sistema.
watch(
  () => [props.modelValue, props.system?.id] as const,
  ([open]) => {
    if (!open) return
    selected.value = props.system?.developers.map((d) => d.id) ?? []
    query.value = ''
  },
  { immediate: true },
)

const visibleDevelopers = computed(() => {
  const q = query.value?.trim().toLowerCase() ?? ''
  if (!q) return developers.value
  return developers.value.filter((d) => [d.name, d.email, d.specialty].join(' ').toLowerCase().includes(q))
})

const original = computed(() => props.system?.developers.map((d) => d.id) ?? [])
const hasChanges = computed(
  () =>
    selected.value.length !== original.value.length ||
    selected.value.some((id) => !original.value.includes(id)),
)

function toggle(id: string): void {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id]
}

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  if (!props.system) return
  emit('save', props.system.id, selected.value)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    :fullscreen="xs"
    scrollable
    :persistent="isSaving"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div
      v-if="system"
      class="console-card flex flex-col overflow-hidden border border-silver-300 bg-white shadow-xl"
      :class="xs ? 'h-full rounded-none' : 'max-h-[90vh] rounded-xl'"
    >
      <header class="flex items-start gap-3 border-b border-silver-200 p-4 sm:p-5">
        <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-100 text-accent-700">
          <v-icon icon="mdi-account-multiple-plus-outline" size="22" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="m-0 text-[11px] font-bold uppercase tracking-wider text-ink-500">Equipo del sistema</p>
          <h2 class="m-0 truncate text-lg font-bold leading-tight text-ink-900">{{ system.name }}</h2>
          <p class="m-0 truncate text-[12px] text-ink-500">{{ system.domain }}</p>
        </div>
        <button
          type="button"
          class="grid size-9 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-silver-100 hover:text-ink-900"
          aria-label="Cerrar"
          :disabled="isSaving"
          @click="close"
        >
          <v-icon icon="mdi-close" size="18" />
        </button>
      </header>

      <div class="border-b border-silver-200 p-4 sm:px-5">
        <v-text-field
          v-model="query"
          placeholder="Buscar por nombre, correo o especialidad..."
          density="compact"
          prepend-inner-icon="mdi-magnify"
          hide-details
          clearable
        />
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
        <ul v-if="visibleDevelopers.length" class="m-0 list-none space-y-1 p-0">
          <li v-for="dev in visibleDevelopers" :key="dev.id">
            <label
              class="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors"
              :class="
                selected.includes(dev.id)
                  ? 'border-accent-300 bg-accent-50'
                  : 'border-transparent hover:border-silver-200 hover:bg-silver-50'
              "
            >
              <v-checkbox-btn
                :model-value="selected.includes(dev.id)"
                density="compact"
                class="shrink-0"
                :aria-label="`Asignar a ${dev.name}`"
                @update:model-value="toggle(dev.id)"
              />
              <v-avatar size="34" :class="avatarTone(dev.id)" class="text-[12px] font-bold text-white">
                {{ initials(dev.name) }}
              </v-avatar>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[13.5px] font-bold text-ink-900">{{ dev.name }}</span>
                <span class="block truncate text-[11.5px] text-ink-500">{{ dev.specialty }} · {{ dev.email }}</span>
              </span>
              <span class="hidden shrink-0 text-[11px] font-semibold text-ink-500 min-[420px]:inline">
                {{ workload[dev.id] ?? 0 }} {{ (workload[dev.id] ?? 0) === 1 ? 'sistema' : 'sistemas' }}
              </span>
            </label>
          </li>
        </ul>
        <p v-else class="m-0 px-4 py-10 text-center text-[13px] text-ink-500">
          Ningún desarrollador coincide con la búsqueda.
        </p>
      </div>

      <footer
        class="flex flex-col-reverse gap-2 border-t border-silver-200 bg-silver-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
      >
        <span class="text-center text-[12px] text-ink-500 sm:text-left">
          <strong class="text-ink-900">{{ selected.length }}</strong>
          {{ selected.length === 1 ? 'seleccionado' : 'seleccionados' }}
        </span>
        <div class="flex flex-col-reverse gap-2 sm:flex-row">
          <v-btn variant="text" class="rounded-lg font-bold" :disabled="isSaving" @click="close">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="rounded-lg font-bold"
            prepend-icon="mdi-content-save-outline"
            :loading="isSaving"
            :disabled="!hasChanges"
            @click="submit"
          >
            Guardar equipo
          </v-btn>
        </div>
      </footer>
    </div>
  </v-dialog>
</template>
