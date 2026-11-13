<script setup lang="ts">
import { computed } from 'vue'
import type { AuthError } from '../interface/auth.interface'

const props = defineProps<{
  error: AuthError | null
}>()

const fieldMessages = computed(() => {
  const errors = props.error?.fieldErrors
  return errors ? Object.values(errors).filter((message): message is string => Boolean(message)) : []
})
</script>

<template>
  <Transition name="alert-fade">
    <v-alert
      v-if="error"
      type="error"
      variant="flat"
      density="compact"
      rounded="lg"
      class="auth-alert"
      role="alert"
    >
      <p class="font-pixel text-[16px] leading-none text-[#8f2a22]">No pudimos iniciar tu sesión</p>
      <p class="mt-1.5 text-[13px] leading-snug text-[#8f2a22]/90">{{ error.message }}</p>
      <p
        v-for="message in fieldMessages"
        :key="message"
        class="mt-1 text-[12px] leading-snug text-[#8f2a22]/70"
      >
        {{ message }}
      </p>
    </v-alert>
  </Transition>
</template>

<style scoped>
.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
