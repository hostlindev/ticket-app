<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'
import PixelBuddy from '@core/components/PixelBuddy.vue'
import UserProfileMenu from '@core/components/UserProfileMenu.vue'
import { brand } from '@core/config/brand'
import { navSections, type NavItem } from '@core/config/navigation'
import { useAuthStore } from '@modules/auth/store/auth.store'
import type { UserRole } from '@modules/auth/interface/auth.interface'

withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
  }>(),
  {
    title: '',
    subtitle: '',
  },
)

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  agent: 'Agente de soporte',
  developer: 'Desarrollador',
}

const route = useRoute()
// `md` (840px) evita que el menú se vuelva overlay en tablets y laptops pequeñas,
// donde sí hay espacio para la barra lateral permanente.
const { mobile } = useDisplay({ mobileBreakpoint: 'md' })
const auth = useAuthStore()
const { user, firstName, userInitials } = storeToRefs(auth)

const roleLabel = computed(() => ROLE_LABELS[user.value?.role ?? 'developer'])
// Oculta las opciones (y secciones vacías) que el rol actual no puede abrir.
const visibleSections = computed(() =>
  navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || (user.value && item.roles.includes(user.value.role))),
    }))
    .filter((section) => section.items.length > 0),
)
const sectionTitle = computed(() => (route.meta.title as string | undefined) ?? '')

// Persisted collapsed state for desktop sidebar
const COLLAPSED_STORAGE_KEY = 'pixi_sidebar_collapsed'
const isCollapsed = ref<boolean>(
  typeof window !== 'undefined' ? localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true' : false,
)

const isRail = computed(() => !mobile.value && isCollapsed.value)
const drawer = ref<boolean>(!mobile.value)

// Mantiene el drawer coherente al cambiar de breakpoint (girar tablet, redimensionar).
watch(mobile, (isMobile) => {
  drawer.value = !isMobile
})

function toggleCollapse(): void {
  isCollapsed.value = !isCollapsed.value
  if (typeof window !== 'undefined') {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(isCollapsed.value))
  }
}

function toggleMenu(): void {
  if (mobile.value) drawer.value = !drawer.value
  else toggleCollapse()
}

function isActive(item: NavItem): boolean {
  if (route.name === item.routeName) return true
  return item.to !== '/' && route.path.startsWith(item.to)
}

function closeOnMobile(): void {
  if (mobile.value) drawer.value = false
}

async function handleLogout(): Promise<void> {
  await auth.logout()
  window.location.href = '/login'
}
</script>

