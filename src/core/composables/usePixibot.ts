import { onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { destroyPixibot, initPixibot, resetPixibotGreeting } from '@pixi/pixibot-widget'
import { USE_MOCK } from '@core/api/config'
import { getAccessToken } from '@core/api/token'
import { brand } from '@core/config/brand'
import { useAuthStore } from '@modules/auth/store/auth.store'

/** Respuesta simulada para probar el widget sin backend (VITE_USE_MOCK=true). */
const mockFetch: typeof fetch = async () => {
  await new Promise((r) => setTimeout(r, 900))
  return new Response(JSON.stringify({ data: { id: `INC-${Math.floor(3000 + Math.random() * 999)}` } }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Monta Pixibot mientras haya sesión y lo retira al cerrarla o al salir del layout.
 * Este mismo código es el que usaría cualquier sistema que instale `@pixi/pixibot-widget`.
 */
export function usePixibot(): void {
  const { user } = storeToRefs(useAuthStore())

  watch(
    () => user.value?.id,
    (id, prevId) => {
      if (!id) {
        if (prevId) resetPixibotGreeting() // cierre de sesión real, no carga inicial
        return destroyPixibot()
      }
      initPixibot({
        apiUrl: import.meta.env.VITE_API_URL ?? '/api',
        system: brand.name,
        user: () => {
          const u = user.value
          return u ? { id: u.id, name: u.name, email: u.email } : null
        },
        token: getAccessToken,
        fetch: USE_MOCK ? mockFetch : undefined,
      })
    },
    { immediate: true },
  )

  onBeforeUnmount(destroyPixibot)
}
