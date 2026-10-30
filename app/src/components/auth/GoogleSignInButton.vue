<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import BaseAlert from '../common/BaseAlert.vue';
import BaseButton from '../common/BaseButton.vue';
import { useAuthStore } from '../../store/auth.store';

const route = useRoute();
const authStore = useAuthStore();
const errorMessage = ref('');

async function signIn() {
  errorMessage.value = '';
  try {
    const redirect = route.query.redirect;
    await authStore.loginWithGoogle(typeof redirect === 'string' ? redirect : undefined);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Google sign-in failed.';
  }
}
</script>

<template>
  <div class="mt-5 space-y-3">
    <div
      class="flex items-center gap-3 text-xs text-[var(--ns-ash-600,#4F5B57)]"
      aria-hidden="true"
    >
      <span class="h-px flex-1 bg-[var(--ns-border,#D5DBD9)]" />
      <span>OR</span>
      <span class="h-px flex-1 bg-[var(--ns-border,#D5DBD9)]" />
    </div>

    <BaseButton
      variant="secondary"
      size="lg"
      :block="true"
      :loading="authStore.isLoading"
      @click="signIn"
    >
      <svg
        aria-hidden="true"
        class="h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.78-.07-1.53-.2-2.27H12v4.51h6.44c-.28 1.45-1.1 2.68-2.32 3.51v2.93h3.76c2.2-2.02 3.61-5 3.61-8.68Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.93l-3.76-2.93c-1.08.72-2.46 1.15-4.17 1.15-3.2 0-5.92-2.16-6.89-5.06H1.22v3.02A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.11 14.23A7.2 7.2 0 0 1 4.73 12c0-.77.13-1.52.38-2.23V6.75H1.22A12 12 0 0 0 0 12c0 1.93.46 3.76 1.22 5.25l3.89-3.02Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.36.61 4.61 1.81l3.44-3.44C17.95 1.15 15.24 0 12 0A12 12 0 0 0 1.22 6.75l3.89 3.02C6.08 6.87 8.8 4.75 12 4.75Z"
        />
      </svg>
      Continue with Google
    </BaseButton>

    <BaseAlert
      v-if="errorMessage"
      variant="error"
      :dismissible="false"
    >
      {{ errorMessage }}
    </BaseAlert>
  </div>
</template>
