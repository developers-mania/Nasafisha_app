<template>
  <CitizenOnboardLayout>
    <router-link
      to="/citizen/login"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ns-ash-600,#4F5B57)] transition hover:text-[var(--ns-ash-900,#17211F)]"
    >
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {{ t('otp.back') }}
    </router-link>

    <h1 class="mt-3 text-2xl font-bold tracking-tight text-[var(--ns-ash-900,#17211F)]">
      {{ t('otp.title') }}
    </h1>
    <p class="mt-2 text-sm text-[var(--ns-ash-600,#4F5B57)]">
      {{ t('otp.subtitle', { email }) }}
      <router-link to="/citizen/login" class="font-medium text-[var(--ns-leaf-700,#15803D)] underline underline-offset-2">
        {{ t('otp.wrongEmail') }}
      </router-link>
    </p>

    <div class="mt-6 flex gap-2" @paste="onPaste">
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
        :class="error
          ? 'border-[var(--ns-danger-border,#F87171)] bg-[var(--ns-danger-bg,#FEE2E2)]'
          : 'border-[var(--ns-ash-200,#D5DBD9)] focus:border-[var(--ns-leaf-600,#16A34A)]'"
        @input="onInput(i)"
      />
    </div>

    <p
      v-if="error"
      role="alert"
      class="mt-4 rounded-xl bg-[var(--ns-danger-bg,#FEE2E2)] px-4 py-4 text-sm font-medium text-[var(--ns-danger-fg,#991B1B)]"
    >
      {{ error }}
    </p>

    <p class="mt-4 text-xs text-[var(--ns-ash-600,#4F5B57)]">
      <template v-if="secondsLeft > 0">
        {{ t('otp.resend') }} <span class="font-mono font-semibold">{{ timerLabel }}</span>
      </template>
      <button
        v-else
        type="button"
        class="font-semibold text-[var(--ns-leaf-700,#15803D)] underline underline-offset-2 disabled:opacity-50"
        :disabled="resending"
        @click="resend"
      >
        {{ resending ? t('otp.resending') : t('otp.resendNow') }}
      </button>
    </p>

    <button
      type="button"
      class="mt-4 rounded-lg bg-[var(--ns-leaf-700,#15803D)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--ns-leaf-600,#16A34A)] disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="code.length < 6 || confirming"
      @click="confirm"
    >
      {{ confirming ? t('otp.confirming') : t('otp.confirm') }}
    </button>
  </CitizenOnboardLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import CitizenOnboardLayout from '../../../layouts/CitizenOnboardLayout.vue';
import { useOnboardingI18n } from '../../../composables/useOnboardingI18n';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';

const router = useRouter();
const { t } = useOnboardingI18n();
const authStore = useAuthStore();
const digits = ref<string[]>(['', '', '', '', '', '']);
const error = ref('');
const confirming = ref(false);
const resending = ref(false);
const secondsLeft = ref(300);
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
  timer = setInterval(() => {
    if (secondsLeft.value > 0) secondsLeft.value -= 1;
  }, 1000);
});

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

async function resend() {
  error.value = '';
  resending.value = true;
  try {
    await authApi.requestCitizenCode(email);
    digits.value = ['', '', '', '', '', ''];
    secondsLeft.value = 300;
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('email.error');
  } finally {
    resending.value = false;
  }
}

async function confirm() {
  confirming.value = true;
  error.value = '';
  try {
    const name =
      sessionStorage.getItem('ns_auth_mode') === 'register'
        ? sessionStorage.getItem('ns_name') || undefined
        : undefined;
    const session = await authApi.verifyCitizenCode(email, code.value, name);
    authStore.setSession(session);
    sessionStorage.removeItem('ns_auth_mode');
    sessionStorage.removeItem('ns_name');
    sessionStorage.removeItem('ns_email');
    await router.push('/citizen/onboarding/permissions');
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('otp.error');
  } finally {
    confirming.value = false;
  }
}
</script>
