import { api } from './http';
import type { ApiResponse } from '../types/api';
import type { User, AuthSession, LoginCredentials, UserRole } from '../types/user';

interface BackendUser extends Omit<User, 'role'> {
  role: string;
  zone?: string;
}

interface BackendSession {
  token: string;
  user: BackendUser;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'error' in error) {
    const apiError = (error as ApiResponse).error;
    if (apiError?.message) return apiError.message;
  }
  return fallback;
}

function toFrontendSession(
  session: BackendSession,
  role: UserRole,
): AuthSession {
  return {
    token: session.token,
    user: {
      ...session.user,
      role,
      assignedZone: session.user.zone ?? session.user.assignedZone,
    },
  };
}

function frontendRole(role: string): UserRole {
  if (role === 'citizen') return 'citizen';
  if (role === 'field_crew' || role === 'field_supervisor') return 'field';
  return 'admin';
}

export const authApi = {
  async login(payload: LoginCredentials): Promise<ApiResponse<AuthSession>> {
    if (payload.role === 'citizen') {
      throw new Error('Citizens sign in with an email code. Request a code first.');
    }

    if (payload.role === 'contractor') {
      throw new Error('Contractor sign-in is not available in the backend yet.');
    }

    const response =
      payload.role === 'admin'
        ? await api.post<BackendSession>('/auth/admin/login', {
            email: payload.email,
            password: payload.password,
          })
        : await api.post<BackendSession>('/auth/crew/login', {
            employeeId: payload.contractorCode,
            pin: payload.password,
          });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Authentication failed.');
    }

    return {
      ...response,
      data: toFrontendSession(response.data, payload.role),
    };
  },

  async requestCitizenCode(email: string): Promise<void> {
    try {
      const response = await api.post<{ email: string }>('/auth/otp/request', {
        email,
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Could not send an email code.');
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Could not send an email code.'));
    }
  },

  async verifyCitizenCode(
    email: string,
    code: string,
    name?: string,
  ): Promise<AuthSession> {
    try {
      const response = await api.post<BackendSession>('/auth/otp/verify', {
        email,
        code,
        name,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Email code verification failed.');
      }
      return toFrontendSession(response.data, 'citizen');
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Email code verification failed.'));
    }
  },

  async loginContractor(
    contractorCode: string,
    accessKey: string,
  ): Promise<ApiResponse<AuthSession>> {
    return this.login({
      contractorCode,
      password: accessKey,
      role: 'contractor',
    });
  },

  async loginCitizen(
    email: string,
    code: string,
  ): Promise<ApiResponse<AuthSession>> {
    return {
      success: true,
      data: await this.verifyCitizenCode(email, code),
      message: 'Authenticated successfully as citizen',
    };
  },

  async loginStaff(
    email: string,
    password: string,
  ): Promise<ApiResponse<AuthSession>> {
    return this.login({ email, password, role: 'admin' });
  },

  async loginField(
    employeeId: string,
    pin: string,
  ): Promise<ApiResponse<AuthSession>> {
    return this.login({
      contractorCode: employeeId,
      password: pin,
      role: 'field',
    });
  },

  async me(): Promise<ApiResponse<User>> {
    const response = await api.get<BackendUser>('/auth/me');
    if (!response.success || !response.data) return response;

    return {
      ...response,
      data: {
        ...response.data,
        role: frontendRole(response.data.role),
        assignedZone: response.data.zone ?? response.data.assignedZone,
      },
    };
  },

  async logout(): Promise<ApiResponse<null>> {
    localStorage.removeItem('nasafisha_auth_token');
    localStorage.removeItem('nasafisha_auth_user');
    return {
      success: true,
      data: null,
      message: 'Logged out successfully',
    };
  },
};

export default authApi;
