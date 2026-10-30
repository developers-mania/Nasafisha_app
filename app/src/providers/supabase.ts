import { createClient, type SupabaseClient, type User as SupabaseUser } from '@supabase/supabase-js';
import type { User, UserRole } from '../types/user';

const rawEnv = import.meta.env as Record<string, string | undefined>;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    rawEnv.VITE_SUPABASE_URL?.trim() &&
      (rawEnv.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || rawEnv.VITE_SUPABASE_ANON_KEY?.trim())
  );
}

export function getSupabaseClient(): SupabaseClient {
  const url = rawEnv.VITE_SUPABASE_URL?.trim();
  const publishableKey =
    rawEnv.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || rawEnv.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url || !publishableKey) {
    throw new Error(
      'Google sign-in is not configured. Set VITE_SUPABASE_URL and either VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY in app/.env.'
    );
  }

  client ??= createClient(url, publishableKey);
  return client;
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'citizen' || value === 'field' || value === 'contractor';
}

function metadataString(metadata: Record<string, unknown>, key: string): string | undefined {
  const value = metadata[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function toAppUser(user: SupabaseUser): User | null {
  const appMetadata: Record<string, unknown> = user.app_metadata;
  const metadataRole = appMetadata.role;
  let role: UserRole;

  if (metadataRole !== undefined) {
    if (!isUserRole(metadataRole)) return null;
    role = metadataRole;
  } else {
    const providers = appMetadata.providers;
    const isGoogleUser =
      appMetadata.provider === 'google' ||
      (Array.isArray(providers) && providers.includes('google'));

    if (!isGoogleUser) return null;
    role = 'citizen';
  }

  const userMetadata: Record<string, unknown> = user.user_metadata;
  const email = user.email ?? undefined;

  return {
    id: user.id,
    name:
      metadataString(userMetadata, 'full_name') ??
      metadataString(userMetadata, 'name') ??
      email ??
      'Google user',
    email,
    avatar: metadataString(userMetadata, 'avatar_url'),
    role,
  };
}
