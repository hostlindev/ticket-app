import { computed, ref } from 'vue'
import { errorMessage } from '@core/api/errors'
import { useToast } from '@core/composables/useToast'
import { getLedSystems, rotateSystemApiKey, type LedSystem } from '../services/apiKeys.service'

/** API keys de los sistemas donde el usuario en sesión es coordinador (lead). */
export function useLedApiKeys() {
  const toast = useToast()

  const led = ref<LedSystem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const visible = ref<Record<string, boolean>>({})
  const copied = ref<string | null>(null)
  const rotating = ref<string | null>(null)
  const confirming = ref<LedSystem | null>(null)
  let copiedTimer: number | undefined

  const byName = computed(() => new Map(led.value.map((s) => [s.name.trim().toLowerCase(), s])))
  const keyFor = (appName: string): LedSystem | undefined => byName.value.get(appName.trim().toLowerCase())

  async function load(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      led.value = await getLedSystems()
    } catch (err) {
      error.value = errorMessage(err, 'No pudimos cargar las API keys.')
    } finally {
      loading.value = false
    }
  }

  async function copy(system: LedSystem): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(system.apiKey)
      } else {
        const area = document.createElement('textarea')
        area.value = system.apiKey
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.append(area)
        area.select()
        const ok = document.execCommand('copy')
        area.remove()
        if (!ok) throw new Error('copy failed')
      }
      copied.value = system.id
      window.clearTimeout(copiedTimer)
      copiedTimer = window.setTimeout(() => (copied.value = null), 2000)
      toast.success('API key copiada al portapapeles')
    } catch {
      toast.error('No pudimos copiar la API key. Selecciónala y cópiala manualmente.')
    }
  }

  async function confirmRotate(): Promise<void> {
    const target = confirming.value
    if (!target) return
    rotating.value = target.id
    try {
      const updated = await rotateSystemApiKey(target.id)
      const index = led.value.findIndex((s) => s.id === target.id)
      if (index !== -1) led.value[index] = { ...led.value[index]!, apiKey: updated.apiKey }
      visible.value[target.id] = true
      toast.success(`Nueva API key generada para ${target.name}`)
      confirming.value = null
    } catch (err) {
      toast.error(errorMessage(err, 'No pudimos generar la API key.'))
    } finally {
      rotating.value = null
    }
  }

  return { led, loading, error, visible, copied, rotating, confirming, keyFor, load, copy, confirmRotate }
}
