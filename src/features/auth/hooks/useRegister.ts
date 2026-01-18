import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api/auth.api';
import { setAuthToken } from '@/lib/utils/storage';
import type { RegisterRequest } from '../types/auth.types';

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      // Register user
      const user = await authAPI.register(credentials);

      // Auto-login after successful registration
      const loginResponse = await authAPI.login(credentials.email, credentials.password);

      return { user, loginResponse };
    },
    onSuccess: (data) => {
      // Store JWT token in localStorage
      setAuthToken(data.loginResponse.access_token, data.loginResponse.expires_in);

      // Redirect to dashboard
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
    },
  });
};
