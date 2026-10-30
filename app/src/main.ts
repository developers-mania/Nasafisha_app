import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { registerServiceWorker } from './offline/sw';
import { useAuthStore } from './store/auth.store';

// Import design tokens and global styles
import './tokens.css';
import './style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
const authStore = useAuthStore();
authStore.initializeSupabaseAuthListener();

if (authStore.authProvider === 'supabase') {
  await authStore.restoreSession();
}

app.use(router);

await router.isReady();
app.mount('#app');

// Register service worker for PWA capabilities
registerServiceWorker();
