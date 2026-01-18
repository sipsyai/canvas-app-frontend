# Task: JWT Token Management

**Priority:** 🔴 High
**Estimated Time:** 1 gün
**Dependencies:** 01-login-page

---

## Objective

JWT token'ların yaşam döngüsünü yönetmek: token expiry kontrolü, otomatik logout, token refresh, ve manual logout işlemleri.

---

## Backend API

### Endpoint
```
POST /api/auth/logout
```

### Request Format
**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:** Yok

### Response
```
Status: 204 No Content
(empty body)
```

**Response Details:**
- Token backend'de blacklist'e eklenir
- Blacklist'e eklenen token bir daha kullanılamaz
- JTI (JWT ID) kullanılarak token revoke edilir

### Error Responses
- `403 Forbidden` - Token header'da yok
- `401 Unauthorized` - Token geçersiz veya expire olmuş

**Backend Documentation:**
→ [POST /api/auth/logout](../../backend-docs/api/01-authentication/04-logout.md)

---

## Token Specifications

### JWT Token Details
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "jti": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "exp": 1737218400
}
```

**Token Properties:**
- **Expiry Time:** 3600 saniye (1 saat)
- **JTI:** Unique token identifier (logout için gerekli)
- **exp:** Unix timestamp (token expiration)
- **sub:** User ID (UUID)

---

## Features to Implement

### 1. Token Expiry Detection
- JWT token'ın payload'ından `exp` field'ını oku
- `Date.now()` ile karşılaştır
- Token expire olduysa otomatik logout

### 2. Automatic Logout on Expiry
- Token expire olduğunda kullanıcıyı otomatik logout yap
- localStorage'dan token'ı sil
- Login sayfasına redirect et
- Toast mesajı: "Your session has expired. Please login again."

### 3. Token Refresh (Optional)
- Backend token refresh destekliyorsa implement et
- Token expire olmadan önce (örn: 5 dk kala) yeni token al
- Seamless user experience (kullanıcı fark etmez)

### 4. Manual Logout
- Logout button click → API call
- Token backend'de blacklist'e eklenir
- localStorage'dan token silinir
- Login sayfasına redirect

### 5. Session Timeout Warning (Optional)
- Token expire olmadan 5 dakika önce uyarı göster
- Modal: "Your session will expire in 5 minutes. Continue?"
- Continue button → token refresh veya re-login

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── auth/
│       ├── hooks/
│       │   └── useLogout.ts              ⭐ Logout hook
│       └── utils/
│           └── tokenManager.ts           ⭐ Token utilities
├── lib/
│   └── api/
│       └── auth.api.ts                   ⭐ Update: logout API
├── utils/
│   └── storage.ts                        ⭐ Update: token utilities
└── hooks/
    └── useTokenExpiry.ts                 ⭐ Token expiry checker
```

### Component Implementation

#### storage.ts (Updated)
```typescript
const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'token_expires_at';

/**
 * Store JWT token and its expiration time
 */
export const setAuthToken = (token: string, expiresIn: number): void => {
  localStorage.setItem(TOKEN_KEY, token);

  // Calculate expiration timestamp
  const expiresAt = Date.now() + (expiresIn * 1000);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
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
 * Check if user is authenticated and token is valid
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !isTokenExpired();
};
```

#### useLogout.ts
```typescript
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logoutAPI } from '@/lib/api/auth.api';
import { removeAuthToken } from '@/utils/storage';
import { toast } from 'sonner';

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      // Call logout API to blacklist token on backend
      await logoutAPI();
    },
    onSuccess: () => {
      // Remove token from localStorage
      removeAuthToken();

      // Show success message
      toast.success('Logged out successfully');

      // Redirect to login page
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);

      // Even if API fails, remove token locally
      removeAuthToken();

      // Show error message
      toast.error('Logout failed, but you have been logged out locally');

      // Redirect to login page
      navigate('/login');
    },
  });
};
```

#### auth.api.ts (Updated)
```typescript
import axios from 'axios';
import { getAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with interceptors
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      // Dispatch logout or redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Logout user (blacklist token on backend)
 */
export const logoutAPI = async (): Promise<void> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No token found');
  }

  await apiClient.post('/api/auth/logout', null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // Token expiry in seconds (3600 = 1 hour)
}

export const loginAPI = async (email: string, password: string): Promise<LoginResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', email);
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
};
```

