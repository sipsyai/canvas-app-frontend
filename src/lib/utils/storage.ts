const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'token_expires_at';

/**
 * Store JWT token and its expiration time
 */
export const setAuthToken = (token: string, expiresIn?: number): void => {
  localStorage.setItem(TOKEN_KEY, token);

  if (expiresIn) {
    // Calculate expiration timestamp
    const expiresAt = Date.now() + (expiresIn * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
  }
};

/**
 * Get stored JWT token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove JWT token and expiration time
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Check if token is expired
 * Method 1: Use stored expiration timestamp (faster)
 * Method 2: Decode JWT and check exp field (more accurate)
 */
export const isTokenExpired = (): boolean => {
  const token = getAuthToken();
  if (!token) return true;

  // Method 1: Check stored expiration timestamp
  const expiresAt = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (expiresAt) {
    return Date.now() >= parseInt(expiresAt);
  }

  // Method 2: Decode JWT token
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;

    if (!exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= exp * 1000;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Get remaining time until token expires (in seconds)
 */
export const getTokenRemainingTime = (): number => {
  const token = getAuthToken();
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;

    if (!exp) return 0;

    const remainingMs = (exp * 1000) - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  } catch (error) {
    return 0;
  }
};

/**
 * Get token expiry time in milliseconds
 * Returns null if token is invalid
 */
export const getTokenExpiry = (): number | null => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

/**
 * Check if user is authenticated and token is valid
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !isTokenExpired();
};
