import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isEmail, minLength } from '@core/utils/validators'
import { DEMO_CREDENTIALS, toAuthError } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'
import type { AuthError, LoginCredentials } from '../interface/auth.interface'

export type LoginField = 'email' | 'password'

export interface LoginFieldErrors {
  email?: string
  password?: string
}

export function useLogin() {
  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const form = reactive<LoginCredentials>({
    email: '',
    password: '',
    remember: true,
  })
  const touched = reactive<Record<LoginField, boolean>>({
    email: false,
    password: false,
  })
  const isSubmitting = ref(false)
  const serverError = ref<AuthError | null>(null)

  const fieldErrors = computed<LoginFieldErrors>(() => {
    const errors: LoginFieldErrors = {}

    if (!form.email.trim()) {
      errors.email = 'Ingresa tu correo corporativo.'
    } else if (!isEmail(form.email)) {
      errors.email = 'El formato del correo no es válido.'
    }

    if (!form.password) {
      errors.password = 'Ingresa tu contraseña.'
    } else if (!minLength(form.password, 8)) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    return errors
  })

  const isValid = computed(() => Object.keys(fieldErrors.value).length === 0)
  const canSubmit = computed(() => !isSubmitting.value)

  function visibleError(field: LoginField): string | undefined {
    return touched[field] ? fieldErrors.value[field] : undefined
  }

  function clearServerError(): void {
    serverError.value = null
    auth.error = null
  }

  function fillDemoCredentials(): void {
    form.email = DEMO_CREDENTIALS.email
    form.password = DEMO_CREDENTIALS.password
    touched.email = false
    touched.password = false
    clearServerError()
  }

  async function submit(): Promise<void> {
    touched.email = true
    touched.password = true
    serverError.value = null

    if (!isValid.value) return

    isSubmitting.value = true

    try {
      await auth.login({
        email: form.email.trim(),
        password: form.password,
        remember: form.remember,
      })

      await router.replace({ name: 'dashboard.home' })
    } catch (caught) {
      serverError.value = toAuthError(caught)
    } finally {
      isSubmitting.value = false
    }
  }

  watch(
    () => [form.email, form.password],
    () => {
      if (serverError.value) clearServerError()
    },
  )

  return {
    form,
    touched,
    isSubmitting,
    serverError,
    fieldErrors,
    isValid,
    canSubmit,
    visibleError,
    submit,
    fillDemoCredentials,
    clearServerError,
  }
}
