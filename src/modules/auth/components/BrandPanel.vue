<script setup lang="ts">
import PixelBuddy from '@core/components/PixelBuddy.vue'
import PixelIcon, { type PixelIconName } from '@core/components/PixelIcon.vue'
import { brand } from '@core/config/brand'

const features: Array<{ icon: PixelIconName; title: string; text: string }> = [
  { icon: 'bug', title: 'Lo urgente primero', text: 'Los reportes se ordenan por prioridad para que sepas por dónde empezar.' },
  { icon: 'clock', title: 'Sin llegar tarde', text: 'Mira cuáles reportes están por vencer su tiempo de respuesta.' },
  { icon: 'user', title: 'Qué le pasó al usuario', text: 'Ve qué falló, en qué pantalla y desde dónde lo reportó.' },
]
</script>

<template>
  <div class="flex h-full w-full flex-col justify-between gap-10">
    <header class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div
          class="grid h-12 w-12 place-items-center rounded-[8px] border-2 border-ink-900 bg-silver-50 shadow-[3px_3px_0_#1e293b]"
        >
          <PixelBuddy :size="32" />
        </div>
        <div>
          <p class="font-pixel text-2xl leading-none text-ink-900">{{ brand.name }}</p>
          <p class="mt-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-500">
            {{ brand.spirit }}
          </p>
        </div>
      </div>
    </header>

    <section class="max-w-[540px]">
      <p class="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">
        <PixelIcon name="shield" :size="14" class="text-accent-600" />
        panel del equipo
      </p>

      <h2 class="font-pixel text-[38px] leading-[1.08] text-ink-900 xl:text-[46px]">
        Los reportes de tus usuarios,
        <span class="relative inline-block text-accent-600">
          en un solo lugar.
          <span class="absolute -bottom-1 left-0 h-1.5 w-full bg-accent-300/60" aria-hidden="true" />
        </span>
      </h2>

      <p class="mt-5 max-w-[470px] text-[15px] leading-relaxed text-ink-500">
        Entérate de qué fallas encuentran las personas que usan tus sistemas, qué tan urgentes son
        y quién las está atendiendo.
      </p>

      <!-- Pixi habla -->
      <div class="mt-8 flex items-end gap-4">
        <PixelBuddy :size="84" bob class="shrink-0" />
        <div
          class="relative mb-3 rounded-[10px] border-2 border-ink-900 bg-silver-50 px-4 py-3 shadow-[5px_5px_0_var(--shadow-accent)]"
        >
          <!-- Cola de la burbuja -->
          <span
            class="absolute -left-[9px] bottom-4 size-4 rotate-45 border-b-2 border-l-2 border-ink-900 bg-silver-50"
            aria-hidden="true"
          />
          <p class="font-pixel text-lg leading-tight text-ink-900">
            ¡Hola! Soy Pixi
            <span class="caret-blink ml-1 inline-block h-[1.1em] w-[3px] translate-y-[3px] bg-accent-500" aria-hidden="true" />
          </p>
          <p class="mt-1 text-[13px] leading-relaxed text-ink-500">
            Entra y te muestro qué reportaron hoy tus usuarios.
          </p>
        </div>
      </div>

      <div class="mt-8 grid gap-3 sm:grid-cols-3">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-[8px] border-2 border-ink-900 bg-silver-50 p-3.5 shadow-[3px_3px_0_#cbd5e1] transition-transform hover:-translate-y-0.5"
        >
          <span class="grid size-8 place-items-center rounded-[6px] border-2 border-ink-900 bg-accent-200">
            <PixelIcon :name="feature.icon" :size="16" class="text-ink-900" />
          </span>
          <p class="mt-2.5 font-pixel text-[15px] leading-tight text-ink-900">{{ feature.title }}</p>
          <p class="mt-1 text-[12px] leading-snug text-ink-500">{{ feature.text }}</p>
        </div>
      </div>
    </section>

    <footer class="flex flex-wrap items-center justify-between gap-3">
      <p class="flex items-center gap-1.5 text-[12px] font-semibold text-ink-500">
        <PixelIcon name="code" :size="14" class="text-accent-600" />
        Hecho para el equipo de desarrollo.
      </p>
      <span class="rounded-full border-2 border-ink-900 bg-accent-100 px-2.5 py-0.5 font-pixel text-[12px] text-ink-700">
        v1.0
      </span>
    </footer>
  </div>
</template>
