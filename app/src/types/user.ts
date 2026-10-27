/**
 * User and Identity Types for NASAFISHA
 * Roles: admin | citizen | field | contractor
 */

export type UserRole = 'admin' | 'citizen' | 'field' | 'contractor';

export interface User {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  companyName?: string;    // For franchise contractors
  contractorId?: string;   // Associated franchise ID
  assignedZone?: string;   // e.g. "Nakuru East Franchise"
  badgeNumber?: string;    // For field crew
  createdAt?: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt?: string;
}

export interface LoginCredentials {
  email?: string;
  password?: string;
  contractorCode?: string;
  role: UserRole;
}
