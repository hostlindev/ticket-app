<script setup lang="ts">
defineProps<{
  /** Icono MDI opcional, p. ej. `mdi-plus`. */
  icon?: string
}>()

defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <button type="button" class="pixel-action" @click="$emit('click')">
    <v-icon v-if="icon" :icon="icon" size="18" />
    <slot />
  </button>
</template>
