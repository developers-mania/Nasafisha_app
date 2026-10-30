<template>
  <CitizenOnboardLayout>
    <router-link
      to="/citizen/auth-choice"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ns-ash-600,#4F5B57)] transition hover:text-[var(--ns-ash-900,#17211F)]"
    >
      <svg
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {{ t('choice.title') }}
    </router-link>

    <h1
      class="mt-3 text-2xl font-bold tracking-tight text-[var(--ns-ash-900,#17211F)]"
    >
      {{ t('register.title') }}
    </h1>
    <p class="mt-2 text-sm text-[var(--ns-ash-600,#4F5B57)]">
      {{ t('register.subtitle') }}
    </p>

    <form
      class="mt-6"
      @submit.prevent="submit"
    >
      <label
        for="name"
        class="block text-sm font-medium text-[var(--ns-ash-900,#17211F)]"
      >{{ t('register.nameLabel') }}</label>
      <input
        id="name"
        v-model="name"
        type="text"
        autocomplete="name"
        :placeholder="t('register.namePlaceholder')"
        required
        class="mt-2 min-h-[56px] w-full rounded-xl border border-[var(--ns-ash-200,#D5DBD9)] px-4 text-base text-[var(--ns-ash-900,#17211F)] outline-none transition placeholder:text-[var(--ns-ash-400,#889490)] focus:border-[var(--ns-leaf-600,#16A34A)]"
      >

      <label
        for="email"
        class="mt-4 block text-sm font-medium text-[var(--ns-ash-900,#17211F)]"
      >{{ t('register.emailLabel') }}</label>
      <input
        id="email"
        v-model="email"
        type="email"
        inputmode="email"
        autocomplete="email"
        :placeholder="t('register.emailPlaceholder')"
        required
        class="mt-2 min-h-[56px] w-full rounded-xl border border-[var(--ns-ash-200,#D5DBD9)] px-4 text-base text-[var(--ns-ash-900,#17211F)] outline-none transition placeholder:text-[var(--ns-ash-400,#889490)] focus:border-[var(--ns-leaf-600,#16A34A)]"
      >
      <p class="mt-2 text-xs text-[var(--ns-ash-600,#4F5B57)]">
        {{ t('register.hint') }}
      </p>

      <button
        type="submit"
        class="mt-5 rounded-lg bg-[var(--ns-leaf-700,#15803D)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--ns-leaf-600,#16A34A)] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!name.trim() || !email.trim()"
      >
        {{ t('register.submit') }}
      </button>
    </form>

    <p class="mt-6 text-center text-xs text-[var(--ns-ash-600,#4F5B57)]">
      {{ t('register.haveAccount') }}
      <router-link
        class="font-semibold underline underline-offset-2 text-[var(--ns-lake-800,#185746)]"
        to="/citizen/login"
      >
        {{ t('register.signIn') }}
      </router-link>
    </p>
  </CitizenOnboardLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CitizenOnboardLayout from '../../../layouts/CitizenOnboardLayout.vue';
import { useOnboardingI18n } from '../../../composables/useOnboardingI18n';

const router = useRouter();
const { t } = useOnboardingI18n();
const name = ref('');
const email = ref('');

function submit() {
  sessionStorage.setItem('ns_auth_mode', 'register');
  sessionStorage.setItem('ns_name', name.value.trim());
  sessionStorage.setItem('ns_email', email.value.trim().toLowerCase());
  router.push('/citizen/login/otp');
}
</script>
