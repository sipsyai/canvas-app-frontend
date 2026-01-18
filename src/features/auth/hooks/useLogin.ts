import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '@/lib/api/auth.api';
import { setAuthToken } from '@/lib/utils/storage';
import type { LoginCredentials } from '../types/auth.types';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await loginAPI(credentials.email, credentials.password);
      return response;
    },
    onSuccess: (data) => {
      // Store JWT token in localStorage
      setAuthToken(data.access_token);

      // Redirect to dashboard
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
    },
  });
};
