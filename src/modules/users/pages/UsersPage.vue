<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@core/layouts/AppLayout.vue'
import { useToast } from '@core/composables/useToast'
import { errorMessage } from '@core/api/errors'
import { useAuthStore } from '@modules/auth/store/auth.store'
import { useUsers } from '../composables/useUsers'
import { ROLE_FILTERS } from '../config/users.config'
import type { ManagedUser, UserInput } from '../interface/user.interface'
import UserCard from '../components/UserCard.vue'
import UserFormDialog from '../components/UserFormDialog.vue'

const { users, filteredUsers, search, roleFilter, isLoading, hasLoaded, isSaving, error, load, addUser, editUser, removeUser, resetFilters } =
  useUsers()
const auth = useAuthStore()
const toast = useToast()

const formOpen = ref(false)
const formUserId = ref<string | null>(null)
const deleteOpen = ref(false)
const deleting = ref<ManagedUser | null>(null)

const formUser = computed(() => users.value.find((u) => u.id === formUserId.value) ?? null)
const hasActiveFilters = computed(() => search.value.trim() !== '' || roleFilter.value !== 'all')

function openCreate(): void {
  formUserId.value = null
  formOpen.value = true
}

function openEdit(user: ManagedUser): void {
  formUserId.value = user.id
  formOpen.value = true
}

function openDelete(user: ManagedUser): void {
  deleting.value = user
  deleteOpen.value = true
}

async function handleSave(input: UserInput): Promise<void> {
  const target = formUser.value
  try {
    if (target) {
      await editUser(target.id, input)
      toast.success(`${input.name} actualizado`)
    } else {
      await addUser(input)
      toast.success(`${input.name} agregado`)
    }
    formOpen.value = false
  } catch (err) {
    toast.error(errorMessage(err, 'No pudimos guardar el usuario.'))
  }
}

async function confirmDelete(): Promise<void> {
  const user = deleting.value
  if (!user) return
  try {
    await removeUser(user.id)
    toast.success(`${user.name} eliminado`)
    deleteOpen.value = false
  } catch (err) {
    toast.error(errorMessage(err, 'No pudimos eliminar al usuario.'))
  }
}

onMounted(load)

const PILL_BASE =
  'shrink-0 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70'
const PILL_ON = 'border-accent-600 bg-accent-600 font-bold text-white shadow-[2px_2px_0_0_var(--shadow-accent)]'
const PILL_OFF =
  'border-silver-200 bg-silver-50 text-ink-700 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700'
</script>

<template>
  <AppLayout title="Usuarios" subtitle="Administra quién tiene acceso a la plataforma y con qué rol.">
    <div class="space-y-5 sm:space-y-6">
      <div class="flex justify-end">
        <v-btn color="primary" variant="flat" class="rounded-lg font-bold" prepend-icon="mdi-account-plus-outline" @click="openCreate">
          Nuevo usuario
        </v-btn>
      </div>

      <section class="console-card p-4 sm:p-5">
        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <v-text-field
            v-model="search"
            placeholder="Buscar por nombre, correo, área o especialidad..."
            density="compact"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            class="min-w-0 flex-1"
          />
          <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:overflow-visible md:p-0" role="group" aria-label="Filtrar por rol">
            <button
              v-for="option in ROLE_FILTERS"
              :key="option.value"
              type="button"
              :class="[PILL_BASE, roleFilter === option.value ? PILL_ON : PILL_OFF]"
              :aria-pressed="roleFilter === option.value"
              @click="roleFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between gap-3 border-t border-silver-200 pt-3 text-[12px]">
          <span class="text-ink-500">
            Mostrando <strong class="text-ink-900">{{ filteredUsers.length }}</strong> de {{ users.length }} usuarios
          </span>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="inline-flex items-center gap-1 font-bold text-accent-600 hover:text-accent-700 hover:underline"
            @click="resetFilters"
          >
            <v-icon icon="mdi-filter-remove-outline" size="15" />
            Limpiar filtros
          </button>
        </div>
      </section>

      <v-alert v-if="error" type="error" variant="tonal" class="rounded-xl" closable>
        {{ error }}
        <template #append>
          <v-btn size="small" variant="text" class="font-bold" @click="load">Reintentar</v-btn>
        </template>
      </v-alert>

      <div v-if="!hasLoaded && isLoading" class="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="n in 6" :key="n" class="console-card animate-pulse space-y-3 p-5">
          <div class="flex gap-3">
            <span class="size-10 rounded-full bg-silver-200" />
            <span class="flex-1 space-y-2">
              <span class="block h-4 w-2/3 rounded bg-silver-200" />
              <span class="block h-3 w-1/2 rounded bg-silver-100" />
            </span>
          </div>
          <span class="block h-6 w-1/3 rounded-full bg-silver-100" />
        </div>
      </div>

      <div
        v-else-if="hasLoaded && filteredUsers.length === 0"
        class="console-card flex flex-col items-center justify-center px-6 py-12 text-center"
      >
        <span class="grid size-14 place-items-center rounded-2xl bg-silver-100">
          <v-icon icon="mdi-account-search-outline" size="30" class="text-ink-400" />
        </span>
        <h4 class="mt-3 text-base font-bold text-ink-900 sm:text-lg">No hay usuarios que mostrar</h4>
        <p class="mt-1 max-w-sm text-[13px] text-ink-500">Prueba cambiando los filtros o la búsqueda.</p>
        <v-btn variant="tonal" color="primary" size="small" class="mt-4 rounded-lg font-bold" prepend-icon="mdi-filter-remove-outline" @click="resetFilters">
          Limpiar filtros
        </v-btn>
      </div>

      <div v-else class="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UserCard
          v-for="user in filteredUsers"
          :key="user.id"
          :user="user"
          :is-self="user.id === auth.user?.id"
          :busy="isSaving"
          @edit="openEdit"
          @delete="openDelete"
        />
      </div>
    </div>

    <UserFormDialog v-model="formOpen" :user="formUser" @save="handleSave" />

    <v-dialog v-model="deleteOpen" max-width="460" :persistent="isSaving">
      <div class="console-card rounded-xl border border-silver-300 bg-white p-5 shadow-xl">
        <h2 class="m-0 text-lg font-bold text-ink-900">Eliminar usuario</h2>
        <p class="mt-2 text-[13.5px] text-ink-600">
          ¿Seguro que quieres eliminar a <strong>{{ deleting?.name }}</strong>? Perderá el acceso y se quitará de los equipos de sus
          sistemas.
        </p>
        <p
          v-if="deleting?.resolvedCount"
          class="mt-3 flex gap-2 rounded-lg border border-accent-200 bg-accent-50 p-3 text-[12.5px] text-accent-800"
        >
          <v-icon icon="mdi-check-decagram-outline" size="18" class="shrink-0" />
          <span>
            Sus {{ deleting.resolvedCount }} incidencias resueltas se conservan: seguirá apareciendo quién las resolvió.
          </span>
        </p>
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <v-btn variant="text" class="rounded-lg font-bold" :disabled="isSaving" @click="deleteOpen = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" class="rounded-lg font-bold" prepend-icon="mdi-trash-can-outline" :loading="isSaving" @click="confirmDelete">
            Eliminar
          </v-btn>
        </div>
      </div>
    </v-dialog>
  </AppLayout>
</template>
