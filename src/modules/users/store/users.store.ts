import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { errorMessage } from '@core/api/errors'
import type { ManagedUser, UserInput, UserRoleFilter } from '../interface/user.interface'
import { createUser, deleteUser, getUsers, updateUser } from '../services/users.service'

export const useUsersStore = defineStore('users', () => {
  const users = ref<ManagedUser[]>([])
  const isLoading = ref(false)
  const hasLoaded = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const search = ref('')
  const roleFilter = ref<UserRoleFilter>('all')

  const filteredUsers = computed(() => {
    const query = search.value?.trim().toLowerCase() ?? ''

    return users.value.filter((u) => {
      if (roleFilter.value !== 'all' && u.role !== roleFilter.value) return false
      if (!query) return true

      return [u.name, u.email, u.department ?? '', u.specialty ?? ''].join(' ').toLowerCase().includes(query)
    })
  })

  async function load(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      users.value = await getUsers()
      hasLoaded.value = true
    } catch (err) {
      error.value = errorMessage(err, 'No pudimos cargar los usuarios.')
    } finally {
      isLoading.value = false
    }
  }

  /** Crea un usuario. Lanza error si falla. */
  async function addUser(input: UserInput): Promise<ManagedUser> {
    isSaving.value = true
    try {
      const created = await createUser(input)
      users.value = [...users.value, created].sort((a, b) => a.name.localeCompare(b.name))
      return created
    } finally {
      isSaving.value = false
    }
  }

  /** Edita un usuario. Lanza error si falla. */
  async function editUser(id: string, input: UserInput): Promise<ManagedUser> {
    isSaving.value = true
    try {
      const updated = await updateUser(id, input)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) users.value[index] = updated
      return updated
    } finally {
      isSaving.value = false
    }
  }

  /** Elimina (soft delete) un usuario. Lanza error si falla. */
  async function removeUser(id: string): Promise<void> {
    isSaving.value = true
    try {
      await deleteUser(id)
      users.value = users.value.filter((u) => u.id !== id)
    } finally {
      isSaving.value = false
    }
  }

  function resetFilters(): void {
    search.value = ''
    roleFilter.value = 'all'
  }

  return {
    users,
    isLoading,
    hasLoaded,
    isSaving,
    error,
    search,
    roleFilter,
    filteredUsers,
    load,
    addUser,
    editUser,
    removeUser,
    resetFilters,
  }
})
