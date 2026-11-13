import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastColor = 'success' | 'info' | 'warning' | 'error'

export interface ToastState {
  visible: boolean
  message: string
  color: ToastColor
  timeout: number
}

export interface ToastPayload {
  message: string
  color?: ToastColor
  timeout?: number
}

export const useUiStore = defineStore('ui', () => {
  const toast = ref<ToastState>({
    visible: false,
    message: '',
    color: 'info',
    timeout: 4_000,
  })

  function notify(payload: ToastPayload): void {
    toast.value = {
      visible: true,
      message: payload.message,
      color: payload.color ?? 'info',
      timeout: payload.timeout ?? 4_000,
    }
  }

  function dismiss(): void {
    toast.value.visible = false
  }

  return { toast, notify, dismiss }
})
