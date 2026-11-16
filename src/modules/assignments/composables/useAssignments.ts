import { storeToRefs } from 'pinia'
import { useAssignmentsStore } from '../store/assignments.store'

export function useAssignments() {
  const store = useAssignmentsStore()
  const refs = storeToRefs(store)

  return {
    ...refs,
    load: store.load,
    loadDevelopers: store.loadDevelopers,
    saveDevelopers: store.saveDevelopers,
    addSystem: store.addSystem,
    editSystem: store.editSystem,
    removeSystem: store.removeSystem,
    resetFilters: store.resetFilters,
  }
}
