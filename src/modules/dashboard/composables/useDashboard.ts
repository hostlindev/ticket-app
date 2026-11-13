import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@modules/auth/store/auth.store'
import type { UserRole } from '@modules/auth/interface/auth.interface'
import { useDashboardStore } from '../store/dashboard.store'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  agent: 'Agente',
  developer: 'Dev',
}

export function useDashboard() {
  const authStore = useAuthStore()
  const dashboardStore = useDashboardStore()

  const { user, firstName } = storeToRefs(authStore)
  const {
    loading,
    loaded,
    systemTab,
    activeSliceId,
    resolvedSprint,
    apps,
    totals,
    priorityStats,
    statusStats,
    trend,
    trendMax,
    userMetrics,
    displayedApps,
    pieTotal,
    pieSlices,
    activeSlice,
  } = storeToRefs(dashboardStore)

  const roleLabel = computed<string>(() => {
    return user.value ? ROLE_LABELS[user.value.role] : 'Admin'
  })

  return {
    // Auth refs
    user,
    firstName,
    roleLabel,

    // Dashboard refs
    loading,
    loaded,
    systemTab,
    activeSliceId,
    resolvedSprint,
    apps,
    totals,
    priorityStats,
    statusStats,
    trend,
    trendMax,
    userMetrics,
    displayedApps,
    pieTotal,
    pieSlices,
    activeSlice,

    // Actions
    setSystemTab: dashboardStore.setSystemTab,
    setActiveSliceId: dashboardStore.setActiveSliceId,
    refreshData: dashboardStore.refreshData,
  }
}
