/**
 * Typed access to Vite environment variables (FE-033).
 * Falls back to safe development defaults when a variable is unset.
 */

const rawEnv = import.meta.env as Record<string, string | undefined>;

export interface AppEnv {
  /** Base URL prepended to every axios request. */
  apiBaseUrl: string;
  /** Human readable application name used in titles and toasts. */
  appName: string;
  /** Runtime mode: 'development' | 'production' | 'test'. */
  mode: string;
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
}

export const env: AppEnv = {
  apiBaseUrl: rawEnv.VITE_API_BASE_URL || 'http://localhost:4000',
  appName: rawEnv.VITE_APP_NAME || 'Nasafisha',
  mode: rawEnv.MODE || 'development',
  isDev: Boolean(rawEnv.DEV),
  isProd: Boolean(rawEnv.PROD),
  isTest: Boolean(rawEnv.MODE === 'test'),
};

/** Read a single environment variable with a fallback. */
export function envVar(key: string, fallback = ''): string {
  return rawEnv[key] ?? fallback;
}

export default env;
