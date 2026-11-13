<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    bob?: boolean
  }>(),
  {
    size: 96,
    bob: false,
  },
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    shape-rendering="crispEdges"
    role="img"
    aria-label="Pixi, robot de incidencias"
    :class="bob ? 'mascot-bob' : undefined"
  >
    <!-- Antenna beacon (dynamic accent) -->
    <rect x="7" y="0" width="2" height="1" fill="var(--color-accent-400, #38bdf8)" />

    <!-- Antenna stem and base -->
    <rect x="7" y="1" width="2" height="1" fill="#1E293B" />
    <rect x="6" y="2" width="4" height="1" fill="#1E293B" />

    <!-- Head chassis outline -->
    <rect x="3" y="3" width="10" height="1" fill="#1E293B" />
    <rect x="3" y="4" width="1" height="4" fill="#1E293B" />
    <rect x="12" y="4" width="1" height="4" fill="#1E293B" />
    <rect x="3" y="8" width="10" height="1" fill="#1E293B" />

    <!-- Head chassis fill (silver & highlight) -->
    <rect x="4" y="3" width="8" height="1" fill="#CBD5E1" />
    <rect x="4" y="3" width="2" height="1" fill="#F1F5F9" />
    <rect x="4" y="7" width="8" height="1" fill="#CBD5E1" />

    <!-- Ear bolts / side antennas (dynamic accent & ink) -->
    <rect x="1" y="4" width="1" height="3" fill="var(--color-accent-400, #38bdf8)" />
    <rect x="2" y="4" width="1" height="3" fill="#1E293B" />
    <rect x="13" y="4" width="1" height="3" fill="#1E293B" />
    <rect x="14" y="4" width="1" height="3" fill="var(--color-accent-400, #38bdf8)" />

    <!-- Visor screen (deep slate) -->
    <rect x="4" y="4" width="8" height="3" fill="#0F172A" />

    <!-- Glowing digital pixel eyes (dynamic accent & white shine) -->
    <rect x="5" y="5" width="2" height="2" fill="var(--color-accent-400, #38bdf8)" />
    <rect x="5" y="5" width="1" height="1" fill="#FFFFFF" />
    <rect x="9" y="5" width="2" height="2" fill="var(--color-accent-400, #38bdf8)" />
    <rect x="9" y="5" width="1" height="1" fill="#FFFFFF" />

    <!-- Speaker grill on chin -->
    <rect x="6" y="7" width="1" height="1" fill="#1E293B" />
    <rect x="8" y="7" width="1" height="1" fill="#1E293B" />

    <!-- Neck joint -->
    <rect x="6" y="9" width="4" height="1" fill="#1E293B" />
    <rect x="7" y="9" width="2" height="1" fill="#64748B" />

    <!-- Torso outline -->
    <rect x="2" y="10" width="12" height="1" fill="#1E293B" />
    <rect x="2" y="11" width="1" height="3" fill="#1E293B" />
    <rect x="13" y="11" width="1" height="3" fill="#1E293B" />
    <rect x="3" y="14" width="10" height="1" fill="#1E293B" />

    <!-- Torso fill (silver armor) -->
    <rect x="3" y="11" width="10" height="3" fill="#CBD5E1" />
    <rect x="3" y="10" width="2" height="1" fill="#F1F5F9" />

    <!-- Lower torso shadow -->
    <rect x="3" y="13" width="10" height="1" fill="#94A3B8" />
    <rect x="5" y="13" width="6" height="1" fill="#1E293B" />

    <!-- Chest diagnostic panel / screen -->
    <rect x="5" y="11" width="6" height="2" fill="#0F172A" />
    <!-- Status LEDs -->
    <rect x="6" y="11" width="1" height="1" fill="var(--color-accent-400, #38bdf8)" />
    <rect x="7" y="11" width="1" height="1" fill="#2DD4BF" />
    <rect x="9" y="11" width="1" height="1" fill="#94A3B8" />
    <!-- Terminal prompt '> -' -->
    <rect x="6" y="12" width="1" height="1" fill="var(--color-accent-400, #38bdf8)" />
    <rect x="8" y="12" width="2" height="1" fill="var(--color-accent-500, #0ea5e9)" />

    <!-- Feet / Boots -->
    <rect x="4" y="14" width="2" height="1" fill="#1E293B" />
    <rect x="10" y="14" width="2" height="1" fill="#1E293B" />
    <rect x="3" y="15" width="4" height="1" fill="#1E293B" />
    <rect x="9" y="15" width="4" height="1" fill="#1E293B" />
    <rect x="4" y="15" width="2" height="1" fill="#64748B" />
    <rect x="10" y="15" width="2" height="1" fill="#64748B" />
  </svg>
</template>
