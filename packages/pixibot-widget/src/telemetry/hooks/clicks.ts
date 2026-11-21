import { redactSecrets } from '../sanitize'
import { state } from '../state'

const INTERACTIVE = 'button, a, input, select, textarea, [role="button"]'

export function labelFor(el: Element): string {
  const h = el as HTMLElement
  const tag = el.tagName.toLowerCase()
  const label =
    h.dataset?.pixibotLabel ||
    (h.id && `#${h.id}`) ||
    el.getAttribute('aria-label') ||
    el.getAttribute('name') ||
    // textContent solo en botones/enlaces: en contenedores grandes recorrería todo el subárbol.
    (el.matches('button, a, [role="button"]') ? (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 25).toLowerCase() : '')
  return `${tag}:${redactSecrets(label)}`
}

export function installClickHook(hostId: string): () => void {
  if (typeof window === 'undefined') return () => {}
  const onClick = (e: Event) => {
    try {
      const t = e.target as Element | null
      if (!t || (t as HTMLElement).id === hostId || t.closest?.(`#${hostId}`)) return
      const el = t.closest?.(INTERACTIVE) ?? t
      state.lastClickedElement = labelFor(el)
    } catch { /* ignorar */ }
  }
  window.addEventListener('click', onClick, true)
  return () => window.removeEventListener('click', onClick, true)
}
