import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api/auth.api';
import { removeAuthToken } from '@/lib/utils/storage';

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      // Call logout API to blacklist token on backend
      await authAPI.logout();
    },
    onSuccess: () => {
      // Remove token from localStorage
      removeAuthToken();

      // Redirect to login page
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);

      // Even if API fails, remove token locally
      removeAuthToken();

      // Redirect to login page
      navigate('/login');
    },
  });
};
