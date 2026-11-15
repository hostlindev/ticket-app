<script setup lang="ts">
import { avatarTone, initials } from '@modules/assignments/config/assignments.config'
import { ROLE_BADGE, roleLabel } from '../config/users.config'
import type { ManagedUser } from '../interface/user.interface'

defineProps<{
  user: ManagedUser
  /** Es la persona en sesión: no puede eliminarse a sí misma. */
  isSelf?: boolean
  busy?: boolean
}>()

const emit = defineEmits<{
  edit: [user: ManagedUser]
  delete: [user: ManagedUser]
}>()
</script>

<template>
  <article class="console-card flex min-w-0 flex-col p-4 sm:p-5">
    <header class="flex items-start gap-3">
      <v-avatar size="40" :class="avatarTone(user.id)" class="shrink-0 text-[13px] font-bold text-white">
        {{ initials(user.name) }}
      </v-avatar>
      <div class="min-w-0 flex-1">
        <h3 class="m-0 truncate text-[15px] font-bold leading-tight text-ink-900">
          {{ user.name }}
          <span v-if="isSelf" class="ml-1 text-[11px] font-semibold text-ink-500">(tú)</span>
        </h3>
        <p class="m-0 mt-0.5 flex items-center gap-1 truncate text-[12px] text-ink-500">
          <v-icon icon="mdi-email-outline" size="13" class="shrink-0" />
          <span class="truncate">{{ user.email }}</span>
        </p>
      </div>
      <v-menu location="bottom end">
        <template #activator="{ props: menuProps }">
          <button
            v-bind="menuProps"
            type="button"
            class="grid size-7 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-silver-100 hover:text-ink-900 disabled:opacity-40"
            :aria-label="`Opciones de ${user.name}`"
            :disabled="busy"
          >
            <v-icon icon="mdi-dots-vertical" size="18" />
          </button>
        </template>
        <v-list density="compact" class="rounded-lg">
          <v-list-item prepend-icon="mdi-pencil-outline" title="Editar usuario" @click="emit('edit', user)" />
          <v-list-item
            prepend-icon="mdi-trash-can-outline"
            title="Eliminar usuario"
            base-color="error"
            :disabled="isSelf"
            @click="emit('delete', user)"
          />
        </v-list>
      </v-menu>
    </header>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <span class="rounded-lg border px-2 py-0.5 text-[11px] font-bold" :class="ROLE_BADGE[user.role]">
        {{ roleLabel(user.role) }}
      </span>
      <span v-if="user.specialty" class="rounded-lg border border-silver-200 bg-silver-50 px-2 py-0.5 text-[11px] font-semibold text-ink-700">
        {{ user.specialty }}
      </span>
    </div>

    <p v-if="user.department" class="m-0 mt-2 truncate text-[12.5px] text-ink-600">{{ user.department }}</p>

    <dl class="m-0 mt-4 grid grid-cols-2 gap-2 border-t border-silver-200 pt-3 text-[12px]">
      <div>
        <dt class="text-ink-500">Sistemas</dt>
        <dd class="m-0 text-[14px] font-bold text-ink-900">{{ user.systemsCount }}</dd>
      </div>
      <div>
        <dt class="text-ink-500">Resueltas</dt>
        <dd class="m-0 text-[14px] font-bold text-ink-900">{{ user.resolvedCount }}</dd>
      </div>
    </dl>
  </article>
</template>
