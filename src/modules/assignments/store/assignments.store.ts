import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from '@modules/auth/store/auth.store'
import type {
  AssignmentFilter,
  AssignmentsSummary,
  Developer,
  SystemAssignment,
} from '../interface/assignment.interface'
import { getDevelopers, getSystems, setSystemDevelopers } from '../services/assignments.service'

export const useAssignmentsStore = defineStore('assignments', () => {
  const auth = useAuthStore()
  const systems = ref<SystemAssignment[]>([])
  const developers = ref<Developer[]>([])
  const isLoading = ref(false)
  const hasLoaded = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const search = ref('')
  const filter = ref<AssignmentFilter>('all')

  const summary = computed<AssignmentsSummary>(() => {
    const unassigned = systems.value.filter((s) => s.developers.length === 0).length
    return {
      systems: systems.value.length,
      covered: systems.value.length - unassigned,
      unassigned,
      developers: developers.value.length,
    }
  })

  const filteredSystems = computed(() => {
    const query = search.value?.trim().toLowerCase() ?? ''

    return systems.value.filter((s) => {
      if (filter.value === 'unassigned' && s.developers.length > 0) return false
      if (filter.value === 'assigned' && s.developers.length === 0) return false
      if (!query) return true

      return [s.name, s.domain, ...s.developers.map((d) => d.name)].join(' ').toLowerCase().includes(query)
    })
  })

  /** Cuántos sistemas atiende cada desarrollador (para mostrar su carga). */
  const workload = computed(() => {
    const map: Record<string, number> = {}
    for (const system of systems.value) {
      for (const dev of system.developers) map[dev.id] = (map[dev.id] ?? 0) + 1
    }
    return map
  })

  /** Mantiene los sistemas del usuario en sesión alineados con lo asignado aquí (alimenta el tablero). */
  function syncCurrentUser(): void {
    const me = auth.user?.id
    if (!me) return
    auth.setAssignedSystems(systems.value.filter((s) => s.developers.some((d) => d.id === me)).map((s) => s.name))
  }

  async function load(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const [s, d] = await Promise.all([getSystems(), getDevelopers()])
      systems.value = s
      developers.value = d
      hasLoaded.value = true
      syncCurrentUser()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No pudimos cargar los sistemas.'
    } finally {
      isLoading.value = false
    }
  }

  /** Reemplaza los desarrolladores de un sistema. Lanza error si el guardado falla. */
  async function saveDevelopers(systemId: string, developerIds: string[]): Promise<void> {
    isSaving.value = true
    try {
      const updated = await setSystemDevelopers(systemId, developerIds)
      const index = systems.value.findIndex((s) => s.id === systemId)
      if (index !== -1) systems.value[index] = updated
      syncCurrentUser()
    } finally {
      isSaving.value = false
    }
  }

  function resetFilters(): void {
    search.value = ''
    filter.value = 'all'
  }

  return {
    systems,
    developers,
    isLoading,
    hasLoaded,
    isSaving,
    error,
    search,
    filter,
    summary,
    filteredSystems,
    workload,
    load,
    saveDevelopers,
    resetFilters,
  }
})
