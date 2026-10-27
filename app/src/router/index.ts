import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';
import adminRoutes from './routes/admin.routes';
import citizenRoutes from './routes/citizen.routes';
import fieldRoutes from './routes/field.routes';
import contractorRoutes from './routes/contractor.routes';
import legacyRoutes from './routes/legacy.routes';
import StaffLogin from '../views/auth/StaffLogin.vue';
import AdminLogin from '../views/auth/AdminLogin.vue';
import LanguageView from '../views/citizen/onboarding/LanguageView.vue';
import AuthChoiceView from '../views/citizen/onboarding/AuthChoiceView.vue';
import RegisterView from '../views/citizen/onboarding/RegisterView.vue';
import EmailView from '../views/citizen/onboarding/EmailView.vue';
import OtpView from '../views/citizen/onboarding/OtpView.vue';
import PermissionsView from '../views/citizen/onboarding/PermissionsView.vue';
import AllSetView from '../views/citizen/onboarding/AllSetView.vue';
import ForbiddenView from '../views/auth/Forbidden.vue';
import NotFoundView from '../views/auth/NotFound.vue';
import { setupRouteGuards } from './guards';
import { useAuthStore } from '../store/auth.store';
import { homeRouteFor } from '../config/roles';

/**
 * Public entry point: signed-in users go to their portal home,
 * guests land on the citizen language picker (FR-001).
 */
function defaultHome(): string {
  const auth = useAuthStore();
  return auth.isAuthenticated && auth.role ? homeRouteFor(auth.role) : '/citizen/welcome';
}

const routes: RouteRecordRaw[] = [
  // Public & Authentication routes (AuthLayout shell — FE-031)
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'StaffLogin',
        component: StaffLogin,
        meta: {
          guestOnly: true,
          title: 'Staff Login',
        },
      },
    ],
  },
  // Alternate admin login (email + password) — /login stays canonical
  {
    path: '/login/admin',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'AdminLogin',
        component: AdminLogin,
        meta: {
          guestOnly: true,
          title: 'Admin Login',
        },
      },
    ],
  },
  // Citizen onboarding: language → email code → camera/location.
  {
    path: '/citizen/welcome',
    name: 'CitizenLanguage',
    component: LanguageView,
    meta: {
      guestOnly: true,
      title: 'Choose your language',
    },
  },
  // Login or register — the citizen picks which journey to start (FE decision)
  {
    path: '/citizen/auth-choice',
    name: 'CitizenAuthChoice',
    component: AuthChoiceView,
    meta: {
      guestOnly: true,
      title: 'Sign in or register',
    },
  },
  {
    path: '/citizen/register',
    name: 'CitizenRegister',
    component: RegisterView,
    meta: {
      guestOnly: true,
      title: 'Create your account',
    },
  },
  {
    path: '/citizen/login',
    name: 'CitizenLogin',
    component: EmailView,
    meta: {
      guestOnly: true,
      title: 'Citizen Sign-In',
    },
  },
  {
    path: '/citizen/login/otp',
    name: 'CitizenOtp',
    component: OtpView,
    meta: {
      guestOnly: true,
      title: 'Enter code',
    },
  },
  {
    path: '/citizen/login/email',
    redirect: '/citizen/login',
  },
  {
    path: '/citizen/onboarding/permissions',
    name: 'CitizenPermissions',
    component: PermissionsView,
    meta: {
      title: 'Camera & location',
    },
  },
  {
    path: '/citizen/onboarding/all-set',
    name: 'CitizenAllSet',
    component: AllSetView,
    meta: {
      title: 'All set',
    },
  },
  {
    path: '/forbidden',
    name: 'Forbidden',
    component: ForbiddenView,
    meta: {
      title: 'Access Forbidden',
    },
  },

  // Role domain routes (each wrapped in its own layout — FE-031/033)
  ...adminRoutes,
  ...citizenRoutes,
  ...fieldRoutes,
  ...contractorRoutes,

  // Legacy demo screens (no auth guard)
  ...legacyRoutes,

  // Root redirect
  {
    path: '/',
    redirect: defaultHome,
  },

  // Catch-all 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: 'Page Not Found',
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Attach role-based route guard
setupRouteGuards(router);

export default router;
