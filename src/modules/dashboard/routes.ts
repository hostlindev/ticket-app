import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard.home',
    component: () => import('./pages/DashboardPage.vue'),
    meta: {
      requiresAuth: true,
      title: 'Tablero de incidencias',
    },
  },
]
