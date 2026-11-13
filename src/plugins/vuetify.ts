import { createVuetify } from 'vuetify'
import { mdi } from 'vuetify/iconsets/mdi'

const commonThemeColors = {
  background: '#EBF1F6',
  surface: '#F8FAFC',
  'surface-bright': '#FFFFFF',
  'surface-light': '#E2E8F0',
  secondary: '#64748B',
  'secondary-darken-1': '#475569',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  'on-background': '#0F172A',
  'on-surface': '#0F172A',
  'on-primary': '#FFFFFF',
  'on-secondary': '#FFFFFF',
  'on-error': '#FFFFFF',
  'on-success': '#FFFFFF',
  'on-warning': '#0F172A',
}

const commonVariables = {
  'border-color': '#1E293B',
  'border-opacity': 0.3,
  'high-emphasis-opacity': 0.95,
  'medium-emphasis-opacity': 0.72,
}

function getInitialTheme(): string {
  try {
    const saved = localStorage.getItem('pixi_color_palette')
    if (saved && ['celeste', 'rojo', 'verde', 'rosado', 'naranja', 'azul'].includes(saved)) {
      return `pixi-${saved}`
    }
  } catch {}
  return 'pixi-celeste'
}

export default createVuetify({
  theme: {
    defaultTheme: getInitialTheme(),
    themes: {
      'pixi-celeste': {
        dark: false,
        colors: {
          ...commonThemeColors,
          primary: '#0284C7',
          'primary-darken-1': '#0369A1',
          info: '#38BDF8',
        },
        variables: commonVariables,
      },
      'pixi-azul': {
        dark: false,
        colors: {
          ...commonThemeColors,
          primary: '#2563EB',
          'primary-darken-1': '#1D4ED8',
          info: '#60A5FA',
        },
        variables: commonVariables,
      },
      'pixi-verde': {
        dark: false,
        colors: {
          ...commonThemeColors,
          primary: '#059669',
          'primary-darken-1': '#047857',
          info: '#34D399',
        },
        variables: commonVariables,
      },
      'pixi-naranja': {
        dark: false,
        colors: {
          ...commonThemeColors,
          primary: '#EA580C',
          'primary-darken-1': '#C2410C',
          info: '#FB923C',
        },
        variables: commonVariables,
      },
      'pixi-rojo': {
        dark: false,
        colors: {
          ...commonThemeColors,
          primary: '#DC2626',
          'primary-darken-1': '#B91C1C',
          info: '#F87171',
        },
        variables: commonVariables,
      },
      'pixi-rosado': {
        dark: false,
        colors: {
          ...commonThemeColors,
          primary: '#DB2777',
          'primary-darken-1': '#BE185D',
          info: '#F472B6',
        },
        variables: commonVariables,
      },
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      variant: 'flat',
      height: 48,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
      rounded: 'lg',
    },
    VCheckbox: {
      color: 'primary',
      density: 'compact',
      hideDetails: true,
    },
    VCard: {
      rounded: 'lg',
      variant: 'flat',
    },
    VAlert: {
      variant: 'flat',
      density: 'compact',
      rounded: 'lg',
    },
    VSnackbar: {
      rounded: 'lg',
    },
    VChip: {
      rounded: 'lg',
      variant: 'tonal',
    },
  },
  icons: {
    defaultSet: 'mdi',
    sets: { mdi },
  },
})
