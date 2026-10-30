<template>
  <section class="w-full">
    <div class="mb-6">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ns-lake-700,#1F6F5C)]">Staff login</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-[var(--ns-lake-900,#0F2E27)]">Operations access</h1>
      <p class="mt-2 text-sm text-[var(--ns-ash-600,#4F5B57)]">County staff and control-room sign-in.</p>
    </div>

    <form class="space-y-5" @submit.prevent="submitLogin">
      <BaseAlert v-if="errorMessage" variant="error" :dismissible="false">
        {{ errorMessage }}
      </BaseAlert>

      <BaseInput
        v-model="form.email"
        label="Staff email"
        type="email"
        inputmode="email"
        autocomplete="username"
        placeholder="ops@nasafisha.org"
        :required="true"
      />

      <BaseInput
        v-model="form.password"
        label="Password"
        type="password"
        autocomplete="current-password"
        placeholder="••••••••"
        :required="true"
      />

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        :block="true"
        :loading="authStore.isLoading"
        :disabled="!form.email || !form.password"
      >
        {{ authStore.isLoading ? 'Signing in…' : 'Sign in as staff' }}
      </BaseButton>
    </form>

    <GoogleSignInButton />

    <p class="mt-6 text-center text-xs text-[var(--ns-ash-600,#4F5B57)]">
      Contractor?
      <router-link class="font-semibold underline underline-offset-2 text-[var(--ns-lake-800,#185746)]" to="/contractor/login">
        Contractor portal
      </router-link>
    </p>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BaseAlert, BaseButton, BaseInput } from '../../components/common';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton.vue';
import { useAuthStore } from '../../store/auth.store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const form = reactive({ email: '', password: '' });
const errorMessage = ref('');

const submitLogin = async () => {
  errorMessage.value = '';
  try {
    await authStore.login({ email: form.email, password: form.password, role: 'admin' });
    const redirect = (route.query.redirect as string) || '/admin';
    router.push(redirect);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Staff login failed';
  }
};
</script>
