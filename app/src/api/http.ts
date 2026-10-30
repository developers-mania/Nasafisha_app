import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse } from '../types/api';
import env from '../config/env';

const baseURL = env.apiBaseUrl;
const TOKEN_KEY = 'nasafisha_auth_token';
const AUTH_PROVIDER_KEY = 'nasafisha_auth_provider';

export const httpClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer token
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const authProvider = localStorage.getItem(AUTH_PROVIDER_KEY);
    if (token && authProvider !== 'supabase' && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Standardize { success, data, message, error } envelope
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any> | any>) => {
    // If the backend already returns the standard envelope, return it directly
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response;
    }
    // Normalize plain json-server / REST responses into the envelope
    response.data = {
      success: true,
      data: response.data,
      message: 'Request successful',
    } as ApiResponse<any>;
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorData = error.response?.data;

    const envelopeError: ApiResponse = {
      success: false,
      error: {
        code: errorData?.error?.code || (status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : 'SERVER_ERROR'),
        message: errorData?.error?.message || errorData?.message || error.message || 'An unexpected error occurred',
        details: errorData?.error?.details || errorData,
      },
    };

    if (status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('nasafisha_auth_user');
      window.dispatchEvent(new CustomEvent('nasafisha:unauthorized'));
    }

    return Promise.reject(envelopeError);
  }
);

/**
 * Typed API helper functions that return standard ApiResponse<T> envelopes
 */
export const api = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const res = await httpClient.get<ApiResponse<T>>(url, config);
    return res.data;
  },
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const res = await httpClient.post<ApiResponse<T>>(url, data, config);
    return res.data;
  },
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const res = await httpClient.put<ApiResponse<T>>(url, data, config);
    return res.data;
  },
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const res = await httpClient.patch<ApiResponse<T>>(url, data, config);
    return res.data;
  },
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const res = await httpClient.delete<ApiResponse<T>>(url, config);
    return res.data;
  },
};

export default httpClient;
