<script setup lang="ts">
withDefaults(
  defineProps<{
    loading?: boolean
    label?: string
    /** `icon`: solo icono (tarjetas). `text`: icono + texto (cabecera de página). */
    variant?: 'icon' | 'text'
  }>(),
  { loading: false, label: 'Actualizar datos', variant: 'icon' },
)

defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <button
    type="button"
    class="pixel-action"
    :class="{ 'is-icon': variant === 'icon' }"
    :disabled="loading"
    :title="label"
    :aria-label="label"
    :aria-busy="loading"
    @click="$emit('click')"
  >
    <v-icon icon="mdi-refresh" size="18" :class="{ 'refresh-spin': loading }" />
    <span v-if="variant === 'text'">{{ loading ? 'Actualizando…' : 'Actualizar' }}</span>
  </button>
</template>

<style scoped>
.pixel-action :deep(.v-icon) {
  transition: transform 0.25s ease;
}
.pixel-action:hover:not(:disabled) :deep(.v-icon) {
  transform: rotate(90deg);
}
.refresh-spin {
  animation: refresh-spin 0.8s linear infinite;
}
@keyframes refresh-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .refresh-spin {
    animation: none;
  }
  .pixel-action :deep(.v-icon) {
    transition: none;
  }
}
</style>
