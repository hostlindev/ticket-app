<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@core/components/BaseButton.vue'
import PixelIcon from '@core/components/PixelIcon.vue'
import { brand } from '@core/config/brand'
import AuthAlert from './AuthAlert.vue'
import PasswordField from './PasswordField.vue'
import { DEMO_CREDENTIALS } from '../services/auth.service'
import { useLogin } from '../composables/useLogin'

const {
  form,
  touched,
  isSubmitting,
  serverError,
  canSubmit,
  visibleError,
  submit,
  fillDemoCredentials,
} = useLogin()

const isDev = import.meta.env.DEV

const emailError = computed(() => visibleError('email'))
const passwordError = computed(() => visibleError('password'))
</script>

<template>
  <v-card variant="flat" class="pixel-card pa-6 pa-sm-8">
    <header class="mb-7">
      <p
        class="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-900 bg-accent-100 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-900"
      >
        <PixelIcon name="lock" :size="12" class="text-accent-700" />
        solo equipo de desarrollo
      </p>

      <h1 class="font-pixel mt-4 text-[28px] leading-[1.08] text-ink-900 sm:text-[32px]">
        Entra a tu panel
      </h1>
      <p class="mt-2.5 text-sm leading-relaxed text-ink-500">
        Usa tu cuenta del equipo para ver los reportes de tus usuarios.
      </p>
    </header>

    <v-form novalidate @submit.prevent="submit">
      <div class="space-y-4">
        <v-text-field
          v-model="form.email"
          label="Correo del equipo"
          placeholder="usuario@empresa.dev"
          autocomplete="username"
          inputmode="email"
          prepend-inner-icon="mdi-email-outline"
          :disabled="isSubmitting"
          :error="Boolean(emailError)"
          :error-messages="emailError ? [emailError] : []"
          @blur="touched.email = true"
        />

        <PasswordField
          v-model="form.password"
          label="Contraseña"
          :error="passwordError"
          :disabled="isSubmitting"
          @blur="touched.password = true"
        />

        <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <v-checkbox v-model="form.remember" label="Recordar sesión" hide-details />

          <a
            :href="`mailto:${brand.supportEmail}?subject=Recuperar%20acceso`"
            class="text-[12.5px] font-semibold text-ink-500 transition-colors hover:text-accent-600"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <AuthAlert :error="serverError" />

        <BaseButton
          type="submit"
          block
          size="large"
          color="primary"
          class="pixel-button"
          :loading="isSubmitting"
          :disabled="!canSubmit"
        >
          Iniciar sesión
          <template #append>
            <v-icon icon="mdi-arrow-right" size="18" />
          </template>
        </BaseButton>
      </div>
    </v-form>

    <div v-if="isDev" class="pixel-dashed mt-6 rounded-[8px] bg-silver-200/60 px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <p class="font-pixel text-[15px] leading-none text-ink-900">Modo demo</p>
        <span
          class="rounded border border-ink-900/30 bg-white px-1.5 py-px text-[9.5px] font-bold uppercase tracking-wider text-ink-500"
        >
          solo dev
        </span>
      </div>

      <dl class="mt-2.5 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-[12px]">
        <dt class="font-semibold text-ink-500">Correo</dt>
        <dd class="m-0 truncate font-mono font-bold text-ink-800">{{ DEMO_CREDENTIALS.email }}</dd>
        <dt class="font-semibold text-ink-500">Clave</dt>
        <dd class="m-0 truncate font-mono font-bold text-ink-800">{{ DEMO_CREDENTIALS.password }}</dd>
      </dl>

      <v-btn
        variant="tonal"
        size="small"
        height="34"
        density="compact"
        color="primary"
        block
        class="mt-3 font-bold"
        prepend-icon="mdi-auto-fix"
        @click="fillDemoCredentials"
      >
        Autocompletar
      </v-btn>
    </div>

    <!-- <p class="mt-6 flex items-center justify-center gap-1.5 text-[12.5px] text-ink-500">
      ¿No puedes entrar?
      <a
        :href="`mailto:${brand.supportEmail}`"
        class="font-bold text-accent-600 underline decoration-accent-300 decoration-2 underline-offset-4 transition-colors hover:text-accent-700"
      >
        Escríbenos
      </a>
    </p> -->
  </v-card>
</template>
