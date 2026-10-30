<template>
  <div class="min-h-screen grid lg:grid-cols-[44fr_56fr]">
    <!-- Brand panel -->
    <aside class="hidden lg:flex flex-col justify-between bg-[var(--ns-lake-900,#0F2E27)] p-12 text-white">
      <BrandLogo
        size="lg"
        :with-text="false"
        :on-dark="true"
      />

      <div class="max-w-md space-y-5">
        <h1 class="text-4xl font-bold leading-[1.15]">
          A shared, evidenced record of county waste collection.
        </h1>
        <p class="text-sm leading-relaxed text-emerald-100/75">
          Sign in with your employee ID to see today's assigned tickets.
        </p>
      </div>

      <p class="text-xs tracking-wide text-emerald-100/60">
        Nakuru County Government
      </p>
    </aside>

    <!-- Sign-in panel over truck photo -->
    <div class="relative flex min-h-screen flex-col overflow-hidden bg-[var(--ns-lake-950,#081B17)]">
      <!-- Backdrop: waste truck scene -->
      <div
        class="absolute inset-0"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 800 900"
          preserveAspectRatio="xMidYMid slice"
          class="h-full w-full"
        >
          <defs>
            <linearGradient
              id="fl-sky"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stop-color="#B8D6E8"
              />
              <stop
                offset="55%"
                stop-color="#DCE9EF"
              />
              <stop
                offset="100%"
                stop-color="#E9E3CE"
              />
            </linearGradient>
            <linearGradient
              id="fl-road"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stop-color="#4A4F4C"
              />
              <stop
                offset="100%"
                stop-color="#2C302E"
              />
            </linearGradient>
          </defs>
          <rect
            width="800"
            height="900"
            fill="url(#fl-sky)"
          />
          <rect
            y="560"
            width="800"
            height="120"
            fill="#7C8A72"
          />
          <rect
            y="660"
            width="800"
            height="240"
            fill="url(#fl-road)"
          />
          <rect
            y="700"
            width="800"
            height="10"
            fill="#E7D98A"
            opacity="0.75"
          />
          <!-- Truck body -->
          <g transform="translate(40 360)">
            <rect
              x="0"
              y="60"
              width="330"
              height="170"
              rx="14"
              fill="#1F6F5C"
            />
            <rect
              x="20"
              y="85"
              width="200"
              height="90"
              rx="8"
              fill="#185746"
            />
            <path
              d="M330 90 h90 l50 60 v80 H330 Z"
              fill="#F5D142"
            />
            <rect
              x="352"
              y="105"
              width="70"
              height="52"
              rx="6"
              fill="#9FC4D6"
            />
            <circle
              cx="90"
              cy="245"
              r="46"
              fill="#17211F"
            />
            <circle
              cx="90"
              cy="245"
              r="20"
              fill="#889490"
            />
            <circle
              cx="360"
              cy="245"
              r="46"
              fill="#17211F"
            />
            <circle
              cx="360"
              cy="245"
              r="20"
              fill="#889490"
            />
            <rect
              x="-6"
              y="205"
              width="446"
              height="20"
              rx="8"
              fill="#0F2E27"
            />
          </g>
          <rect
            width="800"
            height="900"
            fill="#081B17"
            opacity="0.45"
          />
        </svg>
      </div>

      <!-- Language toggle -->
      <div class="relative z-10 flex justify-end px-6 py-5 lg:px-12">
        <div
          class="flex items-center gap-1 rounded-full bg-white/95 p-1 shadow-sm"
          role="group"
          aria-label="Language"
        >
          <button
            v-for="option in ['en', 'sw'] as const"
            :key="option"
            type="button"
            class="rounded-full px-3.5 py-1 text-xs font-semibold transition"
            :class="locale === option
              ? 'bg-[var(--ns-lake-900,#0F2E27)] text-white'
              : 'text-[var(--ns-ash-600,#4F5B57)] hover:text-[var(--ns-lake-900,#0F2E27)]'"
            :aria-pressed="locale === option"
            @click="setLocale(option)"
          >
            {{ option === 'en' ? 'EN' : 'SW' }}
          </button>
        </div>
      </div>

      <main class="relative z-10 flex flex-1 items-center justify-center px-6 pb-12 lg:px-12">
        <div class="w-full max-w-sm rounded-2xl bg-white p-7 shadow-lg">
          <!-- Mobile brand -->
          <div class="mb-5 lg:hidden">
            <BrandLogo
              size="sm"
              :with-text="false"
            />
          </div>

          <div class="mb-6 flex flex-col items-center text-center">
            <span
              class="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ns-lake-100,#DCEDE7)] text-[var(--ns-lake-700,#1F6F5C)]"
              aria-hidden="true"
            >
              <AppIcon
                name="user"
                :size="30"
              />
            </span>
            <h2 class="mt-3 text-2xl font-bold tracking-tight text-[var(--ns-lake-900,#0F2E27)]">
              Field crew sign-in
            </h2>
            <p class="mt-1 text-xs text-[var(--ns-ash-600,#4F5B57)]">
              {{ t('auth.badgeNumber') }} · {{ t('auth.pin') }}
            </p>
          </div>

          <form
            class="space-y-4"
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
              v-model="employeeId"
              label="Employee ID"
              placeholder="NKR-0417"
              :required="true"
              autocomplete="username"
            >
              <template #prefix>
                <AppIcon
                  name="id-card"
                  :size="16"
                />
              </template>
            </BaseInput>

            <BaseInput
              v-model="pin"
              label="PIN"
              type="password"
              inputmode="numeric"
              maxlength="6"
              placeholder="••••••"
              :required="true"
              autocomplete="current-password"
            >
              <template #prefix>
                <AppIcon
                  name="lock"
                  :size="16"
                />
              </template>
            </BaseInput>

            <BaseButton
              type="submit"
              variant="accent"
              size="lg"
              :block="true"
              :loading="authStore.isLoading"
            >
              {{ t('common.signIn') }}
            </BaseButton>
          </form>

          <GoogleSignInButton />

          <p class="mt-5 text-center text-xs text-[var(--ns-ash-600,#4F5B57)]">
            Your PIN is 6 digits. Forgot it? Ask your supervisor.
          </p>

          <div class="mt-4 flex items-center justify-center gap-4 text-xs text-[var(--ns-ash-600,#4F5B57)]">
            <router-link
              class="underline underline-offset-2 hover:text-[var(--ns-lake-900,#0F2E27)]"
              to="/login"
            >
              Staff sign-in
            </router-link>
            <router-link
              class="underline underline-offset-2 hover:text-[var(--ns-lake-900,#0F2E27)]"
              to="/citizen/login"
            >
              Citizen sign-in
            </router-link>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AppIcon, BaseAlert, BaseButton, BaseInput, BrandLogo } from '../../components/common';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton.vue';
import { useAuthStore } from '../../store/auth.store';
import { useI18n } from '../../i18n';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t, locale, setLocale } = useI18n();

const employeeId = ref('');
const pin = ref('');
const errorMessage = ref('');

async function handleLogin(): Promise<void> {
  errorMessage.value = '';
  if (!employeeId.value || !pin.value) {
    errorMessage.value = 'Enter your employee ID and 6-digit PIN';
    return;
  }
  if (!/^\d{6}$/.test(pin.value)) {
    errorMessage.value = 'Your PIN is 6 digits';
    return;
  }

  try {
    await authStore.login({ contractorCode: employeeId.value, password: pin.value, role: 'field' });
    const redirect = (route.query.redirect as string) || '/field/tickets';
    router.push(redirect);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Sign-in failed';
  }
}
</script>
