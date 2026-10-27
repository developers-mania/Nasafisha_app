<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-[var(--ns-lake-900,#0F2E27)]">
          Municipality summary
        </h1>
        <p class="mt-1 text-sm text-[var(--ns-ash-600,#4F5B57)]">
          Weekly operations metrics from the API.
        </p>
      </div>
      <ExportButton :data="exportData" filename="command-center-report.csv" />
    </header>

    <div
      v-if="loading"
      class="rounded-xl border border-[var(--ns-ash-200,#D5DBD9)] bg-white p-10 text-center text-sm text-[var(--ns-ash-600,#4F5B57)]"
    >
      Loading dashboard data...
    </div>

    <div
      v-else-if="error"
      role="alert"
      class="rounded-xl border border-[var(--ns-danger-border,#F87171)] bg-[var(--ns-danger-bg,#FEE2E2)] p-4 text-sm text-[var(--ns-danger-fg,#991B1B)]"
    >
      {{ error }}
    </div>

    <section v-else-if="dashboardData" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article class="rounded-xl bg-[var(--ns-lake-900,#0F2E27)] p-5 text-white">
        <p class="text-xs font-medium text-[var(--ns-lake-100,#DCEDE7)]">Cleanliness score</p>
        <strong class="mt-2 block text-4xl font-extrabold tracking-tight">
          {{ dashboardData.cleanlinessScore }}%
        </strong>
      </article>

      <article class="rounded-xl border border-[var(--ns-ash-200,#D5DBD9)] bg-white p-5">
        <p class="text-xs font-medium text-[var(--ns-ash-600,#4F5B57)]">Tickets opened</p>
        <strong class="mt-2 block text-4xl font-extrabold tracking-tight text-[var(--ns-lake-900,#0F2E27)]">
          {{ dashboardData.ticketsOpened }}
        </strong>
      </article>

      <article class="rounded-xl border border-[var(--ns-ash-200,#D5DBD9)] bg-white p-5">
        <p class="text-xs font-medium text-[var(--ns-ash-600,#4F5B57)]">Missed collections</p>
        <strong class="mt-2 block text-4xl font-extrabold tracking-tight text-[var(--ns-lake-900,#0F2E27)]">
          {{ dashboardData.missed }}
        </strong>
      </article>

      <article class="rounded-xl border border-[var(--ns-ash-200,#D5DBD9)] bg-white p-5">
        <p class="text-xs font-medium text-[var(--ns-ash-600,#4F5B57)]">Collection rate</p>
        <strong class="mt-2 block text-4xl font-extrabold tracking-tight text-[var(--ns-lake-900,#0F2E27)]">
          {{ Math.round(dashboardData.collectionRate * 100) }}%
        </strong>
      </article>

      <article class="rounded-xl border border-[var(--ns-ash-200,#D5DBD9)] bg-white p-5">
        <p class="text-xs font-medium text-[var(--ns-ash-600,#4F5B57)]">Route adherence</p>
        <strong class="mt-2 block text-4xl font-extrabold tracking-tight text-[var(--ns-lake-900,#0F2E27)]">
          {{ dashboardData.routeAdherence }}%
        </strong>
      </article>

      <article class="rounded-xl border border-[var(--ns-ash-200,#D5DBD9)] bg-white p-5">
        <p class="text-xs font-medium text-[var(--ns-ash-600,#4F5B57)]">Average resolution time</p>
        <strong class="mt-2 block text-4xl font-extrabold tracking-tight text-[var(--ns-lake-900,#0F2E27)]">
          {{ dashboardData.avgResolutionHours.toFixed(1) }}h
        </strong>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import ExportButton from '../../components/dashboard/ExportButton.vue';
import { useDashboardStore } from '../../store/dashboard.store';

const { dashboardData, loading, error, loadDashboard } = useDashboardStore();

const exportData = computed(() => {
  const data = dashboardData.value;
  if (!data) return [];

  return [
    { Metric: 'Cleanliness score', Value: data.cleanlinessScore },
    { Metric: 'Tickets opened', Value: data.ticketsOpened },
    { Metric: 'Missed collections', Value: data.missed },
    { Metric: 'Collection rate', Value: data.collectionRate },
    { Metric: 'Route adherence', Value: data.routeAdherence },
    { Metric: 'Average resolution hours', Value: data.avgResolutionHours },
  ];
});

onMounted(() => {
  loadDashboard();
});
</script>