#### useTokenExpiry.ts
```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired, removeAuthToken, getTokenRemainingTime } from '@/utils/storage';
import { toast } from 'sonner';

/**
 * Hook to monitor token expiry and auto-logout
 * Usage: Call this in root component (App.tsx or Layout)
 */
export const useTokenExpiry = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check immediately on mount
    if (isTokenExpired()) {
      handleTokenExpired();
      return;
    }

    // Check every 30 seconds
    const interval = setInterval(() => {
      if (isTokenExpired()) {
        handleTokenExpired();
      } else {
        // Optional: Show warning 5 minutes before expiry
        const remainingTime = getTokenRemainingTime();
        if (remainingTime <= 300 && remainingTime > 270) {
          // Show warning only once (when 5 minutes remaining)
          toast.warning('Your session will expire in 5 minutes', {
            duration: 10000,
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  const handleTokenExpired = () => {
    // Remove token
    removeAuthToken();

    // Show message
    toast.error('Your session has expired. Please login again.');

    // Redirect to login
    navigate('/login');
  };
};
```

#### tokenManager.ts
```typescript
import { getAuthToken, isTokenExpired, removeAuthToken } from '@/utils/storage';

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
```

#### Update useLogin.ts
```typescript
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '@/lib/api/auth.api';
import { setAuthToken } from '@/utils/storage';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await loginAPI(credentials.email, credentials.password);
      return response;
    },
    onSuccess: (data) => {
      // Store JWT token with expiration time
      setAuthToken(data.access_token, data.expires_in); // ⭐ Updated

      // Redirect to dashboard
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
    },
  });
};
```

#### App.tsx or Layout.tsx (Integration)
```typescript
import { useTokenExpiry } from '@/hooks/useTokenExpiry';

export const App = () => {
  // Monitor token expiry
  useTokenExpiry(); // ⭐ Add this hook

  return (
    <div>
      {/* Your app content */}
    </div>
  );
};
```

#### LogoutButton Component
```typescript
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Button } from '@/components/ui/Button';

export const LogoutButton = () => {
  const { mutate: logout, isPending } = useLogout();

  return (
    <Button
      onClick={() => logout()}
      disabled={isPending}
      loading={isPending}
      variant="outline"
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
};
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - API state management
- `axios` - HTTP client
- `react-router-dom` - Navigation
- `sonner` - Toast notifications

### No New Packages Required ✅

---

## Acceptance Criteria

- [ ] `setAuthToken` fonksiyonu token + expiry time kaydediyor
- [ ] `isTokenExpired` fonksiyonu doğru çalışıyor (JWT decode)
- [ ] `getTokenRemainingTime` fonksiyonu kalan süreyi hesaplıyor
- [ ] `useTokenExpiry` hook'u token expiry'yi monitor ediyor
- [ ] Token expire olduğunda otomatik logout çalışıyor
- [ ] Otomatik logout sonrası login sayfasına redirect
- [ ] Toast mesajı gösteriliyor: "Session expired"
- [ ] `useLogout` hook'u logout API call yapıyor
- [ ] Logout sonrası token localStorage'dan siliniyor
- [ ] Logout sonrası token backend'de blacklist'e ekleniyor
- [ ] Logout API fail olsa bile local token siliniyor
- [ ] Token expiry 5 dk kala warning gösteriliyor (optional)
- [ ] `TokenManager` utilities çalışıyor (getUserId, getUserEmail, getJTI)
- [ ] Axios interceptor 401 hatalarını handle ediyor

---

## Testing Checklist

### Manual Testing
- [ ] Login yap → token localStorage'da
- [ ] Token expiry time doğru kaydediliyor
- [ ] `isTokenExpired()` false döndürüyor (fresh token)
- [ ] 1 saat bekle → token expire oluyor
- [ ] Expire sonrası otomatik logout çalışıyor
- [ ] Logout button'a tıkla → API call yapılıyor
- [ ] Logout sonrası token silinmiş
- [ ] Logout sonrası login sayfasına redirect
- [ ] Network error durumunda local token siliniyor
- [ ] Browser console'da hata yok

### Developer Testing
```typescript
// Test 1: Check token expiry
import { isTokenExpired, getTokenRemainingTime } from '@/utils/storage';

console.log('Is expired:', isTokenExpired());
console.log('Remaining time:', getTokenRemainingTime(), 'seconds');

// Test 2: Decode token
import { TokenManager } from '@/features/auth/utils/tokenManager';

console.log('User ID:', TokenManager.getUserId());
console.log('User Email:', TokenManager.getUserEmail());
console.log('Token JTI:', TokenManager.getTokenJTI());

// Test 3: Manual expire (for testing)
localStorage.setItem('token_expires_at', Date.now().toString());
// Now token should be expired
console.log('Is expired:', isTokenExpired()); // Should be true
```

### Test Credentials (Backend Test User)
```
Email: test@example.com
Password: testpass123
```

---

## Code Examples

### Complete Token Lifecycle
```typescript
// 1. Login
// ├─ API call → Get token + expires_in
// ├─ setAuthToken(token, expires_in)
// ├─ Store: access_token, token_expires_at
// └─ Redirect to dashboard

