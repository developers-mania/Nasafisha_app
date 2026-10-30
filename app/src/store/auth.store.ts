import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth.api';
import type {
  User,
  UserRole,
  AuthSession,
  LoginCredentials,
} from '../types/user';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  toAppUser,
} from '../providers/supabase';
import type { Session } from '@supabase/supabase-js';

const TOKEN_KEY = 'nasafisha_auth_token';
const USER_KEY = 'nasafisha_auth_user';
const AUTH_PROVIDER_KEY = 'nasafisha_auth_provider';
type AuthProvider = 'api' | 'supabase';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const user = ref<User | null>(
    localStorage.getItem(USER_KEY)
      ? JSON.parse(localStorage.getItem(USER_KEY)!)
      : null,
  );
  const authProvider = ref<AuthProvider | null>(
    localStorage.getItem(AUTH_PROVIDER_KEY) === 'supabase'
      ? 'supabase'
      : localStorage.getItem(AUTH_PROVIDER_KEY) === 'api'
        ? 'api'
        : null,
  );
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const role = computed<UserRole | null>(() => user.value?.role || null);

  function hasRole(requiredRoles: UserRole | UserRole[]): boolean {
    if (!user.value) return false;
    const roles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];
    return roles.includes(user.value.role);
  }

  function setSession(session: AuthSession, provider: AuthProvider = 'api') {
    token.value = session.token;
    user.value = session.user;
    authProvider.value = provider;
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    localStorage.setItem(AUTH_PROVIDER_KEY, provider);
    error.value = null;
  }

  function clearSession() {
    token.value = null;
    user.value = null;
    authProvider.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_PROVIDER_KEY);
  }

  function setSupabaseSession(session: Session): User {
    const appUser = toAppUser(session.user);
    if (!appUser) {
      throw new Error(
        'This Google account has no valid Nasafisha role. Ask an administrator to assign a role in Supabase.',
      );
    }

    setSession(
      {
        token: session.access_token,
        refreshToken: session.refresh_token,
        user: appUser,
        expiresAt: session.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : undefined,
      },
      'supabase',
    );
    return appUser;
  }

  async function login(credentials: LoginCredentials): Promise<User> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authApi.login(credentials);
      if (response.success && response.data) {
        setSession(response.data);
        return response.data.user;
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      const nestedError =
        typeof err === 'object' && err !== null && 'error' in err
          ? err.error
          : null;
      const nestedMessage =
        typeof nestedError === 'object' &&
        nestedError !== null &&
        'message' in nestedError &&
        typeof nestedError.message === 'string'
          ? nestedError.message
          : null;
      const msg =
        nestedMessage ||
        (err instanceof Error ? err.message : 'Authentication failed');
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  async function requestCitizenOtp(email: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authApi.requestCitizenOtp(email);
      if (!response.success) {
        throw new Error(
          response.error?.message ||
            response.message ||
            'Could not send sign-in code.',
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not send sign-in code.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function loginCitizen(
    email: string,
    code: string,
    name?: string,
  ): Promise<User> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authApi.loginCitizen(email, code, name);
      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message ||
            response.message ||
            'Citizen sign-in failed.',
        );
      }
      setSession(response.data);
      return response.data.user;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Citizen sign-in failed.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function loginWithGoogle(redirect?: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      if (redirect?.startsWith('/') && !redirect.startsWith('//')) {
        callbackUrl.searchParams.set('redirect', redirect);
      }

      const { error: oauthError } =
        await getSupabaseClient().auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: callbackUrl.toString() },
        });
      if (oauthError) throw oauthError;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Google sign-in could not be started.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function completeGoogleLogin(): Promise<User> {
    isLoading.value = true;
    error.value = null;
    try {
      const { data, error: sessionError } =
        await getSupabaseClient().auth.getSession();
      if (sessionError) throw sessionError;
      if (!data.session) {
        throw new Error(
          'Google sign-in did not return a session. Please try again.',
        );
      }

      try {
        return setSupabaseSession(data.session);
      } catch (roleError) {
        let signOutMessage: string | null = null;
        try {
          const { error: signOutError } =
            await getSupabaseClient().auth.signOut();
          signOutMessage = signOutError?.message ?? null;
        } catch (signOutError) {
          signOutMessage =
            signOutError instanceof Error
              ? signOutError.message
              : 'Unknown sign-out error.';
        } finally {
          clearSession();
        }

        if (signOutMessage) {
          throw new Error(
            `${roleError instanceof Error ? roleError.message : 'The account has no valid role.'} Sign-out also failed: ${signOutMessage}`,
          );
        }
        throw roleError;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Google sign-in failed.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  function initializeSupabaseAuthListener(): void {
    if (!isSupabaseConfigured()) return;

    let supabaseClient: ReturnType<typeof getSupabaseClient>;
    try {
      supabaseClient = getSupabaseClient();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to initialize Supabase.';
      return;
    }

    const { data } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        if (authProvider.value === 'supabase') clearSession();
        return;
      }
      if (authProvider.value !== 'supabase' || !session) return;

      try {
        setSupabaseSession(session);
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : 'Unable to restore the Google session.';
        clearSession();
      }
    });

    window.addEventListener(
      'beforeunload',
      () => data.subscription.unsubscribe(),
      { once: true },
    );
  }

  async function loginContractor(
    email: string,
    password: string,
  ): Promise<User> {
    return login({
      email,
      password,
      role: 'contractor',
    });
  }

  async function logout() {
    if (authProvider.value === 'supabase') {
      try {
        const { error: signOutError } =
          await getSupabaseClient().auth.signOut();
        if (signOutError)
          error.value = `Signed out locally, but Supabase sign-out failed: ${signOutError.message}`;
      } catch (err) {
        error.value =
          err instanceof Error
            ? `Signed out locally, but Supabase sign-out failed: ${err.message}`
            : 'Signed out locally, but Supabase sign-out failed.';
      } finally {
        clearSession();
      }
      return;
    }

    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }

  async function restoreSession(): Promise<boolean> {
    if (authProvider.value === 'supabase') {
      try {
        const { data, error: sessionError } =
          await getSupabaseClient().auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) {
          clearSession();
          return false;
        }
        setSupabaseSession(data.session);
        return true;
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : 'Unable to restore the Google session.';
        clearSession();
        return false;
      }
    }

    if (!token.value) return false;
    try {
      const res = await authApi.me();
      if (res.success && res.data) {
        user.value = res.data;
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        return true;
      }
      return false;
    } catch {
      clearSession();
      return false;
    }
  }

  // Listen to 401 unauthorized events from Axios interceptor
  if (typeof window !== 'undefined') {
    window.addEventListener('nasafisha:unauthorized', () => {
      clearSession();
    });
  }

  return {
    token,
    user,
    authProvider,
    role,
    isLoading,
    error,
    isAuthenticated,
    hasRole,
    setSession,
    login,
    requestCitizenOtp,
    loginCitizen,
    loginWithGoogle,
    completeGoogleLogin,
    initializeSupabaseAuthListener,
    loginContractor,
    logout,
    restoreSession,
  };
});

export default useAuthStore;
