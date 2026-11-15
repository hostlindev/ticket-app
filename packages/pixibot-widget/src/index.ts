import { mountPixibot } from './widget'
import type { PixibotHandle, PixibotOptions } from './types'

export type { PixibotOptions, PixibotUser, PixibotHandle, IssueType, ClientContext } from './types'
export { collectContext, detectBrowser } from './collect'

let instance: PixibotHandle | null = null

/**
 * Monta Pixibot en la página. Llamar una vez que el usuario tenga sesión.
 * Si ya existía una instancia, se reemplaza.
 */
export function initPixibot(options: PixibotOptions): PixibotHandle {
  instance?.destroy()
  instance = mountPixibot(options)
  return instance
}

/** Quita el widget (p. ej. al cerrar sesión). */
export function destroyPixibot(): void {
  instance?.destroy()
  instance = null
}

/** Olvida el saludo de la sesión: llamar al cerrar sesión para que el próximo login lo vuelva a mostrar. */
export function resetPixibotGreeting(): void {
  try { sessionStorage.removeItem('pixibot:greeted') } catch { /* ignorar */ }
}
