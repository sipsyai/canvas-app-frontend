import { useState, useEffect } from 'react';
import { getAuthToken, isTokenExpired, removeAuthToken } from '@/lib/utils/storage';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentToken = getAuthToken();

        if (!currentToken) {
          setIsAuthenticated(false);
          setToken(null);
          return;
        }

        // Check if token is expired
        if (isTokenExpired()) {
          removeAuthToken(); // Clean up expired token
          setIsAuthenticated(false);
          setToken(null);
          return;
        }

        // Token is valid
        setIsAuthenticated(true);
        setToken(currentToken);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading, token };
};