<template>
  <div class="min-h-screen bg-silver-100">
    <!-- =========================================================================
         1. MENÚ LATERAL
         ========================================================================= -->
    <v-navigation-drawer
      v-model="drawer"
      id="main-navigation"
      :rail="isRail"
      :rail-width="76"
      :width="264"
      :temporary="mobile"
      :permanent="!mobile"
      class="border-r border-silver-300/80 bg-white"
      :class="mobile ? 'shadow-2xl' : 'shadow-xs'"
      aria-label="Navegación principal"
    >
      <!-- Marca -->
      <template #prepend>
        <div
          class="flex h-16 items-center border-b border-silver-200"
          :class="isRail ? 'justify-center px-2' : 'justify-between px-4'"
        >
          <RouterLink
            to="/"
            class="flex min-w-0 items-center gap-3 rounded-lg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70"
            :aria-label="`${brand.name} · ir al tablero`"
            @click="closeOnMobile"
          >
            <span
              class="grid size-10 shrink-0 place-items-center rounded-lg border-2 border-accent-600 bg-accent-500 text-white shadow-[2px_2px_0_0_var(--shadow-accent)]"
            >
              <PixelBuddy :size="26" />
            </span>
            <span v-if="!isRail" class="min-w-0">
              <span class="block truncate text-lg font-extrabold leading-tight tracking-tight text-ink-900">
                {{ brand.name }}
              </span>
              <span class="block truncate text-[10px] font-bold uppercase tracking-[0.14em] text-accent-600">
                App de Incidencias
              </span>
            </span>
          </RouterLink>

          <button
            v-if="mobile"
            type="button"
            class="grid size-9 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-silver-100 hover:text-ink-900"
            aria-label="Cerrar menú"
            @click="drawer = false"
          >
            <v-icon icon="mdi-close" size="18" />
          </button>
        </div>
      </template>

      <!-- Navegación -->
      <nav class="px-3 py-4" aria-label="Secciones">
        <div v-for="section in visibleSections" :key="section.label" class="mb-4 last:mb-0">
          <div
            v-if="!isRail"
            class="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500"
          >
            {{ section.label }}
          </div>
          <div v-else class="mx-3 mb-2 border-t border-silver-200" aria-hidden="true" />

          <ul class="m-0 list-none space-y-1 p-0">
            <li v-for="item in section.items" :key="item.to">
              <v-tooltip :disabled="!isRail" :text="item.name" location="end" open-delay="150">
                <template #activator="{ props: tipProps }">
                  <RouterLink
                    v-bind="tipProps"
                    :to="item.to"
                    class="group relative flex min-h-11 items-center rounded-lg border no-underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70"
                    :class="[
                      isRail ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 text-[13.5px]',
                      isActive(item)
                        ? 'border-accent-600 bg-accent-600 font-bold text-white shadow-[2px_2px_0_0_var(--shadow-accent)]'
                        : 'border-transparent font-semibold text-ink-700 hover:border-accent-200 hover:bg-accent-100/60 hover:text-accent-700',
                    ]"
                    :aria-current="isActive(item) ? 'page' : undefined"
                    :aria-label="isRail ? item.name : undefined"
                    @click="closeOnMobile"
                  >
                    <v-icon :icon="item.icon" :size="isRail ? 21 : 19" class="nav-icon" />
                    <span v-if="!isRail" class="truncate">{{ item.name }}</span>
                  </RouterLink>
                </template>
              </v-tooltip>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Usuario -->
      <template #append>
        <div class="border-t border-silver-200 p-2.5">
          <div
            v-if="!isRail"
            class="flex items-center gap-2.5 rounded-xl border border-silver-200 bg-silver-50/70 p-2.5"
          >
            <div class="relative shrink-0">
              <v-avatar size="36" class="border-2 border-white bg-accent-600 text-[12px] font-bold text-white shadow-xs">
                {{ userInitials }}
              </v-avatar>
              <span class="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-[12.5px] font-bold leading-tight text-ink-900">{{ firstName }}</p>
              <p class="truncate text-[11px] text-ink-500">{{ roleLabel }}</p>
            </div>
            <button
              type="button"
              class="grid size-8 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              @click="handleLogout"
            >
              <v-icon icon="mdi-logout" size="17" />
            </button>
          </div>

          <div v-else class="flex flex-col items-center gap-2 py-1">
            <v-avatar
              size="36"
              class="border-2 border-white bg-accent-600 text-[12px] font-bold text-white shadow-xs"
              :title="`${firstName} · ${roleLabel}`"
            >
              {{ userInitials }}
            </v-avatar>
            <button
              type="button"
              class="grid size-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-red-50 hover:text-red-700"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              @click="handleLogout"
            >
              <v-icon icon="mdi-logout" size="18" />
            </button>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- =========================================================================
         2. BARRA SUPERIOR
         ========================================================================= -->
    <v-app-bar
      color="primary"
      flat
      height="64"
      class="border-b border-white/20 bg-accent-600 px-2 text-white shadow-xs transition-colors duration-300 sm:px-5"
    >
      <div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          class="grid size-10 shrink-0 place-items-center rounded-lg border border-white/20 bg-white/10 text-white shadow-2xs transition-all hover:border-white/30 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:size-9"
          :aria-label="mobile ? 'Abrir menú' : isCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'"
          aria-controls="main-navigation"
          :aria-expanded="mobile ? drawer : !isCollapsed"
          @click="toggleMenu"
        >
          <v-icon :icon="mobile ? 'mdi-menu' : 'mdi-dock-left'" size="19" />
        </button>

        <!-- Migas: marca › sección actual -->
        <div class="flex min-w-0 items-center gap-2 text-sm">
          <span class="hidden font-extrabold tracking-tight text-white/80 min-[480px]:inline">{{ brand.name }}</span>
          <v-icon v-if="sectionTitle" icon="mdi-chevron-right" size="16" class="hidden text-white/50 min-[480px]:inline" />
          <span v-if="sectionTitle" class="truncate font-bold text-white">{{ sectionTitle }}</span>
        </div>
      </div>

      <v-spacer />

      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <slot name="actions" />

        <UserProfileMenu />
      </div>
    </v-app-bar>

    <!-- =========================================================================
         3. CONTENIDO
         ========================================================================= -->
    <v-main>
      <v-container class="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-8 sm:py-8">
        <header
          v-if="title || $slots['header-actions']"
          class="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
        >
          <div class="min-w-0">
            <h1 class="text-xl font-bold tracking-tight text-ink-900 sm:text-3xl">{{ title }}</h1>
            <p v-if="subtitle" class="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-500 sm:text-sm">{{ subtitle }}</p>
          </div>
          <div v-if="$slots['header-actions']" class="flex shrink-0 flex-wrap items-center gap-2 [&>*]:max-sm:flex-1">
            <slot name="header-actions" />
          </div>
        </header>

        <slot />
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
/* El icono hereda el color del enlace (activo: blanco, inactivo: tinta, hover: acento).
   Va sin capa para ganarle a las reglas de tema de Vuetify. */
.nav-icon.v-icon {
  color: inherit;
  opacity: 1;
}
</style>
