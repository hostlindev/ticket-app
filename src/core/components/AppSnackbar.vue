<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore } from '@core/stores/ui.store'

const ui = useUiStore()
const { toast } = storeToRefs(ui)

const visible = computed({
  get: () => toast.value.visible,
  set: (value: boolean) => {
    if (!value) ui.dismiss()
  },
})
</script>

<template>
  <v-snackbar
    v-model="visible"
    :color="toast.color"
    :timeout="toast.timeout"
    location="bottom right"
    rounded="lg"
  >
    <span class="text-sm">{{ toast.message }}</span>

    <template #actions>
      <v-btn variant="text" size="small" @click="ui.dismiss()">Cerrar</v-btn>
    </template>
  </v-snackbar>
</template>
