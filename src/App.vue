<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import AppSnackbar from '@core/components/AppSnackbar.vue'
import { usePaletteStore } from '@core/stores/palette.store'

const paletteStore = usePaletteStore()
const theme = useTheme()

onMounted(() => {
  paletteStore.initPalette()
  theme.global.name.value = `pixi-${paletteStore.current}`
})
</script>

<template>
  <v-app>
    <RouterView />
    <AppSnackbar />
  </v-app>
</template>
