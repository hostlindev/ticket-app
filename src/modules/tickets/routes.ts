import type { RouteRecordRaw } from 'vue-router'

export const ticketsRoutes: RouteRecordRaw[] = [
  {
    path: '/tickets',
    name: 'tickets.list',
    component: () => import('./pages/TicketsPage.vue'),
    meta: {
      requiresAuth: true,
      title: 'Cola de Incidencias',
    },
  },
]
