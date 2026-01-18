import { getAuthToken, isTokenExpired, removeAuthToken } from '@/lib/utils/storage';

/**
 * Token manager utilities
 */
export const TokenManager = {
  /**
   * Decode JWT token payload
   */
  decodeToken: (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Get current user ID from token
   */
  getUserId: (): string | null => {
    const token = getAuthToken();
    if (!token) return null;

    const payload = TokenManager.decodeToken(token);
    return payload?.sub || null;
  },

  /**
   * Get current user email from token
   */
  getUserEmail: (): string | null => {
    const token = getAuthToken();
    if (!token) return null;

    const payload = TokenManager.decodeToken(token);
    return payload?.email || null;
  },

  /**
   * Get token JTI (JWT ID)
   */
  getTokenJTI: (): string | null => {
    const token = getAuthToken();
    if (!token) return null;

    const payload = TokenManager.decodeToken(token);
    return payload?.jti || null;
  },

  /**
   * Validate token (check if exists and not expired)
   */
  isValid: (): boolean => {
    const token = getAuthToken();
    return !!token && !isTokenExpired();
  },

  /**
   * Clear token (for logout)
   */
  clear: (): void => {
    removeAuthToken();
  },
};
