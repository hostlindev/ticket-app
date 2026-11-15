<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import type { UserRole } from '@modules/auth/interface/auth.interface'
import { useUsers } from '../composables/useUsers'
import { ROLE_OPTIONS } from '../config/users.config'
import type { ManagedUser, UserInput } from '../interface/user.interface'

const props = defineProps<{ modelValue: boolean; user?: ManagedUser | null }>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [input: UserInput]
}>()

const { xs } = useDisplay()
const { isSaving, users } = useUsers()

const name = ref('')
const email = ref('')
const role = ref<UserRole>('developer')
const department = ref('')
const specialty = ref('')
const password = ref('')
const showPassword = ref(false)
const submitted = ref(false)

const isEdit = computed(() => !!props.user)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    name.value = props.user?.name ?? ''
    email.value = props.user?.email ?? ''
    role.value = props.user?.role ?? 'developer'
    department.value = props.user?.department ?? ''
    specialty.value = props.user?.specialty ?? ''
    password.value = ''
    showPassword.value = false
    submitted.value = false
  },
)

const nameError = computed(() => (name.value.trim().length < 3 ? 'Escribe el nombre completo (mín. 3 caracteres).' : ''))

const emailError = computed(() => {
  const value = email.value.trim().toLowerCase()
  if (!value) return 'El correo es obligatorio.'
  if (!EMAIL_PATTERN.test(value)) return 'Ingresa un correo válido.'
  if (users.value.some((u) => u.id !== props.user?.id && u.email.toLowerCase() === value)) {
    return 'Ya existe un usuario con ese correo.'
  }
  return ''
})

const passwordError = computed(() => {
  if (!password.value) return isEdit.value ? '' : 'La contraseña es obligatoria.'
  return password.value.length < 8 ? 'Usa al menos 8 caracteres.' : ''
})

const show = (error: string) => (submitted.value ? error : '')

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  submitted.value = true
  if (nameError.value || emailError.value || passwordError.value) return

  emit('save', {
    name: name.value.trim(),
    email: email.value.trim().toLowerCase(),
    role: role.value,
    department: department.value.trim() || undefined,
    specialty: specialty.value.trim() || undefined,
    password: password.value || undefined,
  })
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
    <form
      class="console-card flex flex-col overflow-hidden border border-silver-300 bg-white shadow-xl"
      :class="xs ? 'h-full rounded-none' : 'max-h-[90vh] rounded-xl'"
      novalidate
      @submit.prevent="submit"
    >
      <header class="flex items-start gap-3 border-b border-silver-200 p-4 sm:p-5">
        <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-100 text-accent-700">
          <v-icon :icon="isEdit ? 'mdi-account-edit-outline' : 'mdi-account-plus-outline'" size="22" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="m-0 text-[11px] font-bold uppercase tracking-wider text-ink-500">
            {{ isEdit ? 'Editar usuario' : 'Nuevo usuario' }}
          </p>
          <h2 class="m-0 text-lg font-bold leading-tight text-ink-900">
            {{ isEdit ? user?.name : 'Agregar usuario' }}
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
          label="Nombre completo"
          prepend-inner-icon="mdi-account-outline"
          :error-messages="show(nameError)"
          maxlength="255"
          autofocus
        />
        <v-text-field
          v-model="email"
          label="Correo"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          :error-messages="show(emailError)"
          maxlength="255"
        />
        <v-select
          v-model="role"
          label="Rol"
          :items="ROLE_OPTIONS"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-shield-account-outline"
          hide-details="auto"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" :subtitle="item.raw.description" />
          </template>
        </v-select>
        <div class="grid gap-4 sm:grid-cols-2">
          <v-text-field v-model="department" label="Área (opcional)" prepend-inner-icon="mdi-briefcase-outline" maxlength="255" hide-details="auto" />
          <v-text-field v-model="specialty" label="Especialidad (opcional)" placeholder="Frontend, Backend, QA…" maxlength="255" hide-details="auto" />
        </div>
        <v-text-field
          v-model="password"
          :label="isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          :error-messages="show(passwordError)"
          :hint="isEdit ? 'Déjala vacía para conservar la actual.' : 'Mínimo 8 caracteres.'"
          persistent-hint
          autocomplete="new-password"
          @click:append-inner="showPassword = !showPassword"
        />
      </div>

      <footer class="flex flex-col-reverse gap-2 border-t border-silver-200 bg-silver-50/70 p-4 sm:flex-row sm:justify-end sm:px-5">
        <v-btn variant="text" class="rounded-lg font-bold" :disabled="isSaving" @click="close">Cancelar</v-btn>
        <v-btn
          type="submit"
          color="primary"
          variant="flat"
          class="rounded-lg font-bold"
          :prepend-icon="isEdit ? 'mdi-content-save-outline' : 'mdi-plus'"
          :loading="isSaving"
        >
          {{ isEdit ? 'Guardar cambios' : 'Crear usuario' }}
        </v-btn>
      </footer>
    </form>
  </v-dialog>
</template>
