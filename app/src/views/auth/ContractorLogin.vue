<template>
  <div class="grid min-h-screen bg-white md:grid-cols-[42fr_58fr]">
    <!-- Brand panel -->
    <aside class="hidden flex-col justify-between bg-[#20382F] p-12 text-white md:flex">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white">
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            class="relative left-[-8px] top-0 block h-auto w-12 max-w-none"
          >
        </div>
        <span class="text-sm font-semibold tracking-wide">NASAFISHA</span>
      </div>

      <div class="max-w-md space-y-5">
        <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F5D142]">
          NAKURU COUNTY
        </p>
        <h1 class="contractor-brand-title text-3xl leading-[1.12]">
          Contractor<br>portal.
        </h1>
        <p class="max-w-xs text-sm leading-relaxed text-[#C2D0C8]">
          A shared, evidenced record of your SLA performance.
        </p>
      </div>

      <svg
        class="w-full max-w-xs text-[#8DABA0]/55"
        viewBox="0 0 240 120"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0 48C38 48 38 6 82 6S124 54 166 54 204 78 240 78"
          stroke="currentColor"
          stroke-width="0.8"
        />
        <path
          d="M0 60C40 60 42 18 84 18s40 48 82 48 38 24 74 24"
          stroke="currentColor"
          stroke-width="0.8"
        />
        <path
          d="M0 72c42 0 46-42 86-42s38 48 80 48 38 24 74 24"
          stroke="currentColor"
          stroke-width="0.8"
        />
        <path
          d="M0 84c44 0 50-42 88-42s36 48 78 48 38 24 74 24"
          stroke="currentColor"
          stroke-width="0.8"
        />
        <circle
          cx="84"
          cy="6"
          r="3.5"
          fill="#F5D142"
        />
      </svg>

      <div class="space-y-1">
        <p class="text-[10px] font-semibold tracking-wide text-[#D4E0DA]">
          Nakuru County Solid Waste Management
        </p>
        <p class="text-[10px] tracking-wide text-[#AFC2B8]">
          One waste. Shared visibility.
        </p>
      </div>
    </aside>

    <!-- Sign-in panel -->
    <div class="flex min-h-screen flex-col bg-white">
      <header class="flex items-center px-6 py-5 md:hidden">
        <div>
          <BrandLogo
            size="sm"
            :with-text="false"
          />
        </div>
      </header>

      <main class="flex flex-1 items-center justify-center px-6 py-10 md:px-10">
        <div class="w-full max-w-xs">
          <div class="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F1EB] text-[#315D42]">
            <AppIcon
              name="user"
              :size="15"
            />
          </div>

          <h2 class="text-2xl font-semibold leading-tight tracking-tight text-[#233E34]">
            Sign in to your account.
          </h2>
          <p class="mt-2 text-xs leading-relaxed text-[#69736E]">
            View your zone's performance and the evidence behind every closed ticket.
          </p>

          <form
            class="mt-5 space-y-3"
            @submit.prevent="handleLogin"
          >
            <BaseAlert
              v-if="errorMessage"
              variant="error"
              :dismissible="false"
            >
              {{ errorMessage }}
            </BaseAlert>

            <BaseInput
              v-model="email"
              label="Work email"
              type="email"
              inputmode="email"
              autocomplete="username"
              placeholder="ops@wastelandscaping.co.ke"
              :required="true"
            />

            <BaseInput
              v-model="password"
              label="Password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••••"
              :required="true"
            />

            <BaseButton
              type="submit"
              variant="primary"
              size="md"
              :block="true"
              :loading="authStore.isLoading"
            >
              <span class="inline-flex items-center justify-center gap-2">
                {{ t('common.signIn') }}
                <span
                  class="ml-auto text-[#F5D142]"
                  aria-hidden="true"
                >→</span>
              </span>
            </BaseButton>
          </form>

          <GoogleSignInButton />

          <p class="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-[#69736E]">
            <AppIcon
              name="lock"
              :size="12"
              class="mt-0.5 shrink-0 text-[#233E34]"
            />
            Read-only access to your zone. The same performance record as the county sees.
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton.vue';
import { AppIcon, BaseAlert, BaseButton, BaseInput, BrandLogo } from '../../components/common';
import { useAuthStore } from '../../store/auth.store';
import { useI18n } from '../../i18n';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function handleLogin(): Promise<void> {
  errorMessage.value = '';
  if (!email.value || !password.value) {
    errorMessage.value = 'Enter your work email and password';
    return;
  }

  try {
    await authStore.login({ email: email.value, password: password.value, role: 'contractor' });
    const redirect = (route.query.redirect as string) || '/contractor/scorecard';
    router.push(redirect);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Sign-in failed';
  }
}
</script>

<style scoped>
.contractor-brand-title {
  font-weight: 400;
}
</style>
