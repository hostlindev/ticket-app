<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from '@core/layouts/AppLayout.vue'
import { useDashboard } from '../composables/useDashboard'
import DashboardWelcomeCard from '../components/DashboardWelcomeCard.vue'
import DashboardAssignedAppsCard from '../components/DashboardAssignedAppsCard.vue'
import DashboardAssignedIncidentsCard from '../components/DashboardAssignedIncidentsCard.vue'
import DashboardKpiStrip from '../components/DashboardKpiStrip.vue'
import DashboardPriorityGrid from '../components/DashboardPriorityGrid.vue'
import DashboardStatusCard from '../components/DashboardStatusCard.vue'
import DashboardTrendCard from '../components/DashboardTrendCard.vue'
import DashboardPieChart from '../components/DashboardPieChart.vue'
import DashboardAppsList from '../components/DashboardAppsList.vue'

const { loading, refreshData } = useDashboard()

onMounted(refreshData)
</script>

<template>
  <AppLayout
    title="Tablero de incidencias web"
    subtitle="Visión general de prioridades, volumen de incidencias reportadas por usuarios en aplicaciones web y métricas en tiempo real."
  >
    <v-progress-linear v-if="loading" indeterminate color="primary" height="3" class="mb-4 rounded-full" />

    <div class="space-y-5 sm:space-y-6">
      <!-- 1. Saludo + resumen personal -->
      <section class="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-[1.3fr_1fr_1fr]">
        <DashboardWelcomeCard class="sm:col-span-2 xl:col-span-1" />
        <DashboardAssignedAppsCard />
        <DashboardAssignedIncidentsCard />
      </section>

      <!-- 2. Estadísticas globales (todas las apps, todas las incidencias) -->
      <DashboardKpiStrip />
      <DashboardPriorityGrid />

      <section class="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <DashboardStatusCard />
        <DashboardTrendCard />
      </section>

      <!-- 3. Reparto por aplicación -->
      <section class="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1.4fr]">
        <DashboardPieChart />
        <DashboardAppsList />
      </section>
    </div>
  </AppLayout>
</template>
