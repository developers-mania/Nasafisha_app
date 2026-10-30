import { api } from './http';
import type { ApiResponse } from '../types/api';
import type {
  User,
  AuthSession,
  LoginCredentials,
  UserRole,
} from '../types/user';

interface BackendUser {
  id: string | number;
  name: string;
  email?: string;
  role: string;
  zone?: string | null;
  assignedZone?: string | null;
  companyName?: string | null;
  crewLabel?: string | null;
  employeeId?: string;
}

interface BackendAuthResponse {
  token?: string;
  access_token?: string;
  user?: BackendUser;
}

function mapBackendRole(role: string): UserRole | null {
  if (
    ['admin', 'executive', 'operations_manager', 'county_ict_admin'].includes(
      role,
    )
  ) {
    return 'admin';
  }
  if (['field', 'field_crew', 'field_supervisor'].includes(role))
    return 'field';
  if (role === 'citizen' || role === 'contractor') return role;
  return null;
}

function mapBackendUser(user: BackendUser): User {
  const role = mapBackendRole(user.role);
  if (!role) {
    throw new Error(
      `The backend returned an unsupported account role: ${user.role}`,
    );
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    assignedZone: user.assignedZone ?? user.zone ?? undefined,
    companyName: user.companyName ?? user.crewLabel ?? undefined,
    badgeNumber: user.employeeId,
  };
}

function toAuthSession(
  response: BackendAuthResponse,
  expectedRole: UserRole,
): AuthSession {
  const token = response.token ?? response.access_token;
  if (!token || !response.user) {
    throw new Error('The backend returned an incomplete sign-in response.');
  }

  const user = mapBackendUser(response.user);
  if (user.role !== expectedRole) {
    throw new Error(
      'The signed-in account does not have access to this portal.',
    );
  }

  return { token, user };
}

function apiErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const payload = error.error;
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      (typeof payload.message === 'string' ||
        (Array.isArray(payload.message) &&
          payload.message.every(
            (message: unknown) => typeof message === 'string',
          )))
    ) {
      return Array.isArray(payload.message)
        ? payload.message.join(', ')
        : payload.message;
    }
  }
  return 'The backend request failed.';
}

export const authApi = {
  async login(payload: LoginCredentials): Promise<ApiResponse<AuthSession>> {
    let path: string;
    let credentials: Record<string, string>;

    switch (payload.role) {
      case 'admin':
        path = '/auth/admin/login';
        credentials = {
          email: payload.email ?? '',
          password: payload.password ?? '',
        };
        break;
      case 'contractor':
        path = '/auth/contractor/login';
        credentials = {
          email: payload.email ?? '',
          password: payload.password ?? '',
        };
        break;
      case 'field':
        path = '/auth/crew/login';
        credentials = {
          employeeId: payload.contractorCode ?? '',
          pin: payload.password ?? '',
        };
        break;
      case 'citizen':
        throw new Error(
          'Citizen password sign-in is not available in the NestJS API. This screen needs the citizen email-code flow.',
        );
    }

    try {
      const response = await api.post<BackendAuthResponse>(path, credentials);
      if (!response.data) {
        throw new Error('The backend returned an empty sign-in response.');
      }
      return {
        ...response,
        data: toAuthSession(response.data, payload.role),
      };
    } catch (error) {
      throw new Error(apiErrorMessage(error));
    }
  },

  async loginContractor(
    email: string,
    password: string,
  ): Promise<ApiResponse<AuthSession>> {
    return this.login({ email, password, role: 'contractor' });
  },

  async loginCitizen(
    email: string,
    code: string,
    name?: string,
  ): Promise<ApiResponse<AuthSession>> {
    try {
      const response = await api.post<BackendAuthResponse>('/auth/otp/verify', {
        email,
        code,
        ...(name ? { name } : {}),
      });
      if (!response.data) {
        throw new Error('The backend returned an empty sign-in response.');
      }
      return {
        ...response,
        data: toAuthSession(response.data, 'citizen'),
      };
    } catch (error) {
      throw new Error(apiErrorMessage(error));
    }
  },

  async requestCitizenOtp(
    email: string,
  ): Promise<ApiResponse<{ email: string }>> {
    try {
      return await api.post<{ email: string }>('/auth/otp/request', { email });
    } catch (error) {
      throw new Error(apiErrorMessage(error));
    }
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
    if (!response.data) {
      throw new Error('The backend returned an empty session response.');
    }
    return { ...response, data: mapBackendUser(response.data) };
  },

  async logout(): Promise<ApiResponse<null>> {
    localStorage.removeItem('nasafisha_auth_token');
    localStorage.removeItem('nasafisha_auth_user');
    localStorage.removeItem('nasafisha_auth_provider');
    return {
      success: true,
      data: null,
      message: 'Signed out on this device',
    };
  },
};

export default authApi;
