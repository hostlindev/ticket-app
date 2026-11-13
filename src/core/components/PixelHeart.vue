<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    color?: string
  }>(),
  {
    size: 14,
    color: '#E4513B',
  },
)
</script>

<template>
  <svg
    :width="size"
    :height="Math.round((size / 7) * 6)"
    viewBox="0 0 7 6"
    fill="none"
    shape-rendering="crispEdges"
    aria-hidden="true"
  >
    <rect x="1" y="0" width="2" height="1" :fill="color" />
    <rect x="4" y="0" width="2" height="1" :fill="color" />
    <rect x="0" y="1" width="7" height="2" :fill="color" />
    <rect x="1" y="3" width="5" height="1" :fill="color" />
    <rect x="2" y="4" width="3" height="1" :fill="color" />
    <rect x="3" y="5" width="1" height="1" :fill="color" />
  </svg>
</template>
