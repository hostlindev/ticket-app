import type { Router } from 'vue-router'
import { useAuthStore } from '@modules/auth/store/auth.store'

/**
 * App-level guards. Lives in the composition root because it is the only
 * place allowed to know about both the router and the auth module.
 */
export function setupGuards(router: Router): void {
  router.beforeEach((to) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return {
        name: 'auth.login',
        query: { redirect: to.fullPath },
      }
    }

    const allowed = to.meta.roles
    if (allowed && (!auth.user || !allowed.includes(auth.user.role))) {
      return { name: 'dashboard.home' }
    }

    if (to.meta.guestOnly && auth.isAuthenticated) {
      return { name: 'dashboard.home' }
    }

    return true
  })
}
