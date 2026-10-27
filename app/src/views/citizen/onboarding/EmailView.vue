<template>
  <CitizenOnboardLayout>
    <router-link
      to="/citizen/auth-choice"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ns-ash-600,#4F5B57)] transition hover:text-[var(--ns-ash-900,#17211F)]"
    >
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {{ t('choice.back') }}
    </router-link>

    <h1 class="mt-3 text-2xl font-bold tracking-tight text-[var(--ns-ash-900,#17211F)]">
      {{ t('email.title') }}
    </h1>
    <p class="mt-2 text-sm text-[var(--ns-ash-600,#4F5B57)]">
      {{ t('email.subtitle') }}
    </p>

    <form class="mt-6" @submit.prevent="submit">
      <label for="email" class="block text-sm font-medium text-[var(--ns-ash-900,#17211F)]">
        {{ t('email.label') }}
      </label>
      <input
        id="email"
        v-model="email"
        type="email"
        inputmode="email"
        autocomplete="email"
        required
        :placeholder="t('email.placeholder')"
        class="mt-2 min-h-[72px] w-full rounded-xl border border-[var(--ns-ash-200,#D5DBD9)] px-4 text-base text-[var(--ns-ash-900,#17211F)] outline-none transition placeholder:text-[var(--ns-ash-400,#889490)] focus:border-[var(--ns-leaf-600,#16A34A)]"
      />
      <p class="mt-2 text-xs text-[var(--ns-ash-600,#4F5B57)]">{{ t('email.hint') }}</p>

      <p
        v-if="error"
        role="alert"
        class="mt-4 rounded-xl bg-[var(--ns-danger-bg,#FEE2E2)] px-4 py-4 text-sm font-medium text-[var(--ns-danger-fg,#991B1B)]"
      >
        {{ error }}
      </p>

      <button
        type="submit"
        class="mt-5 rounded-lg bg-[var(--ns-leaf-700,#15803D)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--ns-leaf-600,#16A34A)] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!email.trim() || sending"
      >
        {{ sending ? t('email.sending') : t('email.submit') }}
      </button>
    </form>
  </CitizenOnboardLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CitizenOnboardLayout from '../../../layouts/CitizenOnboardLayout.vue';
import { useOnboardingI18n } from '../../../composables/useOnboardingI18n';
import { authApi } from '../../../api/auth.api';

const router = useRouter();
const { t } = useOnboardingI18n();
const email = ref('');
const error = ref('');
const sending = ref(false);

async function submit() {
  error.value = '';
  sending.value = true;
  const normalizedEmail = email.value.trim().toLowerCase();

  try {
    await authApi.requestCitizenCode(normalizedEmail);
    sessionStorage.setItem('ns_auth_mode', 'login');
    sessionStorage.setItem('ns_email', normalizedEmail);
    sessionStorage.removeItem('ns_phone');
    await router.push('/citizen/login/otp');
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('email.error');
  } finally {
    sending.value = false;
  }
}
</script>
