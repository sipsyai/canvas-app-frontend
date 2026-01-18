import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuthToken, isTokenExpired, removeAuthToken, getTokenRemainingTime } from '@/lib/utils/storage';

/**
 * Hook to monitor token expiry and auto-logout
 * Usage: Call this in root component (App.tsx or Layout)
 */
export const useTokenExpiry = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = getAuthToken();

    // Only check expiry if there IS a token
    if (token && isTokenExpired()) {
      handleTokenExpired();
      return;
    }

    // Check every 30 seconds
    const interval = setInterval(() => {
      const currentToken = getAuthToken();

      // Only check if token exists
      if (currentToken && isTokenExpired()) {
        handleTokenExpired();
      } else if (currentToken) {
        // Optional: Show warning 5 minutes before expiry
        const remainingTime = getTokenRemainingTime();
        if (remainingTime <= 300 && remainingTime > 270) {
          // Show warning only once (when 5 minutes remaining)
          console.warn('Your session will expire in 5 minutes');
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [navigate, location]);

  const handleTokenExpired = () => {
    // Remove token
    removeAuthToken();

    // Redirect to login
    navigate('/login');
  };
};
