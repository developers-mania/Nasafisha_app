<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../../i18n'
import { useAuthStore } from '@/store/auth.store'
import { homeRouteFor } from '@/config/roles'
import { ERROR_CODES, getApiErrorCode } from '@/api/errorCodes'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorKey = ref<string | null>(null)

// Maps an API error code to a translated message.
function errorKeyFor(code: string | null): string {
  switch (code) {
    case ERROR_CODES.ACCOUNT_LOCKED:
      return 'adminLogin.errors.locked'
    case ERROR_CODES.ACCOUNT_INACTIVE:
      return 'adminLogin.errors.inactive'
    case ERROR_CODES.INVALID_CREDENTIALS:
      return 'adminLogin.errors.invalid'
    default:
      return 'adminLogin.errors.generic'
  }
}

// Only follow redirects that stay inside /admin.
function safeRedirect(): string | null {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/admin') ? target : null
}

async function onSubmit() {
  errorKey.value = null
  isLoading.value = true
  try {
    const user = await auth.login({ email: email.value.trim(), password: password.value, role: 'admin' })
    await router.push(safeRedirect() ?? homeRouteFor(user.role))
  } catch (err) {
    errorKey.value = errorKeyFor(getApiErrorCode(err))
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="rounded border border-stone-200 bg-white p-6">
    <h1 class="text-2xl font-bold text-green-900">{{ t('adminLogin.title') }}</h1>

    <form class="mt-4 space-y-4" novalidate @submit.prevent="onSubmit">
      <div>
        <label for="email" class="mb-1 block text-sm font-medium">{{ t('adminLogin.email') }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="username"
          required
          class="w-full rounded border border-stone-300 px-3 py-2"
        />
      </div>

      <div>
        <label for="password" class="mb-1 block text-sm font-medium">{{ t('adminLogin.password') }}</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          class="w-full rounded border border-stone-300 px-3 py-2"
        />
      </div>

      <p v-if="errorKey" role="alert" class="rounded bg-red-50 px-3 py-2 text-sm text-red-800">
        {{ t(errorKey) }}
      </p>

      <button
        type="submit"
        :disabled="isLoading || !email || !password"
        class="rounded bg-green-700 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {{ isLoading ? t('adminLogin.submitting') : t('adminLogin.submit') }}
      </button>
    </form>

    <GoogleSignInButton />

    <p class="mt-4 text-sm text-stone-600">{{ t('adminLogin.lockedHelp') }}</p>
  </section>
</template>