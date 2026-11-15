import type { RouteRecordRaw } from 'vue-router'

export const usersRoutes: RouteRecordRaw[] = [
  {
    path: '/usuarios',
    name: 'users.list',
    component: () => import('./pages/UsersPage.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: 'Usuarios',
    },
  },
]
