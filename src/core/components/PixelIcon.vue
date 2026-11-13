<script setup lang="ts">
import { computed } from 'vue'

export type PixelIconName =
  | 'bug'
  | 'clock'
  | 'branch'
  | 'shield'
  | 'lock'
  | 'mail'
  | 'eye'
  | 'eye-off'
  | 'alert'
  | 'dashboard'
  | 'ticket'
  | 'logout'
  | 'code'
  | 'check'
  | 'user'

const props = withDefaults(
  defineProps<{
    name: PixelIconName
    size?: number | string
    color?: string
  }>(),
  {
    size: 16,
    color: 'currentColor',
  },
)

const iconSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <svg
    :width="iconSize"
    :height="iconSize"
    viewBox="0 0 12 12"
    fill="none"
    shape-rendering="crispEdges"
    class="inline-block shrink-0 align-middle"
    aria-hidden="true"
  >
    <!-- BUG -->
    <template v-if="name === 'bug'">
      <!-- Antennae -->
      <rect x="2" y="0" width="1" height="2" :fill="color" />
      <rect x="9" y="0" width="1" height="2" :fill="color" />
      <rect x="3" y="1" width="1" height="1" :fill="color" />
      <rect x="8" y="1" width="1" height="1" :fill="color" />
      <!-- Head -->
      <rect x="4" y="2" width="4" height="2" :fill="color" />
      <!-- Legs -->
      <rect x="0" y="4" width="3" height="1" :fill="color" />
      <rect x="9" y="4" width="3" height="1" :fill="color" />
      <rect x="0" y="6" width="3" height="1" :fill="color" />
      <rect x="9" y="6" width="3" height="1" :fill="color" />
      <rect x="0" y="8" width="3" height="1" :fill="color" />
      <rect x="9" y="8" width="3" height="1" :fill="color" />
      <!-- Body -->
      <rect x="3" y="4" width="6" height="6" :fill="color" />
      <!-- Center stripe -->
      <rect x="5" y="5" width="2" height="4" fill="#EBF1F6" />
    </template>

    <!-- CLOCK / SLA -->
    <template v-else-if="name === 'clock'">
      <!-- Rim -->
      <rect x="4" y="0" width="4" height="1" :fill="color" />
      <rect x="2" y="1" width="2" height="1" :fill="color" />
      <rect x="8" y="1" width="2" height="1" :fill="color" />
      <rect x="1" y="2" width="1" height="2" :fill="color" />
      <rect x="10" y="2" width="1" height="2" :fill="color" />
      <rect x="0" y="4" width="1" height="4" :fill="color" />
      <rect x="11" y="4" width="1" height="4" :fill="color" />
      <rect x="1" y="8" width="1" height="2" :fill="color" />
      <rect x="10" y="8" width="1" height="2" :fill="color" />
      <rect x="2" y="10" width="2" height="1" :fill="color" />
      <rect x="8" y="10" width="2" height="1" :fill="color" />
      <rect x="4" y="11" width="4" height="1" :fill="color" />
      <!-- Hands -->
      <rect x="5" y="3" width="2" height="3" :fill="color" />
      <rect x="5" y="5" width="4" height="2" :fill="color" />
    </template>

    <!-- BRANCH / GIT -->
    <template v-else-if="name === 'branch'">
      <!-- Main trunk top node -->
      <rect x="2" y="1" width="3" height="3" :fill="color" />
      <!-- Trunk stem -->
      <rect x="3" y="4" width="1" height="4" :fill="color" />
      <!-- Branch curve -->
      <rect x="4" y="5" width="2" height="1" :fill="color" />
      <rect x="6" y="4" width="1" height="1" :fill="color" />
      <rect x="7" y="3" width="1" height="1" :fill="color" />
      <!-- Branch node -->
      <rect x="7" y="0" width="3" height="3" :fill="color" />
      <!-- Main bottom node -->
      <rect x="2" y="8" width="3" height="3" :fill="color" />
    </template>

    <!-- SHIELD -->
    <template v-else-if="name === 'shield'">
      <rect x="1" y="1" width="10" height="2" :fill="color" />
      <rect x="1" y="3" width="1" height="4" :fill="color" />
      <rect x="10" y="3" width="1" height="4" :fill="color" />
      <rect x="2" y="7" width="1" height="2" :fill="color" />
      <rect x="9" y="7" width="1" height="2" :fill="color" />
      <rect x="3" y="9" width="2" height="1" :fill="color" />
      <rect x="7" y="9" width="2" height="1" :fill="color" />
      <rect x="5" y="10" width="2" height="1" :fill="color" />
      <!-- Center check/core -->
      <rect x="4" y="4" width="4" height="3" :fill="color" />
    </template>

    <!-- LOCK -->
    <template v-else-if="name === 'lock'">
      <!-- Shackle -->
      <rect x="4" y="0" width="4" height="1" :fill="color" />
      <rect x="3" y="1" width="2" height="4" :fill="color" />
      <rect x="7" y="1" width="2" height="4" :fill="color" />
      <!-- Body -->
      <rect x="1" y="4" width="10" height="7" :fill="color" />
      <!-- Keyhole -->
      <rect x="5" y="6" width="2" height="2" fill="#EBF1F6" />
      <rect x="5" y="8" width="2" height="2" fill="#EBF1F6" />
    </template>

    <!-- MAIL -->
    <template v-else-if="name === 'mail'">
      <!-- Outline -->
      <rect x="0" y="2" width="12" height="8" :fill="color" />
      <rect x="1" y="3" width="10" height="6" fill="#F8FAFC" />
      <!-- Flap -->
      <rect x="1" y="3" width="2" height="1" :fill="color" />
      <rect x="9" y="3" width="2" height="1" :fill="color" />
      <rect x="2" y="4" width="2" height="1" :fill="color" />
      <rect x="8" y="4" width="2" height="1" :fill="color" />
      <rect x="4" y="5" width="4" height="1" :fill="color" />
      <rect x="5" y="6" width="2" height="1" :fill="color" />
    </template>

    <!-- EYE -->
    <template v-else-if="name === 'eye'">
      <rect x="4" y="2" width="4" height="1" :fill="color" />
      <rect x="2" y="3" width="2" height="1" :fill="color" />
      <rect x="8" y="3" width="2" height="1" :fill="color" />
      <rect x="0" y="4" width="2" height="4" :fill="color" />
      <rect x="10" y="4" width="2" height="4" :fill="color" />
      <rect x="2" y="8" width="2" height="1" :fill="color" />
      <rect x="8" y="8" width="2" height="1" :fill="color" />
      <rect x="4" y="9" width="4" height="1" :fill="color" />
      <!-- Pupil -->
      <rect x="4" y="4" width="4" height="4" :fill="color" />
      <rect x="5" y="5" width="1" height="1" fill="#F8FAFC" />
    </template>

    <!-- EYE-OFF -->
    <template v-else-if="name === 'eye-off'">
      <!-- Slash -->
      <rect x="1" y="1" width="2" height="2" :fill="color" />
      <rect x="3" y="3" width="2" height="2" :fill="color" />
      <rect x="5" y="5" width="2" height="2" :fill="color" />
      <rect x="7" y="7" width="2" height="2" :fill="color" />
      <rect x="9" y="9" width="2" height="2" :fill="color" />
      <!-- Partial eye -->
      <rect x="4" y="2" width="4" height="1" :fill="color" />
      <rect x="2" y="3" width="2" height="1" :fill="color" />
      <rect x="8" y="3" width="2" height="1" :fill="color" />
      <rect x="0" y="5" width="2" height="2" :fill="color" />
      <rect x="10" y="5" width="2" height="2" :fill="color" />
      <rect x="2" y="8" width="2" height="1" :fill="color" />
      <rect x="4" y="9" width="4" height="1" :fill="color" />
    </template>

    <!-- ALERT -->
    <template v-else-if="name === 'alert'">
      <!-- Triangle -->
      <rect x="5" y="0" width="2" height="2" :fill="color" />
      <rect x="4" y="2" width="1" height="2" :fill="color" />
      <rect x="7" y="2" width="1" height="2" :fill="color" />
      <rect x="3" y="4" width="1" height="2" :fill="color" />
      <rect x="8" y="4" width="1" height="2" :fill="color" />
      <rect x="2" y="6" width="1" height="2" :fill="color" />
      <rect x="9" y="6" width="1" height="2" :fill="color" />
      <rect x="1" y="8" width="1" height="2" :fill="color" />
      <rect x="10" y="8" width="1" height="2" :fill="color" />
      <rect x="0" y="10" width="12" height="2" :fill="color" />
      <!-- Mark -->
      <rect x="5" y="4" width="2" height="3" :fill="color" />
      <rect x="5" y="8" width="2" height="2" :fill="color" />
    </template>

    <!-- DASHBOARD -->
    <template v-else-if="name === 'dashboard'">
      <rect x="0" y="0" width="5" height="5" :fill="color" />
      <rect x="7" y="0" width="5" height="5" :fill="color" />
      <rect x="0" y="7" width="5" height="5" :fill="color" />
      <rect x="7" y="7" width="5" height="5" :fill="color" />
    </template>

    <!-- TICKET -->
    <template v-else-if="name === 'ticket'">
      <rect x="0" y="2" width="12" height="8" :fill="color" />
      <!-- Left notch -->
      <rect x="0" y="5" width="2" height="2" fill="#EBF1F6" />
      <!-- Right notch -->
      <rect x="10" y="5" width="2" height="2" fill="#EBF1F6" />
      <!-- Inner dashes -->
      <rect x="4" y="3" width="1" height="6" fill="#F8FAFC" />
      <rect x="6" y="3" width="1" height="6" fill="#F8FAFC" />
      <rect x="8" y="3" width="2" height="6" fill="#F8FAFC" />
    </template>

    <!-- LOGOUT -->
    <template v-else-if="name === 'logout'">
      <!-- Door frame -->
      <rect x="0" y="0" width="7" height="2" :fill="color" />
      <rect x="0" y="2" width="2" height="8" :fill="color" />
      <rect x="0" y="10" width="7" height="2" :fill="color" />
      <!-- Arrow shaft -->
      <rect x="4" y="5" width="6" height="2" :fill="color" />
      <!-- Arrow tip -->
      <rect x="8" y="3" width="2" height="1" :fill="color" />
      <rect x="9" y="4" width="2" height="1" :fill="color" />
      <rect x="9" y="7" width="2" height="1" :fill="color" />
      <rect x="8" y="8" width="2" height="1" :fill="color" />
    </template>

    <!-- CODE -->
    <template v-else-if="name === 'code'">
      <!-- < -->
      <rect x="3" y="2" width="1" height="1" :fill="color" />
      <rect x="2" y="3" width="1" height="1" :fill="color" />
      <rect x="1" y="4" width="1" height="2" :fill="color" />
      <rect x="2" y="6" width="1" height="1" :fill="color" />
      <rect x="3" y="7" width="1" height="1" :fill="color" />
      <!-- > -->
      <rect x="8" y="2" width="1" height="1" :fill="color" />
      <rect x="9" y="3" width="1" height="1" :fill="color" />
      <rect x="10" y="4" width="1" height="2" :fill="color" />
      <rect x="9" y="6" width="1" height="1" :fill="color" />
      <rect x="8" y="7" width="1" height="1" :fill="color" />
      <!-- / -->
      <rect x="6" y="2" width="1" height="2" :fill="color" />
      <rect x="5" y="4" width="1" height="2" :fill="color" />
      <rect x="4" y="6" width="1" height="2" :fill="color" />
    </template>

    <!-- CHECK -->
    <template v-else-if="name === 'check'">
      <rect x="1" y="6" width="2" height="2" :fill="color" />
      <rect x="3" y="7" width="2" height="2" :fill="color" />
      <rect x="5" y="5" width="2" height="2" :fill="color" />
      <rect x="7" y="3" width="2" height="2" :fill="color" />
      <rect x="9" y="1" width="2" height="2" :fill="color" />
    </template>

    <!-- USER -->
    <template v-else-if="name === 'user'">
      <!-- Head -->
      <rect x="4" y="1" width="4" height="4" :fill="color" />
      <!-- Body / Shoulders -->
      <rect x="3" y="6" width="6" height="1" :fill="color" />
      <rect x="1" y="7" width="10" height="4" :fill="color" />
    </template>
  </svg>
</template>
