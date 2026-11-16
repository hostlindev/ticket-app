<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@core/layouts/AppLayout.vue'
import ActionButton from '@core/components/ActionButton.vue'
import RefreshButton from '@core/components/RefreshButton.vue'
import { useToast } from '@core/composables/useToast'
import { errorMessage } from '@core/api/errors'
import { useAssignments } from '../composables/useAssignments'
import type { Developer, NewSystemInput, SystemAssignment } from '../interface/assignment.interface'
import AssignmentsSummaryCards from '../components/AssignmentsSummaryCards.vue'
import AssignmentsToolbar from '../components/AssignmentsToolbar.vue'
import SystemAssignmentCard from '../components/SystemAssignmentCard.vue'
import AssignDevelopersDialog from '../components/AssignDevelopersDialog.vue'
import CreateSystemDialog from '../components/CreateSystemDialog.vue'

const { filteredSystems, systems, isLoading, hasLoaded, isSaving, error, load, saveDevelopers, addSystem, editSystem, removeSystem, resetFilters } =
  useAssignments()
const toast = useToast()

const dialogOpen = ref(false)
const createOpen = ref(false)
const editingId = ref<string | null>(null)
const formSystemId = ref<string | null>(null)
const deleting = ref<SystemAssignment | null>(null)
const deleteOpen = ref(false)

const formSystem = () => systems.value.find((s) => s.id === formSystemId.value) ?? null

function openCreate(): void {
  formSystemId.value = null
  createOpen.value = true
}

function openEdit(system: SystemAssignment): void {
  formSystemId.value = system.id
  createOpen.value = true
}

function openDelete(system: SystemAssignment): void {
  deleting.value = system
  deleteOpen.value = true
}

async function confirmDelete(): Promise<void> {
  const system = deleting.value
  if (!system) return
  try {
    await removeSystem(system.id)
    toast.success(`${system.name} eliminado`)
    deleteOpen.value = false
  } catch (err) {
    toast.error(errorMessage(err, 'No pudimos eliminar el sistema.'))
  }
}

// El dialog siempre recibe la versión más reciente del sistema desde el store.
const editing = () => systems.value.find((s) => s.id === editingId.value) ?? null

function openManage(system: SystemAssignment): void {
  editingId.value = system.id
  dialogOpen.value = true
}

async function handleSave(systemId: string, ids: string[]): Promise<void> {
  try {
    await saveDevelopers(systemId, ids)
    toast.success('Equipo actualizado')
    dialogOpen.value = false
  } catch (err) {
    toast.error(errorMessage(err, 'No pudimos guardar los cambios.'))
  }
}

async function handleCreate(input: NewSystemInput): Promise<void> {
  const target = formSystem()
  if (target) {
    try {
      await editSystem(target.id, input)
      toast.success(`${input.name} actualizado`)
      createOpen.value = false
    } catch (err) {
      toast.error(errorMessage(err, 'No pudimos actualizar el sistema.'))
    }
    return
  }

  try {
    const created = await addSystem(input)
    toast.success(`${created.name} registrado`)
    createOpen.value = false
    openManage(created)
  } catch (err) {
    toast.error(errorMessage(err, 'No pudimos registrar el sistema.'))
  }
}

async function handleRemove(system: SystemAssignment, developer: Developer): Promise<void> {
  const ids = system.developers.filter((d) => d.id !== developer.id).map((d) => d.id)
  try {
    await saveDevelopers(system.id, ids)
    toast.success(`${developer.name} ya no atiende ${system.name}`)
  } catch (err) {
    toast.error(errorMessage(err, 'No pudimos quitar al desarrollador.'))
  }
}

onMounted(load)
</script>

<template>
  <AppLayout
    title="Asignación de equipo"
    subtitle="Define qué desarrolladores atienden los reportes de cada sistema."
  >
    <template #header-actions>
      <RefreshButton variant="text" :loading="isLoading" @click="load" />
    </template>

    <div class="space-y-5 sm:space-y-6">
      <AssignmentsSummaryCards />
      <div class="flex justify-end">
        <ActionButton icon="mdi-plus" @click="openCreate">Nuevo sistema</ActionButton>
      </div>
      <AssignmentsToolbar />

      <v-alert v-if="error" type="error" variant="tonal" class="rounded-xl" closable>
        {{ error }}
        <template #append>
          <v-btn size="small" variant="text" class="font-bold" @click="load">Reintentar</v-btn>
        </template>
      </v-alert>

      <!-- Esqueletos -->
      <div v-if="!hasLoaded && isLoading" class="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="n in 6" :key="n" class="console-card animate-pulse space-y-3 p-5">
          <div class="flex gap-3">
            <span class="size-10 rounded-lg bg-silver-200" />
            <span class="flex-1 space-y-2">
              <span class="block h-4 w-2/3 rounded bg-silver-200" />
              <span class="block h-3 w-1/2 rounded bg-silver-100" />
            </span>
          </div>
          <span class="block h-8 w-full rounded-full bg-silver-100" />
        </div>
      </div>

      <div
        v-else-if="hasLoaded && filteredSystems.length === 0"
        class="console-card flex flex-col items-center justify-center px-6 py-12 text-center"
      >
        <span class="grid size-14 place-items-center rounded-2xl bg-silver-100">
          <v-icon icon="mdi-application-outline" size="30" class="text-ink-400" />
        </span>
        <h4 class="mt-3 text-base font-bold text-ink-900 sm:text-lg">No hay sistemas que mostrar</h4>
        <p class="mt-1 max-w-sm text-[13px] text-ink-500">Prueba cambiando los filtros o la búsqueda.</p>
        <v-btn
          variant="tonal"
          color="primary"
          size="small"
          class="mt-4 rounded-lg font-bold"
          prepend-icon="mdi-filter-remove-outline"
          @click="resetFilters"
        >
          Limpiar filtros
        </v-btn>
      </div>

      <div v-else class="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SystemAssignmentCard
          v-for="system in filteredSystems"
          :key="system.id"
          :system="system"
          :busy="isSaving"
          @manage="openManage"
          @remove="handleRemove"
          @edit="openEdit"
          @delete="openDelete"
        />
      </div>
    </div>

    <CreateSystemDialog v-model="createOpen" :system="formSystem()" @create="handleCreate" />
    <v-dialog v-model="deleteOpen" max-width="440" :persistent="isSaving">
      <div class="console-card rounded-xl border border-silver-300 bg-white p-5 shadow-xl">
        <h2 class="m-0 text-lg font-bold text-ink-900">Eliminar sistema</h2>
        <p class="mt-2 text-[13.5px] text-ink-600">
          ¿Seguro que quieres eliminar <strong>{{ deleting?.name }}</strong>? Se quitará su equipo asignado y esta acción no se
          puede deshacer.
        </p>
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <v-btn variant="text" class="rounded-lg font-bold" :disabled="isSaving" @click="deleteOpen = false">Cancelar</v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="rounded-lg font-bold"
            prepend-icon="mdi-trash-can-outline"
            :loading="isSaving"
            @click="confirmDelete"
          >
            Eliminar
          </v-btn>
        </div>
      </div>
    </v-dialog>
    <AssignDevelopersDialog v-model="dialogOpen" :system="editing()" @save="handleSave" />
  </AppLayout>
</template>
