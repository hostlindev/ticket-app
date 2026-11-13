<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@modules/auth/store/auth.store'
import type { UserRole } from '@modules/auth/interface/auth.interface'
import { usePaletteStore, PALETTES, type PaletteId } from '@core/stores/palette.store'
import PixelBuddy from '@core/components/PixelBuddy.vue'

const auth = useAuthStore()
const { user, firstName, userInitials } = storeToRefs(auth)

const paletteStore = usePaletteStore()
const theme = useTheme()

const menuOpen = ref(false)
const dialogOpen = ref(false)

const ROLE_LABELS: Record<UserRole, { label: string; full: string; color: string }> = {
  admin: { label: 'Admin', full: 'Administrador de Plataforma', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  agent: { label: 'Agente', full: 'Agente de Soporte Nivel 2', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  developer: { label: 'Dev', full: 'Desarrollador de Plataformas Web', color: 'bg-accent-100 text-accent-700 border-accent-200' },
}

const roleInfo = computed(() => {
  const role = user.value?.role ?? 'developer'
  return ROLE_LABELS[role] || ROLE_LABELS.developer
})

const assignedApps = computed(() => {
  return user.value?.assignedSystems ?? []
})

const currentPalette = computed(() => PALETTES[paletteStore.current] || PALETTES.celeste)
const paletteList = Object.values(PALETTES)

function selectPalette(id: PaletteId): void {
  paletteStore.applyPalette(id)
  theme.global.name.value = `pixi-${id}`
}

async function handleLogout(): Promise<void> {
  menuOpen.value = false
  await auth.logout()
  window.location.href = '/login'
}

function openFullProfile(): void {
  menuOpen.value = false
  dialogOpen.value = true
}
</script>

<template>
  <div class="relative">
    <!-- Trigger Button in Colored App Bar -->
    <v-menu
      v-model="menuOpen"
      :close-on-content-click="false"
      location="bottom end"
      offset="10"
      transition="slide-y-transition"
    >
      <template #activator="{ props: menuProps }">
        <button
          type="button"
          v-bind="menuProps"
          class="flex items-center gap-2.5 rounded-xl border border-white/25 bg-white/15 px-2.5 py-1.5 text-white shadow-2xs backdrop-blur-xs transition-all hover:bg-white/25 hover:border-white/40 active:scale-98"
          :class="{ 'bg-white/30 border-white/50 shadow-sm': menuOpen }"
          aria-label="Perfil de usuario"
        >
          <!-- Avatar with Online Dot -->
          <div class="relative">
            <v-avatar
              size="32"
              class="border-2 border-white/80 bg-white text-accent-700 text-[12px] font-extrabold shadow-xs"
            >
              {{ userInitials }}
            </v-avatar>
            <span
              class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-accent-600 bg-emerald-400"
              title="En línea"
            />
          </div>

          <!-- User Name and Compact Role -->
          <div class="hidden text-left sm:block">
            <span class="block max-w-[140px] truncate text-[12.5px] font-bold leading-tight text-white">
              {{ firstName }}
            </span>
            <span class="block max-w-[140px] truncate text-[10.5px] font-medium text-white/80">
              {{ user?.department ?? 'Soporte Web' }}
            </span>
          </div>

          <v-icon
            icon="mdi-chevron-down"
            size="16"
            class="hidden text-white/80 transition-transform duration-200 sm:block"
            :class="{ 'rotate-180 text-white': menuOpen }"
          />
        </button>
      </template>

      <!-- Dropdown Card -->
      <div class="w-[min(21rem,calc(100vw-1.5rem))] rounded-2xl border-2 border-silver-300 bg-white p-4 shadow-xl text-ink-900">
        <!-- User Header Details -->
        <div class="flex items-start gap-3 pb-3 border-b border-silver-200">
          <div class="relative shrink-0">
            <v-avatar
              size="44"
              class="border-2 border-accent-300 bg-accent-600 text-sm font-extrabold text-white shadow-xs"
            >
              {{ userInitials }}
            </v-avatar>
            <span
              class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
            />
          </div>

          <div class="min-w-0 flex-1">
            <h4 class="truncate text-sm font-bold text-ink-900">{{ user?.name ?? 'Usuario' }}</h4>
            <p class="truncate text-[11.5px] text-ink-500">{{ user?.email }}</p>
            <div class="mt-1 flex items-center gap-1.5 flex-wrap">
              <span
                class="inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                :class="roleInfo.color"
              >
                {{ roleInfo.label }}
              </span>
              <span class="text-[10.5px] text-ink-500 font-medium truncate">
                {{ user?.department ?? 'Frontend & Web Platforms' }}
              </span>
            </div>
          </div>
        </div>

        <!-- PALETTE CHANGER SECTION (Botón de cambio de paleta en perfil) -->
        <div class="py-3 border-b border-silver-200">
          <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2.5">
            <span class="flex items-center gap-1.5">
              <v-icon icon="mdi-palette-outline" size="14" class="text-accent-600" />
              <span>Paleta del Sistema</span>
            </span>
            <span class="text-accent-600 font-extrabold capitalize">{{ currentPalette.label }}</span>
          </div>

          <!-- Color swatches grid -->
          <div class="grid grid-cols-3 gap-1.5 min-[360px]:grid-cols-6">
            <button
              v-for="p in paletteList"
              :key="p.id"
              type="button"
              class="group relative flex flex-col items-center gap-1 p-1 rounded-lg border transition-all"
              :class="
                paletteStore.current === p.id
                  ? 'border-accent-500 bg-accent-50/80 shadow-xs ring-2 ring-accent-400/50'
                  : 'border-silver-200 hover:border-silver-300 hover:bg-silver-50'
              "
              :title="`Activar paleta ${p.label}`"
              @click="selectPalette(p.id)"
            >
              <span
                class="h-6 w-6 rounded-full border border-black/10 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs"
                :style="{ backgroundColor: p.color }"
              >
                <v-icon
                  v-if="paletteStore.current === p.id"
                  icon="mdi-check"
                  size="13"
                  class="text-white drop-shadow-xs"
                />
              </span>
              <span class="text-[9px] font-bold text-ink-600 truncate max-w-full">
                {{ p.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- Supervised Web Apps Quick View -->
        <div class="py-3 border-b border-silver-200">
          <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2">
            <span>Apps Web Asignadas</span>
            <span class="text-accent-600 font-extrabold">{{ assignedApps.length }} activas</span>
          </div>
          <p v-if="!assignedApps.length" class="text-[12px] text-ink-500">Sin apps asignadas.</p>
          <div class="max-h-36 space-y-1.5 overflow-y-auto">
            <div
              v-for="app in assignedApps"
              :key="app"
              class="flex items-center gap-2 rounded-lg bg-silver-50 px-2.5 py-1.5 text-[12px] font-semibold text-ink-700 border border-silver-200/80"
            >
              <v-icon icon="mdi-web" size="14" class="text-accent-600 shrink-0" />
              <span class="truncate">{{ app }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions in Dropdown -->
        <div class="pt-3 space-y-2">
          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 rounded-xl border border-silver-300 bg-white px-3 py-2 text-[12px] font-bold text-ink-800 transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700 shadow-2xs"
            @click="openFullProfile"
          >
            <v-icon icon="mdi-account-details-outline" size="16" />
            <span>Ver perfil completo</span>
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 text-[12px] font-bold text-red-700 transition-colors hover:bg-red-100 shadow-2xs"
            @click="handleLogout"
          >
            <v-icon icon="mdi-logout" size="16" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </v-menu>

    <!-- Full Profile Dialog Modal -->
    <v-dialog v-model="dialogOpen" max-width="520">
      <div class="max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-silver-300 bg-white p-4 sm:p-6 shadow-2xl text-ink-900">
        <!-- Modal Header with Pixi Mascot -->
        <div class="flex items-start justify-between border-b border-silver-200 pb-4">
          <div class="flex items-center gap-3">
            <div class="grid h-12 w-12 place-items-center rounded-xl border-2 border-accent-600 bg-accent-500 text-white shadow-xs">
              <PixelBuddy :size="30" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-ink-900">Ficha del Especialista</h3>
              <p class="text-[12px] text-ink-500 font-mono">ID: {{ user?.id ?? 'USR-001' }}</p>
            </div>
          </div>

          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-silver-100 hover:text-ink-900 transition-colors"
            @click="dialogOpen = false"
          >
            <v-icon icon="mdi-close" size="18" />
          </button>
        </div>

        <!-- Modal Body: Key Information Grid -->
        <div class="mt-4 space-y-4 text-[13px]">
          <!-- Personal Info Card -->
          <div class="rounded-xl border border-silver-200 bg-silver-50/80 p-3.5 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-ink-500 text-[12px]">Nombre Completo</span>
              <span class="font-bold text-ink-900">{{ user?.name }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-ink-500 text-[12px]">Correo Institucional</span>
              <span class="font-bold text-ink-900 font-mono text-[12px]">{{ user?.email }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-ink-500 text-[12px]">Rol en Plataforma</span>
              <span
                class="rounded border px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider"
                :class="roleInfo.color"
              >
                {{ roleInfo.full }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-ink-500 text-[12px]">Departamento</span>
              <span class="font-bold text-ink-800">{{ user?.department ?? 'Frontend & Web Platforms' }}</span>
            </div>
          </div>

          <!-- Color Palette Picker in Modal -->
          <div class="rounded-xl border border-silver-200 bg-white p-3.5">
            <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2">
              <span class="flex items-center gap-1.5">
                <v-icon icon="mdi-palette-outline" size="14" class="text-accent-600" />
                <span>Paleta de Colores Activa</span>
              </span>
              <span class="text-accent-600 font-extrabold capitalize">{{ currentPalette.label }}</span>
            </div>

            <div class="grid grid-cols-3 gap-2 min-[400px]:grid-cols-6">
              <button
                v-for="p in paletteList"
                :key="p.id"
                type="button"
                class="group flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all"
                :class="
                  paletteStore.current === p.id
                    ? 'border-accent-500 bg-accent-50/80 shadow-xs ring-2 ring-accent-400/50'
                    : 'border-silver-200 hover:border-silver-300 hover:bg-silver-50'
                "
                @click="selectPalette(p.id)"
              >
                <span
                  class="h-7 w-7 rounded-full border border-black/10 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs"
                  :style="{ backgroundColor: p.color }"
                >
                  <v-icon
                    v-if="paletteStore.current === p.id"
                    icon="mdi-check"
                    size="15"
                    class="text-white drop-shadow-xs"
                  />
                </span>
                <span class="text-[10px] font-bold text-ink-700">
                  {{ p.label }}
                </span>
              </button>
            </div>
          </div>

          <!-- Supervised Web Apps -->
          <div>
            <h5 class="text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-2">
              Aplicaciones Web Monitoreadas
            </h5>
            <div class="max-h-56 space-y-1.5 overflow-y-auto">
              <div
                v-for="app in assignedApps"
                :key="app"
                class="flex items-center justify-between rounded-lg border border-silver-200 bg-white p-2.5 shadow-2xs"
              >
                <div class="flex items-center gap-2">
                  <v-icon icon="mdi-web" size="15" class="text-accent-600" />
                  <span class="font-semibold text-ink-800">{{ app }}</span>
                </div>
                <span class="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10.5px] font-bold">
                  Activo
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="mt-5 flex justify-end gap-2 border-t border-silver-200 pt-3">
          <button
            type="button"
            class="rounded-xl border border-silver-300 bg-white px-4 py-2 text-xs font-bold text-ink-700 hover:bg-silver-100 transition-colors shadow-2xs"
            @click="dialogOpen = false"
          >
            Cerrar
          </button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>
