<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { usePaletteStore, PALETTES, type PaletteId } from '@core/stores/palette.store'

const paletteStore = usePaletteStore()
const theme = useTheme()

const currentPalette = computed(() => PALETTES[paletteStore.current] || PALETTES.celeste)
const paletteList = Object.values(PALETTES)

function selectPalette(id: PaletteId): void {
  paletteStore.applyPalette(id)
  theme.global.name.value = `pixi-${id}`
}
</script>

<template>
  <v-menu location="bottom end" :close-on-content-click="true" transition="scale-transition">
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        v-bind="menuProps"
        class="inline-flex items-center gap-2 rounded-lg border border-accent-500 bg-accent-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm shadow-accent-500/25 transition-all hover:bg-accent-700 active:scale-95"
        aria-label="Seleccionar paleta de colores"
      >
        <span
          class="h-3.5 w-3.5 rounded-full border border-white/60 shadow-xs"
          :style="{ backgroundColor: currentPalette.color }"
          aria-hidden="true"
        />
        <span class="text-[12.5px] font-bold">{{ currentPalette.label }}</span>
        <v-icon icon="mdi-chevron-down" size="15" class="text-white/90" />
      </button>
    </template>

    <div
      class="mt-2 w-52 rounded-xl border border-silver-200 bg-white p-2 shadow-lg"
    >
      <div class="mb-1.5 px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-500">
        Paleta de colores
      </div>

      <div class="flex flex-col gap-0.5">
        <button
          v-for="p in paletteList"
          :key="p.id"
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12.5px] font-medium text-ink-800 transition-colors hover:bg-silver-100"
          :class="{
            '!bg-accent-100/70 !text-accent-700 font-bold': paletteStore.current === p.id,
          }"
          @click="selectPalette(p.id)"
        >
          <span class="flex items-center gap-2.5">
            <span
              class="h-3.5 w-3.5 rounded-full border border-ink-900/20"
              :style="{ backgroundColor: p.color }"
              aria-hidden="true"
            />
            <span>{{ p.label }}</span>
          </span>

          <v-icon
            v-if="paletteStore.current === p.id"
            icon="mdi-check"
            size="14"
            class="text-accent-600"
          />
        </button>
      </div>
    </div>
  </v-menu>
</template>
