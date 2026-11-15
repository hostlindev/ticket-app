import { storeToRefs } from 'pinia'
import { useUsersStore } from '../store/users.store'

export function useUsers() {
  const store = useUsersStore()
  const refs = storeToRefs(store)

  return {
    ...refs,
    load: store.load,
    addUser: store.addUser,
    editUser: store.editUser,
    removeUser: store.removeUser,
    resetFilters: store.resetFilters,
  }
}
