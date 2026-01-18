import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api/auth.api';
import type { RegisterRequest } from '../types/auth.types';

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      // Register user
      const user = await authAPI.register(credentials);
      return { user, credentials };
    },
    onSuccess: (data) => {
      // Redirect to login page with credentials
      navigate('/login', {
        state: {
          email: data.credentials.email,
          password: data.credentials.password,
          registered: true,
        },
      });
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
    },
  });
};
