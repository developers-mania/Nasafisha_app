import { describe, expect, it } from 'vitest';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { toAppUser } from '../../src/providers/supabase';

function createSupabaseUser(
  appMetadata: Record<string, unknown>,
  userMetadata: Record<string, unknown> = {}
): SupabaseUser {
  return {
    id: 'google-user-1',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'person@example.com',
    app_metadata: appMetadata,
    user_metadata: userMetadata,
    created_at: '2026-01-01T00:00:00.000Z',
  } as SupabaseUser;
}

describe('Supabase user role mapping', () => {
  it('gives new Google accounts the least-privileged citizen role', () => {
    const user = toAppUser(createSupabaseUser({ provider: 'google', providers: ['google'] }));

    expect(user?.role).toBe('citizen');
  });

  it('uses a provisioned application role instead of Google profile metadata', () => {
    const user = toAppUser(
      createSupabaseUser(
        { provider: 'google', role: 'admin' },
        { role: 'citizen', full_name: 'Nakuru Staff' }
      )
    );

    expect(user?.role).toBe('admin');
    expect(user?.name).toBe('Nakuru Staff');
  });

  it('does not trust profile roles or accept invalid provisioned roles', () => {
    expect(toAppUser(createSupabaseUser({ provider: 'google' }, { role: 'admin' }))?.role).toBe(
      'citizen'
    );
    expect(toAppUser(createSupabaseUser({ provider: 'google', role: 'owner' }))).toBeNull();
    expect(toAppUser(createSupabaseUser({ provider: 'email' }))).toBeNull();
  });
});
