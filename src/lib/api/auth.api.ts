import axios from 'axios';
import type { LoginResponse } from '@/features/auth/types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const loginAPI = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // IMPORTANT: Use URLSearchParams for form-data format!
    const formData = new URLSearchParams();
    formData.append('username', email); // Backend expects 'username', NOT 'email'
    formData.append('password', password);

    const { data } = await axios.post<LoginResponse>(
      `${API_BASE_URL}/api/auth/login`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    }
    if (error.response?.status === 422) {
      throw new Error('Please check your input');
    }
    throw new Error('Login failed. Please try again.');
  }
};
