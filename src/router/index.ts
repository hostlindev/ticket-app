import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { brand } from '@core/config/brand'
import { setupGuards } from './guards'
import { authRoutes } from '@modules/auth/routes'
import { dashboardRoutes } from '@modules/dashboard/routes'
import { ticketsRoutes } from '@modules/tickets/routes'
import { assignmentsRoutes } from '@modules/assignments/routes'
import type { UserRole } from '@modules/auth/interface/auth.interface'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    title?: string
    /** Roles con acceso; sin definir, cualquier usuario autenticado */
    roles?: UserRole[]
  }
}

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...ticketsRoutes,
  ...assignmentsRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'dashboard.home' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

setupGuards(router)

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${brand.name}` : `${brand.name} · ${brand.spirit}`
})

export default router
