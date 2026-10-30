import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../src/api/http';
import { authApi } from '../../src/api/auth.api';

vi.mock('../../src/api/http', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('NestJS authentication API adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the admin login route and maps backend admin roles', async () => {
    vi.mocked(api.post).mockResolvedValue({
      success: true,
      data: {
        token: 'admin-token',
        user: { id: 'admin-1', name: 'Admin', role: 'operations_manager' },
      },
    } as never);

    const response = await authApi.login({
      email: 'admin@example.com',
      password: 'password',
      role: 'admin',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/admin/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    expect(response.data?.user.role).toBe('admin');
  });

  it('uses the contractor login route', async () => {
    vi.mocked(api.post).mockResolvedValue({
      success: true,
      data: {
        token: 'contractor-token',
        user: { id: 'contractor-1', name: 'Contractor', role: 'contractor' },
      },
    } as never);

    await authApi.login({
      email: 'contractor@example.com',
      password: 'password',
      role: 'contractor',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/contractor/login', {
      email: 'contractor@example.com',
      password: 'password',
    });
  });

  it('maps employee ID and PIN to the crew login DTO', async () => {
    vi.mocked(api.post).mockResolvedValue({
      success: true,
      data: {
        token: 'crew-token',
        user: { id: 'crew-1', name: 'Crew member', role: 'field_crew' },
      },
    } as never);

    await authApi.login({
      contractorCode: 'NKR-0417',
      password: '123456',
      role: 'field',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/crew/login', {
      employeeId: 'NKR-0417',
      pin: '123456',
    });
  });

  it('requests a citizen sign-in code from the NestJS API', async () => {
    vi.mocked(api.post).mockResolvedValue({
      success: true,
      data: { email: 'resident@example.com' },
    } as never);

    await authApi.requestCitizenOtp('resident@example.com');

    expect(api.post).toHaveBeenCalledWith('/auth/otp/request', {
      email: 'resident@example.com',
    });
  });

  it('verifies a citizen code and sends the registration name when provided', async () => {
    vi.mocked(api.post).mockResolvedValue({
      success: true,
      data: {
        token: 'citizen-token',
        user: {
          id: 'citizen-1',
          name: 'Resident',
          email: 'resident@example.com',
          role: 'citizen',
        },
      },
    } as never);

    await authApi.loginCitizen('resident@example.com', '123456', 'Resident');

    expect(api.post).toHaveBeenCalledWith('/auth/otp/verify', {
      email: 'resident@example.com',
      code: '123456',
      name: 'Resident',
    });
  });

  it('does not fake a session when the backend request fails', async () => {
    vi.mocked(api.post).mockRejectedValue({
      error: { message: 'Email or password is wrong.' },
    });

    await expect(
      authApi.login({
        email: 'admin@example.com',
        password: 'wrong-password',
        role: 'admin',
      }),
    ).rejects.toThrow('Email or password is wrong.');
  });
});
