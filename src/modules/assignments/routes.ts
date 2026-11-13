import type { RouteRecordRaw } from 'vue-router'

export const assignmentsRoutes: RouteRecordRaw[] = [
  {
    path: '/asignaciones',
    name: 'assignments.list',
    component: () => import('./pages/AssignmentsPage.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: 'Asignación de equipo',
    },
  },
]
