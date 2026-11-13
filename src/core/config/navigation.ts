export interface NavItem {
  name: string
  to: string
  routeName: string
  icon: string
  /** Roles que ven la opción; sin definir, todos */
  roles?: string[]
}

export interface NavSection {
  label: string
  items: NavItem[]
}

/**
 * Menú lateral. Para agregar una pantalla basta con añadir un item aquí.
 */
export const navSections: NavSection[] = [
  {
    label: 'General',
    items: [
      { name: 'Tablero', to: '/', routeName: 'dashboard.home', icon: 'mdi-view-dashboard-outline' },
      { name: 'Incidencias Web', to: '/tickets', routeName: 'tickets.list', icon: 'mdi-alert-octagon-outline' },
    ],
  },
  {
    label: 'Administración',
    items: [
      {
        name: 'Asignación de equipo',
        to: '/asignaciones',
        routeName: 'assignments.list',
        icon: 'mdi-account-multiple-plus-outline',
        roles: ['admin'],
      },
    ],
  },
]
