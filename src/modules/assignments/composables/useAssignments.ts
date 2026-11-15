import { storeToRefs } from 'pinia'
import { useAssignmentsStore } from '../store/assignments.store'

export function useAssignments() {
  const store = useAssignmentsStore()
  const refs = storeToRefs(store)

  return {
    ...refs,
    load: store.load,
    saveDevelopers: store.saveDevelopers,
    addSystem: store.addSystem,
    editSystem: store.editSystem,
    removeSystem: store.removeSystem,
    resetFilters: store.resetFilters,
  }
}
