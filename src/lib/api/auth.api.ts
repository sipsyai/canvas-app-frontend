import apiClient from './client';
import type { User, LoginResponse, RegisterRequest } from '@/features/auth/types/auth.types';

export const authAPI = {
  /**
   * Login user (OAuth2 Password Flow - form-data format!)
   * Backend Docs: /backend-docs/api/01-authentication/02-login.md
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // IMPORTANT: Use URLSearchParams for form-data (OAuth2 standard)
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);

    const { data } = await apiClient.post<LoginResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return data;
  },

  /**
   * Register new user
   * Backend Docs: /backend-docs/api/01-authentication/01-register.md
   */
  register: async (request: RegisterRequest): Promise<User> => {
    const { data } = await apiClient.post<User>('/api/auth/register', {
      email: request.email,
      password: request.password,
      full_name: request.fullName,
    });

    return data;
  },

  /**
   * Get current user (requires JWT token)
   * Backend Docs: /backend-docs/api/01-authentication/03-get-current-user.md
   */
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/api/auth/me');
    return data;
  },

  /**
   * Logout user (blacklist token)
   * Backend Docs: /backend-docs/api/01-authentication/04-logout.md
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },
};
