import { useUiStore } from '@core/stores/ui.store'

export function useToast() {
  const ui = useUiStore()

  return {
    notify: ui.notify,
    success: (message: string) => ui.notify({ message, color: 'success' }),
    error: (message: string) => ui.notify({ message, color: 'error', timeout: 6_000 }),
    info: (message: string) => ui.notify({ message, color: 'info' }),
    warning: (message: string) => ui.notify({ message, color: 'warning' }),
  }
}
