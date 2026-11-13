import { defineStore } from 'pinia'
import { ref } from 'vue'

export type PaletteId = 'celeste' | 'rojo' | 'verde' | 'rosado' | 'naranja' | 'azul'

export interface PaletteConfig {
  id: PaletteId
  label: string
  color: string
  primaryHex: string
}

export const PALETTES: Record<PaletteId, PaletteConfig> = {
  celeste: {
    id: 'celeste',
    label: 'Celeste',
    color: '#0EA5E9',
    primaryHex: '#0284C7',
  },
  azul: {
    id: 'azul',
    label: 'Azul',
    color: '#3B82F6',
    primaryHex: '#2563EB',
  },
  verde: {
    id: 'verde',
    label: 'Verde',
    color: '#10B981',
    primaryHex: '#059669',
  },
  naranja: {
    id: 'naranja',
    label: 'Naranja',
    color: '#F97316',
    primaryHex: '#EA580C',
  },
  rojo: {
    id: 'rojo',
    label: 'Rojo',
    color: '#EF4444',
    primaryHex: '#DC2626',
  },
  rosado: {
    id: 'rosado',
    label: 'Rosado',
    color: '#EC4899',
    primaryHex: '#DB2777',
  },
}

const STORAGE_KEY = 'pixi_color_palette'

function getStoredPalette(): PaletteId {
  if (typeof window === 'undefined') return 'celeste'
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as PaletteId | null
    if (saved && PALETTES[saved]) return saved
  } catch {}
  return 'celeste'
}

export const usePaletteStore = defineStore('palette', () => {
  const current = ref<PaletteId>(getStoredPalette())

  function applyPalette(id: PaletteId): void {
    if (!PALETTES[id]) return
    current.value = id

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, id)
      } catch {
        // Local storage might be blocked in some iframe/restricted modes
      }
      document.documentElement.setAttribute('data-palette', id)
    }
  }

  function initPalette(): void {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as PaletteId | null
      if (saved && PALETTES[saved]) {
        applyPalette(saved)
        return
      }
    } catch {
      // ignore
    }
    applyPalette('celeste')
  }

  return {
    current,
    palettes: PALETTES,
    applyPalette,
    initPalette,
  }
})
