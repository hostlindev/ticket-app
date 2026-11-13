<script setup lang="ts">
withDefaults(
  defineProps<{
    block?: boolean
    loading?: boolean
    disabled?: boolean
    variant?: 'flat' | 'text' | 'outlined' | 'tonal' | 'plain' | 'elevated'
  }>(),
  {
    block: false,
    loading: false,
    disabled: false,
    variant: 'flat',
  },
)
</script>

<template>
  <v-btn
    :block="block"
    :loading="loading"
    :disabled="disabled"
    :variant="variant"
  >
    <slot />
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </v-btn>
</template>
