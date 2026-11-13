<script setup lang="ts">
import PixelBuddy from '@core/components/PixelBuddy.vue'
import PalettePicker from '@core/components/PalettePicker.vue'
import { brand } from '@core/config/brand'

defineSlots<{
  brand: () => unknown
  default: () => unknown
  footer?: () => unknown
}>()
</script>

<template>
  <div class="relative flex min-h-screen flex-col overflow-hidden bg-silver-100">
    <div class="pixel-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
    <div
      class="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent-300/35 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-silver-400/25 blur-3xl"
      aria-hidden="true"
    />

    <span class="pixel-sparkle left-[3%] top-[60%] hidden lg:block" aria-hidden="true" />
    <span
      class="pixel-sparkle left-[46%] top-[30%] hidden lg:block [animation-delay:1.1s]"
      aria-hidden="true"
    />
    <span
      class="pixel-sparkle bottom-[24%] left-[40%] hidden lg:block [animation-delay:2.1s]"
      aria-hidden="true"
    />

    <span class="pixel-sparkle right-[6%] top-[22%] hidden lg:block [animation-delay:0.6s]" aria-hidden="true" />
    <span class="pixel-sparkle bottom-[14%] right-[10%] hidden lg:block [animation-delay:1.6s]" aria-hidden="true" />

    <!-- Selector de paleta (único, siempre accesible) -->
    <div class="absolute right-4 top-4 z-30 sm:right-8 sm:top-6">
      <PalettePicker />
    </div>

    <div class="relative z-10 flex flex-1 flex-col lg:flex-row">
      <aside class="hidden px-12 py-10 lg:flex lg:w-1/2 xl:px-20 xl:py-14">
        <slot name="brand" />
      </aside>

      <main class="flex flex-1 items-center justify-center px-5 pb-8 pt-20 sm:px-8 lg:px-12 lg:py-10">
        <div class="w-full max-w-[460px]">
          <div class="mb-7 flex items-center gap-2.5 lg:hidden">
            <span
              class="grid h-11 w-11 place-items-center rounded-[8px] border-2 border-ink-900 bg-silver-50 shadow-[3px_3px_0_#1e293b]"
            >
              <PixelBuddy :size="28" />
            </span>
            <span>
              <span class="block font-pixel text-2xl leading-none text-ink-900">
                {{ brand.name }}
              </span>
              <span
                class="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500"
              >
                {{ brand.spirit }}
              </span>
            </span>
          </div>

          <slot />
        </div>
      </main>
    </div>

    <footer class="relative z-10 px-5 pb-6 pt-2">
      <slot name="footer" />
    </footer>
  </div>
</template>
