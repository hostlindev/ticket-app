<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useAssignments } from '../composables/useAssignments'
import type { NewSystemInput, SystemAssignment } from '../interface/assignment.interface'

const props = defineProps<{ modelValue: boolean; system?: SystemAssignment | null }>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  create: [input: NewSystemInput]
}>()

const { xs } = useDisplay()
const { isSaving, systems, developers, developersLoading, developersError, loadDevelopers } = useAssignments()

const name = ref('')
const domain = ref('')
const description = ref('')
const leadId = ref<string | null>(null)
const submitted = ref(false)

const isEdit = computed(() => !!props.system)
const others = computed(() => systems.value.filter((s) => s.id !== props.system?.id))

const DOMAIN_PATTERN = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    name.value = props.system?.name ?? ''
    domain.value = props.system?.domain ?? ''
    description.value = props.system?.description ?? ''
    leadId.value = props.system?.lead?.id ?? props.system?.leadId ?? null
    submitted.value = false
    if (developers.value.length === 0) void loadDevelopers()
  },
)

/** Acepta que peguen una URL completa y deja solo el host. */
const normalizedDomain = computed(() =>
  domain.value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, ''),
)

const nameError = computed(() => {
  const value = name.value.trim()
  if (!value) return 'El nombre es obligatorio.'
  if (value.length < 3) return 'Usa al menos 3 caracteres.'
  if (others.value.some((s) => s.name.toLowerCase() === value.toLowerCase())) return 'Ya existe un sistema con ese nombre.'
  return ''
})

const domainError = computed(() => {
  if (!normalizedDomain.value) return 'El dominio es obligatorio.'
  if (!DOMAIN_PATTERN.test(normalizedDomain.value)) return 'Ingresa un dominio válido, ej. app.empresa.com.'
  if (others.value.some((s) => s.domain.toLowerCase() === normalizedDomain.value)) return 'Ya existe un sistema con ese dominio.'
  return ''
})

const leadError = computed(() => (leadId.value ? '' : 'Selecciona al coordinador del proyecto.'))

const showName = computed(() => (submitted.value ? nameError.value : ''))
const showDomain = computed(() => (submitted.value ? domainError.value : ''))
const showLead = computed(() => (submitted.value ? leadError.value : ''))

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  submitted.value = true
  if (nameError.value || domainError.value || leadError.value || !leadId.value) return
  emit('create', {
    name: name.value.trim(),
    domain: normalizedDomain.value,
    description: description.value.trim() || undefined,
    leadId: leadId.value,
  })
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    :fullscreen="xs"
    scrollable
    :persistent="isSaving"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form
      class="console-card flex flex-col overflow-hidden border border-silver-300 bg-white shadow-xl"
      :class="xs ? 'h-full rounded-none' : 'max-h-[90vh] rounded-xl'"
      novalidate
      @submit.prevent="submit"
    >
      <header class="flex items-start gap-3 border-b border-silver-200 p-4 sm:p-5">
        <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-100 text-accent-700">
          <v-icon icon="mdi-application-outline" size="22" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="m-0 text-[11px] font-bold uppercase tracking-wider text-ink-500">
            {{ isEdit ? 'Editar sistema' : 'Nuevo sistema' }}
          </p>
          <h2 class="m-0 text-lg font-bold leading-tight text-ink-900">
            {{ isEdit ? 'Actualizar sistema' : 'Registrar sistema' }}
          </h2>
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

      <div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        <v-text-field
          v-model="name"
          label="Nombre del sistema"
          placeholder="Ej. NexaPortal Clientes"
          prepend-inner-icon="mdi-application-outline"
          :error-messages="showName"
          maxlength="60"
          autofocus
        />
        <v-text-field
          v-model="domain"
          label="Dominio"
          placeholder="app.empresa.com"
          prepend-inner-icon="mdi-web"
          :error-messages="showDomain"
          maxlength="253"
        />
        <v-select
          v-model="leadId"
          :items="developers"
          item-title="name"
          item-value="id"
          label="Coordinador del proyecto"
          placeholder="Selecciona al coordinador"
          prepend-inner-icon="mdi-account-star-outline"
          :menu-props="{ location: 'bottom', offset: 6, maxHeight: 280 }"
          :loading="developersLoading"
          :error-messages="showLead || (developersError ? [developersError] : [])"
          :no-data-text="developersLoading ? 'Cargando usuarios…' : 'No hay usuarios disponibles'"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" :subtitle="item.email" />
          </template>
        </v-select>
        <v-textarea
          v-model="description"
          label="Descripción (opcional)"
          placeholder="¿Qué hace este sistema?"
          rows="3"
          auto-grow
          maxlength="160"
          counter
          hide-details="auto"
        />
      </div>

      <footer
        class="flex flex-col-reverse gap-2 border-t border-silver-200 bg-silver-50/70 p-4 sm:flex-row sm:justify-end sm:px-5"
      >
        <v-btn variant="text" class="rounded-lg font-bold" :disabled="isSaving" @click="close">Cancelar</v-btn>
        <v-btn
          type="submit"
          color="primary"
          variant="flat"
          class="rounded-lg font-bold"
          :prepend-icon="isEdit ? 'mdi-content-save-outline' : 'mdi-plus'"
          :loading="isSaving"
        >
          {{ isEdit ? 'Guardar cambios' : 'Registrar sistema' }}
        </v-btn>
      </footer>
    </form>
  </v-dialog>
</template>
