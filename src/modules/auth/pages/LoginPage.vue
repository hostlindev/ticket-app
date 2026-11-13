<script setup lang="ts">
import AuthLayout from '@core/layouts/AuthLayout.vue'
import PixelHeart from '@core/components/PixelHeart.vue'
import { brand } from '@core/config/brand'
import BrandPanel from '../components/BrandPanel.vue'
import LoginForm from '../components/LoginForm.vue'

const currentYear = new Date().getFullYear()
</script>

<template>
  <AuthLayout>
    <template #brand>
      <BrandPanel />
    </template>

    <LoginForm />

    <template #footer>
      <div
        class="flex flex-col items-center justify-center gap-1 text-[11.5px] font-semibold text-ink-500 sm:flex-row sm:gap-2"
      >
        <span>© {{ currentYear }} {{ brand.name }}</span>
        <span class="hidden sm:inline" aria-hidden="true">·</span>
        <span class="inline-flex items-center gap-1.5">
          Hecho con <PixelHeart :size="11" /> para el equipo de desarrollo
        </span>
      </div>
    </template>
  </AuthLayout>
</template>