// 2. During Session
// ├─ useTokenExpiry monitors expiry every 30s
// ├─ If remaining < 5 min → Show warning toast
// ├─ If expired → Auto logout + redirect
// └─ On 401 error → Axios interceptor redirects

// 3. Manual Logout
// ├─ Click logout button
// ├─ useLogout mutation → logoutAPI()
// ├─ Backend blacklists token (JTI)
// ├─ removeAuthToken() → Clear localStorage
// └─ Redirect to login

// 4. Token Expiry
// ├─ isTokenExpired() returns true
// ├─ useTokenExpiry detects expiry
// ├─ removeAuthToken()
// ├─ Toast: "Session expired"
// └─ Redirect to login
```

### Error Handling
```typescript
// Logout API Error Handling
export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutAPI,
    onError: (error: any) => {
      // API failed, but still clear local token
      removeAuthToken();

      if (error.response?.status === 401) {
        toast.error('Session already expired');
      } else if (error.response?.status === 403) {
        toast.error('Authentication failed');
      } else {
        toast.error('Logout failed, but you have been logged out locally');
      }

      // Always redirect
      navigate('/login');
    },
  });
};
```

### Session Timeout Warning (Optional)
```typescript
// Show modal when 5 minutes remaining
const SessionTimeoutModal = () => {
  const [showWarning, setShowWarning] = useState(false);
  const { mutate: logout } = useLogout();

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTokenRemainingTime();

      if (remaining <= 300 && remaining > 0) {
        setShowWarning(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!showWarning) return null;

  return (
    <Modal open={showWarning} onClose={() => setShowWarning(false)}>
      <h2>Session Expiring Soon</h2>
      <p>Your session will expire in 5 minutes.</p>
      <div>
        <Button onClick={() => logout()}>Logout Now</Button>
        <Button onClick={() => setShowWarning(false)}>Continue</Button>
      </div>
    </Modal>
  );
};
```

---

## Resources

### Backend Documentation
- [POST /api/auth/logout](../../backend-docs/api/01-authentication/04-logout.md) - Detailed logout endpoint
- [POST /api/auth/login](../../backend-docs/api/01-authentication/02-login.md) - Login endpoint (token generation)
- [Authentication Overview](../../backend-docs/api/01-authentication/README.md) - Auth system overview

### JWT Resources
- [JWT.io](https://jwt.io/) - JWT debugger and documentation
- [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) - JWT specification

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement JWT Token Management exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/01-authentication/04-jwt-token-management.md

Requirements:
1. Update src/utils/storage.ts:
   - Update setAuthToken(token, expiresIn) - Store token + expiry timestamp
   - Add getTokenRemainingTime() - Calculate remaining seconds
   - Update isTokenExpired() - Check using stored timestamp + JWT decode
   - Add TOKEN_EXPIRY_KEY constant

2. Create src/features/auth/hooks/useLogout.ts:
   - TanStack Query mutation for logout
   - Call logoutAPI() to blacklist token on backend
   - removeAuthToken() on success AND error
   - Show toast messages
   - Redirect to /login

3. Update src/lib/api/auth.api.ts:
   - Add logoutAPI() function
   - Create axios instance with interceptors
   - Request interceptor: Add Authorization header
   - Response interceptor: Handle 401 errors
   - Auto-redirect on 401

4. Create src/hooks/useTokenExpiry.ts:
   - Monitor token expiry every 30 seconds
   - Auto-logout when token expires
   - Optional: Show warning 5 minutes before expiry
   - Toast message: "Session expired"

5. Create src/features/auth/utils/tokenManager.ts:
   - decodeToken() - Decode JWT payload
   - getUserId() - Extract user ID from token
   - getUserEmail() - Extract email from token
   - getTokenJTI() - Extract JWT ID (jti)
   - isValid() - Check if token exists and valid
   - clear() - Remove token

6. Update src/features/auth/hooks/useLogin.ts:
   - Update setAuthToken call to include expires_in
   - setAuthToken(data.access_token, data.expires_in)

7. Create src/features/auth/components/LogoutButton.tsx:
   - Button component using useLogout hook
   - Show loading state during logout

CRITICAL REQUIREMENTS:
- Token expires in 3600 seconds (1 hour)
- Store expiration timestamp in localStorage (token_expires_at)
- Check expiry every 30 seconds in useTokenExpiry
- Always remove token even if logout API fails
- Axios interceptor handles 401 globally
- JWT decode: JSON.parse(atob(token.split('.')[1]))
- exp field is in seconds, Date.now() is in milliseconds
- Optional: Session timeout warning at 5 minutes

Integration:
- Add useTokenExpiry() hook to App.tsx or root layout
- Add LogoutButton to header/navbar
- Test with: test@example.com / testpass123

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 05-protected-routes.md
