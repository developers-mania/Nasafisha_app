<script setup lang="ts">
import { useI18n } from '../../i18n'
import { ROLES, type Role } from '@/config/roles'
import type { Account, AccountStatus } from '@/types/account'

defineProps<{ accounts: Account[] }>()
const emit = defineEmits<{
  (e: 'change-role', id: string, role: Role): void
  (e: 'toggle-active', id: string): void
}>()
const { t } = useI18n()

// Citizens sign in with an email code, so they are not managed here.
const ASSIGNABLE: Role[] = [
  ROLES.EXECUTIVE, ROLES.OPERATIONS_MANAGER, ROLES.FIELD_SUPERVISOR, ROLES.FIELD_CREW, ROLES.COUNTY_ICT_ADMIN,
]
const STATUS_STYLES: Record<AccountStatus, string> = {
  active: 'bg-green-100 text-green-900',
  locked: 'bg-amber-100 text-amber-900',
  inactive: 'bg-stone-200 text-stone-700',
}
</script>

<template>
  <div class="overflow-x-auto rounded border border-stone-200 bg-white">
    <table class="w-full text-left text-sm">
      <thead class="border-b border-stone-200 text-stone-600">
        <tr>
          <th class="p-3 font-semibold">{{ t('admin.accounts.name') }}</th>
          <th class="p-3 font-semibold">{{ t('admin.accounts.role') }}</th>
          <th class="p-3 font-semibold">{{ t('admin.accounts.zone') }}</th>
          <th class="p-3 font-semibold">{{ t('admin.accounts.status') }}</th>
          <th class="p-3"><span class="sr-only">{{ t('admin.accounts.actions') }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in accounts" :key="a.id" class="border-b border-stone-100 last:border-0">
          <td class="p-3">
            {{ a.name }}<span v-if="a.employeeId" class="text-stone-500"> ({{ a.employeeId }})</span>
          </td>
          <td class="p-3">
            <select
              :value="a.role"
              :aria-label="t('admin.accounts.role')"
              class="rounded border border-stone-300 px-2 py-1"
              @change="emit('change-role', a.id, ($event.target as HTMLSelectElement).value as Role)"
            >
              <option v-for="r in ASSIGNABLE" :key="r" :value="r">{{ t(`roles.${r}`) }}</option>
            </select>
          </td>
          <td class="p-3">{{ a.zone }}</td>
          <td class="p-3">
            <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="STATUS_STYLES[a.status]">
              {{ t(`admin.accounts.statuses.${a.status}`) }}
            </span>
          </td>
          <td class="p-3 text-right">
            <button type="button" class="text-sm text-green-800 underline" @click="emit('toggle-active', a.id)">
              {{ a.status === 'inactive' ? t('admin.accounts.activate') : t('admin.accounts.deactivate') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>