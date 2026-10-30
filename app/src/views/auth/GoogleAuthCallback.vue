<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { homeRouteFor } from '../../config/roles';
import { useAuthStore } from '../../store/auth.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const errorMessage = ref('');

function safeRedirect(): string | null {
  const target = route.query.redirect;
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : null;
}

onMounted(async () => {
  const providerError = route.query.error_description ?? route.query.error;
  if (typeof providerError === 'string' && providerError) {
    errorMessage.value = providerError;
    return;
  }

  try {
    const user = await authStore.completeGoogleLogin();
    await router.replace(safeRedirect() ?? homeRouteFor(user.role));
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Google sign-in failed.';
  }
});
</script>

<template>
  <section class="w-full space-y-4 text-center">
    <template v-if="!errorMessage">
      <h1 class="text-2xl font-bold text-[var(--ns-lake-900,#0F2E27)]">
        Signing you in
      </h1>
      <p class="text-sm text-[var(--ns-ash-600,#4F5B57)]">
        Please wait while we finish Google sign-in.
      </p>
      <div
        class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--ns-lake-700,#1F6F5C)] border-r-transparent"
      />
    </template>

    <template v-else>
      <h1 class="text-2xl font-bold text-[var(--ns-lake-900,#0F2E27)]">
        Google sign-in failed
      </h1>
      <p
        role="alert"
        class="rounded bg-red-50 px-3 py-2 text-sm text-red-800"
      >
        {{ errorMessage }}
      </p>
      <router-link
        to="/login"
        class="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ns-lake-700,#1F6F5C)] px-5 font-semibold text-white"
      >
        Return to sign in
      </router-link>
    </template>
  </section>
</template>
