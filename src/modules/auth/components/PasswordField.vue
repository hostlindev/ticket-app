<script setup lang="ts">
import { computed, ref } from 'vue'

withDefaults(
  defineProps<{
    label?: string
    error?: string
    disabled?: boolean
  }>(),
  {
    label: 'Contraseña',
    error: undefined,
    disabled: false,
  },
)

const emit = defineEmits<{
  blur: []
}>()

const model = defineModel<string>({ required: true })

const revealed = ref(false)
const capsLock = ref(false)

const inputType = computed(() => (revealed.value ? 'text' : 'password'))
const appendIcon = computed(() => (revealed.value ? 'mdi-eye-off-outline' : 'mdi-eye-outline'))

function toggleVisibility(): void {
  revealed.value = !revealed.value
}

function syncCapsLock(event: KeyboardEvent): void {
  capsLock.value =
    typeof event.getModifierState === 'function' && event.getModifierState('CapsLock')
}
</script>

<template>
  <div>
    <v-text-field
      v-model="model"
      :type="inputType"
      :label="label"
      :disabled="disabled"
      autocomplete="current-password"
      prepend-inner-icon="mdi-lock-outline"
      :append-inner-icon="appendIcon"
      :error="Boolean(error)"
      :error-messages="error ? [error] : []"
      @click:append-inner="toggleVisibility"
      @blur="emit('blur')"
      @keydown="syncCapsLock"
      @keyup="syncCapsLock"
    />

    <p
      v-if="capsLock"
      class="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#b06a12]"
    >
      <v-icon icon="mdi-alert-outline" size="13" />
      Bloqueo de mayúsculas activado
    </p>
  </div>
</template>
