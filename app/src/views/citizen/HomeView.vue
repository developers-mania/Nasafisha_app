<template>
  <section>
    <!-- Bright green report panel (Figma citizen home) -->
    <div class="rounded-2xl bg-[var(--ns-leaf-500,#22C55E)] p-5">
      <router-link
        to="/citizen/report-new"
        class="inline-block rounded-xl bg-[var(--ns-leaf-700,#15803D)] px-4 py-3 text-white transition hover:bg-[#166534]"
      >
        <p class="text-sm font-bold">{{ t('home.reportTitle') }}</p>
        <p class="mt-0.5 text-xs text-[var(--ns-leaf-50,#F0FDF4)]">{{ t('home.takesAbout') }}</p>
      </router-link>

      <h2 class="mt-6 text-base font-bold text-[var(--ns-ash-900,#17211F)]">{{ t('home.recent') }}</h2>

      <div class="mt-3 divide-y divide-[var(--ns-ash-100,#E6EBE9)] rounded-xl bg-white">
        <div
          v-for="report in reports"
          :key="report.reference"
          class="flex items-center justify-between gap-3 px-4 py-3.5"
        >
          <div class="min-w-0">
            <p class="font-mono text-sm font-bold text-[var(--ns-ash-900,#17211F)]">{{ report.reference }}</p>
            <p class="mt-0.5 truncate text-xs text-[var(--ns-ash-600,#4F5B57)]">
              {{ report.category }} · {{ report.section }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold"
            :class="report.status === 'inProgress'
              ? 'bg-[var(--ns-status-progress-bg,#FFF1CC)] text-[var(--ns-status-progress-fg,#7A4B00)]'
              : 'bg-[var(--ns-status-resolved-bg,#DCF2E6)] text-[var(--ns-status-resolved-fg,#14563F)]'"
          >
            {{ t(`home.${report.status}`) }}
          </span>
        </div>

        <p v-if="!reports.length" class="px-4 py-6 text-center text-sm text-[var(--ns-ash-600,#4F5B57)]">
          {{ t('home.noReports') }}
        </p>
      </div>

      <router-link
        to="/citizen/disposal-guidance"
        class="mt-4 inline-block rounded-xl border border-white/70 bg-white/90 px-4 py-2.5 text-sm font-semibold text-[var(--ns-leaf-700,#15803D)] transition hover:bg-white"
      >
        Disposal guidance
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useOnboardingI18n } from '../../composables/useOnboardingI18n';
import { useReportsStore } from '../../store/reports.store';

const { t } = useOnboardingI18n();
const store = useReportsStore();

const reports = computed(() =>
  store.reports.slice(0, 3).map((report) => ({
    reference: report.reference,
    category: report.title,
    section: report.location,
    status: report.status === 'Resolved' ? 'resolved' as const : 'inProgress' as const,
  })),
);

onMounted(() => {
  void store.loadMine();
});
</script>
