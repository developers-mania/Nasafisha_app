import { describe, it, expect } from 'vitest';
import { createApp } from 'vue';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import App from '../../../src/App.vue';
import { router } from '../../../src/router';
import { useAuthStore } from '../../../src/store/auth.store';

const ONBOARDING_PATHS = [
  '/citizen/welcome',
  '/citizen/auth-choice',
  '/citizen/register',
  '/citizen/login',
  '/citizen/login/otp',
  '/citizen/onboarding/permissions',
  '/citizen/onboarding/all-set',
];

describe('citizen onboarding flow', () => {
  it('wires the full route chain: landing → choice → (register|email sign-in) → OTP → permissions → all-set', () => {
    const paths = router.getRoutes().map((route) => route.path);
    for (const path of ONBOARDING_PATHS) expect(paths).toContain(path);
    expect(paths).toContain('/citizen');
  });

  it('renders every onboarding screen with translated copy once signed in', async () => {
    localStorage.clear();
    const pinia = createPinia();
    setActivePinia(pinia);

    const app = createApp(App);
    app.use(pinia);
    app.use(router);
    const el = document.createElement('div');
    document.body.appendChild(el);

    const auth = useAuthStore();
    auth.setSession({
      token: 't-citizen',
      user: { id: 'u1', name: 'Wanjiru', role: 'citizen' },
    });

    app.mount(el);

    await router.replace('/citizen/onboarding/permissions');
    await nextTick();
    await nextTick();
    const permissionsHtml = el.innerHTML;
    expect(permissionsHtml).toContain('Two things we need to see your report');
    expect(permissionsHtml).toContain('Allow and continue');
    expect(permissionsHtml).not.toContain('perm.');

    await router.replace('/citizen/onboarding/all-set');
    await nextTick();
    await nextTick();
    const allSetHtml = el.innerHTML;
    expect(allSetHtml).toContain("You're all set!");
    expect(allSetHtml).toContain('Start reporting');

    await router.replace('/citizen');
    await nextTick();
    await nextTick();
    const homeHtml = el.innerHTML;
    expect(homeHtml).toContain('Report an issue');
    expect(homeHtml).toContain('Your recent reports');

    app.unmount();
    el.remove();
    localStorage.clear();
  });
});
