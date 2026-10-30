<template>
  <CitizenOnboardLayout>
    <router-link
      to="/citizen/login"
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
      {{ t('otp.back') }}
    </router-link>

    <h1
      class="mt-3 text-2xl font-bold tracking-tight text-[var(--ns-ash-900,#17211F)]"
    >
      {{ t('otp.title') }}
    </h1>
    <p class="mt-2 text-sm text-[var(--ns-ash-600,#4F5B57)]">
      {{ t('otp.subtitle', { email }) }}
      <router-link
        to="/citizen/login"
        class="font-medium text-[var(--ns-leaf-700,#15803D)] underline underline-offset-2"
      >
        {{ t('otp.wrongEmail') }}
      </router-link>
    </p>

    <div
      class="mt-6 flex gap-2"
      @paste="onPaste"
    >
      <input
        v-for="(_, i) in digits"
        :key="i"
        :ref="(el) => setBoxRef(el, i)"
        v-model="digits[i]"
        type="text"
        inputmode="numeric"
        maxlength="1"
        :aria-label="`Digit ${i + 1}`"
        class="h-14 w-12 rounded-xl border text-center text-lg font-semibold text-[var(--ns-ash-900,#17211F)] outline-none transition"
        :class="
          error
            ? 'border-[var(--ns-danger-border,#F87171)] bg-[var(--ns-danger-bg,#FEE2E2)]'
            : 'border-[var(--ns-ash-200,#D5DBD9)] focus:border-[var(--ns-leaf-600,#16A34A)]'
        "
        @input="onInput(i)"
      >
    </div>

    <p
      v-if="requestingCode"
      class="mt-4 text-sm text-[var(--ns-ash-600,#4F5B57)]"
    >
      {{ t('otp.sending') }}
    </p>

    <p
      v-if="error"
      role="alert"
      class="mt-4 rounded-xl bg-[var(--ns-danger-bg,#FEE2E2)] px-4 py-4 text-sm font-medium text-[var(--ns-danger-fg,#991B1B)]"
    >
      {{ error }}
    </p>

    <div class="mt-4">
      <p
        v-if="otpSent && secondsLeft > 0"
        class="text-xs text-[var(--ns-ash-600,#4F5B57)]"
      >
        {{ t('otp.resend') }}
        <span class="font-mono font-semibold">{{ timerLabel }}</span>
      </p>
      <button
        v-else
        type="button"
        class="text-sm font-semibold text-[var(--ns-leaf-700,#15803D)] underline underline-offset-2 disabled:opacity-50"
        :disabled="requestingCode"
        @click="requestCode"
      >
        {{ requestingCode ? t('otp.sending') : t('otp.resendNow') }}
      </button>
    </div>

    <button
      type="button"
      class="mt-4 rounded-lg bg-[var(--ns-leaf-700,#15803D)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--ns-leaf-600,#16A34A)] disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="code.length < 6 || confirming || requestingCode || !otpSent"
      @click="confirm"
    >
      {{ confirming ? t('otp.confirming') : t('otp.confirm') }}
    </button>
  </CitizenOnboardLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CitizenOnboardLayout from '../../../layouts/CitizenOnboardLayout.vue';
import { useOnboardingI18n } from '../../../composables/useOnboardingI18n';
import { useAuthStore } from '../../../store/auth.store';

const router = useRouter();
const route = useRoute();
const { t } = useOnboardingI18n();
const authStore = useAuthStore();
const digits = ref<string[]>(['', '', '', '', '', '']);
const error = ref('');
const confirming = ref(false);
const requestingCode = ref(false);
const otpSent = ref(false);
const secondsLeft = ref(0);
const boxes = ref<HTMLInputElement[]>([]);

const email = sessionStorage.getItem('ns_email') || '';

const code = computed(() => digits.value.join(''));

const timerLabel = computed(() => {
  const m = Math.floor(secondsLeft.value / 60);
  const s = String(secondsLeft.value % 60).padStart(2, '0');
  return `${m}:${s}`;
});

let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  if (!email) {
    void router.replace('/citizen/login');
    return;
  }
  boxes.value[0]?.focus();
  void requestCode();
});

function startResendTimer() {
  secondsLeft.value = 60;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (secondsLeft.value <= 1) {
      secondsLeft.value = 0;
      if (timer) clearInterval(timer);
      timer = undefined;
      return;
    }
    secondsLeft.value -= 1;
  }, 1000);
}

onBeforeUnmount(() => clearInterval(timer));

function setBoxRef(el: unknown, i: number) {
  if (el) boxes.value[i] = el as HTMLInputElement;
}

function onInput(i: number) {
  error.value = '';
  digits.value[i] = digits.value[i].replace(/\D/g, '').slice(0, 1);
  if (digits.value[i] && i < 5) boxes.value[i + 1]?.focus();
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text')?.replace(/\D/g, '') ?? '';
  if (!text) return;
  e.preventDefault();
  for (let i = 0; i < 6; i++) digits.value[i] = text[i] ?? '';
}

async function requestCode() {
  if (!email || requestingCode.value) return;
  requestingCode.value = true;
  error.value = '';
  try {
    await authStore.requestCitizenOtp(email);
    otpSent.value = true;
    startResendTimer();
  } catch (requestError) {
    error.value =
      requestError instanceof Error ? requestError.message : t('email.error');
  } finally {
    requestingCode.value = false;
  }
}

async function confirm() {
  confirming.value = true;
  error.value = '';
  try {
    const isRegister = sessionStorage.getItem('ns_auth_mode') === 'register';
    const displayName = isRegister
      ? sessionStorage.getItem('ns_name') || undefined
      : undefined;
    await authStore.loginCitizen(email, code.value, displayName);
    sessionStorage.removeItem('ns_auth_mode');
    sessionStorage.removeItem('ns_name');
    sessionStorage.removeItem('ns_email');
    const redirect = route.query.redirect;
    const destination =
      typeof redirect === 'string' &&
      redirect.startsWith('/') &&
      !redirect.startsWith('//')
        ? redirect
        : isRegister
          ? '/citizen/onboarding/permissions'
          : '/citizen/reports';
    await router.push(destination);
  } catch (verificationError) {
    error.value =
      verificationError instanceof Error
        ? verificationError.message
        : t('otp.error');
  } finally {
    confirming.value = false;
  }
}
</script>
