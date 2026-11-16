<script setup lang="ts">
/**
 * Pixi: mismo robot cartoon pixel-art que el widget Pixibot, con las mismas
 * animaciones por partes (caminar, saltar, parpadear). `bob` lo mantiene
 * animado; sin `bob` queda quieto y solo camina al pasar el mouse.
 */
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
    aria-label="Pixibot, robot de incidencias"
    class="pxb-robot"
    :class="bob ? 'is-alive' : 'is-idle'"
  >
    <g class="leg legL">
      <rect x="5" y="14" width="2" height="1" fill="#1E293B" />
      <rect x="4" y="15" width="3" height="1" fill="#1E293B" />
      <rect x="5" y="14" width="1" height="1" fill="#CBD5E1" />
    </g>
    <g class="leg legR">
      <rect x="9" y="14" width="2" height="1" fill="#1E293B" />
      <rect x="9" y="15" width="3" height="1" fill="#1E293B" />
      <rect x="9" y="14" width="1" height="1" fill="#CBD5E1" />
    </g>

    <g class="all">
      <g class="arm armL">
        <rect x="2" y="10" width="2" height="3" fill="#1E293B" />
        <rect x="2" y="10" width="1" height="2" fill="#CBD5E1" />
        <rect x="2" y="12" width="2" height="1" fill="var(--color-accent-400, #38bdf8)" />
      </g>
      <g class="arm armR">
        <rect x="12" y="10" width="2" height="3" fill="#1E293B" />
        <rect x="13" y="10" width="1" height="2" fill="#94A3B8" />
        <rect x="12" y="12" width="2" height="1" fill="var(--color-accent-400, #38bdf8)" />
      </g>

      <g class="torso">
        <rect x="4" y="10" width="8" height="4" fill="#1E293B" />
        <rect x="5" y="10" width="6" height="3" fill="#E2E8F0" />
        <rect x="5" y="12" width="6" height="1" fill="#94A3B8" />
        <rect x="5" y="10" width="2" height="1" fill="#F8FAFC" />
        <g class="leds">
          <rect x="7" y="11" width="2" height="1" fill="var(--color-accent-400, #38bdf8)" />
        </g>
      </g>

      <g class="head">
        <g class="antenna">
          <rect x="7" y="2" width="2" height="1" fill="#1E293B" />
          <rect x="6" y="0" width="4" height="2" fill="#1E293B" />
          <rect x="7" y="0" width="2" height="2" fill="var(--color-accent-400, #38bdf8)" />
          <rect x="7" y="0" width="1" height="1" fill="#FFFFFF" />
        </g>
        <rect x="3" y="3" width="10" height="7" fill="#1E293B" />
        <rect x="2" y="4" width="12" height="5" fill="#1E293B" />
        <rect x="3" y="4" width="10" height="5" fill="#E2E8F0" />
        <rect x="4" y="3" width="8" height="1" fill="#E2E8F0" />
        <rect x="4" y="3" width="3" height="1" fill="#F8FAFC" />
        <rect x="3" y="8" width="10" height="1" fill="#CBD5E1" />
        <rect x="4" y="9" width="8" height="1" fill="#1E293B" />
        <rect x="4" y="4" width="8" height="4" fill="#0F172A" />
        <g class="eyes">
          <rect x="5" y="5" width="2" height="2" fill="var(--color-accent-400, #38bdf8)" />
          <rect x="5" y="5" width="1" height="1" fill="#FFFFFF" />
          <rect x="9" y="5" width="2" height="2" fill="var(--color-accent-400, #38bdf8)" />
          <rect x="9" y="5" width="1" height="1" fill="#FFFFFF" />
        </g>
        <rect x="4" y="7" width="1" height="1" fill="#FB7185" />
        <rect x="11" y="7" width="1" height="1" fill="#FB7185" />
        <rect x="7" y="7" width="2" height="1" fill="#64748B" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.pxb-robot {
  image-rendering: pixelated;
  overflow: visible;
  transform-origin: 50% 100%;
  --step: 1.1s;
}
.pxb-robot g {
  transform-box: fill-box;
}

/* Las partes solo se mueven cuando está "vivo" o al pasar el mouse. */
.is-alive,
.is-idle:hover {
  --step: 1.1s;
}
.is-idle:hover {
  --step: 0.45s;
}
.is-alive {
  animation: pxb-hop 3.6s ease-in-out 1s infinite;
}
.is-idle:hover {
  animation: pxb-hop 1.2s ease-in-out infinite;
}
:is(.is-alive, .is-idle:hover) .all {
  transform-origin: 50% 100%;
  animation: pxb-walk-body var(--step) ease-in-out infinite;
}
:is(.is-alive, .is-idle:hover) .head {
  transform-origin: 50% 100%;
  animation: pxb-head-tilt calc(var(--step) * 2) ease-in-out infinite;
}
:is(.is-alive, .is-idle:hover) .antenna {
  transform-origin: 50% 100%;
  animation: pxb-antenna calc(var(--step) * 2) ease-in-out 0.15s infinite;
}
.arm {
  transform-origin: 50% 8%;
}
:is(.is-alive, .is-idle:hover) .armL {
  animation: pxb-swing var(--step) ease-in-out infinite;
}
:is(.is-alive, .is-idle:hover) .armR {
  animation: pxb-swing var(--step) ease-in-out calc(var(--step) / -2) infinite;
}
:is(.is-alive, .is-idle:hover) .leg {
  animation: pxb-step var(--step) ease-in-out infinite;
}
:is(.is-alive, .is-idle:hover) .legR {
  animation-delay: calc(var(--step) / -2);
}
.eyes {
  transform-origin: 50% 50%;
}
:is(.is-alive, .is-idle:hover) .eyes {
  animation:
    pxb-blink 4.5s infinite,
    pxb-look 7s ease-in-out infinite;
}
:is(.is-alive, .is-idle:hover) .leds {
  animation: pxb-led 1.2s steps(2) infinite;
}

@keyframes pxb-walk-body {
  0%, 50%, 100% { transform: translateY(0) scale(1.05, 0.94); }
  25%, 75% { transform: translateY(-1px) scale(0.97, 1.04); }
}
@keyframes pxb-head-tilt {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
@keyframes pxb-antenna {
  0%, 100% { transform: rotate(10deg) scaleY(1); }
  50% { transform: rotate(-10deg) scaleY(0.85); }
}
@keyframes pxb-swing {
  0%, 100% { transform: rotate(-28deg); }
  50% { transform: rotate(28deg); }
}
@keyframes pxb-step {
  0%, 50%, 100% { transform: translateY(0); }
  25% { transform: translateY(-1px); }
}
@keyframes pxb-hop {
  0%, 55%, 100% { transform: translateY(0) scale(1); }
  62% { transform: translateY(0) scale(1.12, 0.84); }
  72% { transform: translateY(-5px) scale(0.92, 1.12); }
  84% { transform: translateY(0) scale(1.1, 0.88); }
  92% { transform: translateY(0) scale(0.97, 1.03); }
}
@keyframes pxb-blink {
  0%, 92%, 100% { scale: 1 1; }
  95% { scale: 1 0.1; }
}
@keyframes pxb-look {
  0%, 30%, 100% { translate: 0 0; }
  40%, 55% { translate: -0.5px 0; }
  65%, 80% { translate: 0.5px 0; }
}
@keyframes pxb-led {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

@media (prefers-reduced-motion: reduce) {
  .pxb-robot,
  .pxb-robot * {
    animation: none !important;
  }
}
</style>
