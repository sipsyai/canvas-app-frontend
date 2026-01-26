import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken, removeAuthToken } from '@/lib/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Auto-inject JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle global errors
apiClient.interceptors.response.use(
  (response) => {
    // Success response, return as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired or invalid
    // Just remove the token, let PrivateRoute handle redirect
    if (error.response?.status === 401) {
      // Only remove token if it's not the login endpoint
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        removeAuthToken();
      }
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const errorData = error.response.data as any;

      if (Array.isArray(errorData.detail)) {
        // Pydantic validation errors
        const errors = errorData.detail.map((err: any) => ({
          field: err.loc[err.loc.length - 1],
          message: err.msg,
        }));

        throw {
          status: 422,
          errors,
          message: 'Validation error',
        };
      }
    }

    // Handle other errors
    const errorMessage = (error.response?.data as any)?.detail || error.message || 'An error occurred';

    throw {
      status: error.response?.status,
      message: errorMessage,
      originalError: error,
    };
  }
);

export default apiClient;
