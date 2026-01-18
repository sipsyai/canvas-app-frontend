# Task: Protected Routes

**Priority:** 🔴 High
**Estimated Time:** 1 gün
**Dependencies:** 01-login-page, 04-jwt-token-management

---

## Objective

Kullanıcının authentication durumuna göre route'ları korumak ve yetkisiz erişimi engellemek için PrivateRoute component'i oluşturmak.

---

## Concept

### Protected Route Nedir?

Protected (Private) Route, kimlik doğrulaması yapılmamış kullanıcıların belirli sayfalara erişmesini engelleyen bir React component'idir.

**Çalışma Mantığı:**
```
1. Kullanıcı /dashboard'a gitmeye çalışır
2. PrivateRoute component devreye girer
3. Token kontrolü yapılır:
   ✅ Token var + geçerli → Sayfayı göster
   ❌ Token yok/expired → /login'e redirect
4. Kullanıcı login olursa → İstediği sayfaya yönlendirilir
```

### Authentication Flow
```
User Visits /dashboard
        ↓
  PrivateRoute Check
        ↓
   Token Exists?
    /        \
  YES         NO
   ↓           ↓
Token Valid?  Redirect
  /      \    to /login
YES      NO
 ↓        ↓
Show    Redirect
Page   to /login
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── auth/
│       ├── components/
│       │   ├── PrivateRoute.tsx        ⭐ Main component
│       │   └── RoleBasedRoute.tsx      ⭐ Role-based (future)
│       └── hooks/
│           └── useAuth.ts              ⭐ Auth state hook
├── routes/
│   └── AppRouter.tsx                   ⭐ Router configuration
└── utils/
    └── storage.ts                       ⭐ Token helpers (already exists)
```

---

## Component Implementation

### 1. PrivateRoute.tsx

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PrivateRouteProps {
  redirectTo?: string;
}

export const PrivateRoute = ({ redirectTo = '/login' }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render protected content
  return <Outlet />;
};
```

**Açıklamalar:**
- `Outlet` - Nested route'ların render edileceği yer (React Router v6)
- `Navigate` - Programmatic redirect (replaces old `<Redirect>`)
- `replace` - Browser history'de geri butonu çalışmasın diye
- `isLoading` - Token validation async olduğu için loading state

---

### 2. useAuth.ts

```typescript
import { useState, useEffect } from 'react';
import { getAuthToken, isTokenExpired, removeAuthToken } from '@/utils/storage';

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
```

**Açıklamalar:**
- `useEffect` ile component mount olunca token kontrolü
- Token var mı? → Expired mı? → Valid mi?
- Expired token'ı temizle (removeAuthToken)
- `isLoading` state ile flash of content engellenir

---

### 3. AppRouter.tsx (Router Configuration)

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@/features/auth/components/PrivateRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

**Açıklamalar:**
- Public routes (login, register) → PrivateRoute dışında
- Protected routes → `<Route element={<PrivateRoute />}>` wrapper içinde
- Outlet sayesinde nested routes render edilir
- `/` root route → `/dashboard`'a redirect

---

### 4. storage.ts Updates (Token Validation)

```typescript
const TOKEN_KEY = 'access_token';

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  return !isTokenExpired();
};

/**
 * Check if JWT token is expired
 * JWT format: header.payload.signature
 * Payload contains: { exp: 1234567890, ... }
 */
export const isTokenExpired = (): boolean => {
  const token = getAuthToken();
  if (!token) return true;

  try {
    // Decode JWT payload (Base64)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Check expiry (exp is in seconds, Date.now() is in milliseconds)
    const isExpired = Date.now() >= payload.exp * 1000;

    return isExpired;
  } catch (error) {
    console.error('Token validation error:', error);
    return true; // If token is malformed, consider it expired
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
```

**Açıklamalar:**
- `isTokenExpired()` - JWT payload'dan `exp` (expiration) field'ını okur
- `atob()` - Base64 decode (browser native function)
- `payload.exp` - Unix timestamp (seconds)
- `Date.now()` - Current time (milliseconds)

---

## Advanced: Role-Based Access Control (RBAC)

### RoleBasedRoute.tsx (Future Implementation)

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface RoleBasedRouteProps {
  allowedRoles: string[]; // ['admin', 'editor', 'user']
  redirectTo?: string;
}

export const RoleBasedRoute = ({
  allowedRoles,
  redirectTo = '/unauthorized'
}: RoleBasedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const hasRequiredRole = user?.role && allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
```

**Usage Example:**
```typescript
// In AppRouter.tsx
<Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
  <Route path="/admin/users" element={<AdminUsersPage />} />
  <Route path="/admin/settings" element={<AdminSettingsPage />} />
</Route>

<Route element={<RoleBasedRoute allowedRoles={['admin', 'editor']} />}>
  <Route path="/content/edit" element={<ContentEditPage />} />
</Route>
```

**Not:** Bu özellik ileride implement edilecek. Şu an için sadece `PrivateRoute` yeterli.

---

## Route Configuration Examples

### Example 1: Simple Protected Route
```typescript
<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
```

### Example 2: Multiple Protected Routes
```typescript
<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/settings" element={<SettingsPage />} />
  <Route path="/projects" element={<ProjectsPage />} />
</Route>
```

### Example 3: Custom Redirect Path
```typescript
<Route element={<PrivateRoute redirectTo="/welcome" />}>
  <Route path="/premium" element={<PremiumPage />} />
</Route>
```

### Example 4: Nested Protected Routes
```typescript
<Route element={<PrivateRoute />}>
  <Route path="/app" element={<AppLayout />}>
    <Route index element={<DashboardPage />} />
    <Route path="projects" element={<ProjectsPage />} />
    <Route path="projects/:id" element={<ProjectDetailPage />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>
</Route>
```

---

## Loading States

### LoadingSpinner.tsx (UI Component)

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="animate-spin text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};
```

---

## Acceptance Criteria

- [ ] `PrivateRoute` component oluşturuldu
- [ ] `useAuth` hook oluşturuldu (isAuthenticated, isLoading)
- [ ] Token validation çalışıyor (isTokenExpired)
- [ ] Yetkisiz kullanıcılar `/login`'e redirect ediliyor
- [ ] Loading state gösteriliyor (auth check sırasında)
- [ ] Protected routes sadece authenticated kullanıcılar görebiliyor
- [ ] Login sonrası user istediği sayfaya erişebiliyor
- [ ] Expired token otomatik temizleniyor
- [ ] `Outlet` ile nested routes çalışıyor
- [ ] Browser back button doğru çalışıyor (replace prop)

---

## Testing Checklist

### Manual Testing

**Test 1: Unauthorized Access**
- [ ] Logout ol (token sil)
- [ ] `/dashboard`'a git
- [ ] `/login`'e redirect edildi mi?

**Test 2: Authorized Access**
- [ ] Login ol (valid token al)
- [ ] `/dashboard`'a git
- [ ] Sayfa gösteriliyor mu?

**Test 3: Expired Token**
- [ ] Login ol
- [ ] localStorage'dan token'ın exp değerini geçmişe değiştir
- [ ] `/dashboard`'a git
- [ ] `/login`'e redirect edildi mi?
- [ ] Token temizlendi mi?

**Test 4: Loading State**
- [ ] Browser'ı yavaşlat (Network throttling)
- [ ] Protected route'a git
- [ ] Loading spinner gösteriliyor mu?

**Test 5: Nested Routes**
- [ ] `/app/projects` gibi nested route'a git
- [ ] Authentication check çalışıyor mu?
- [ ] Outlet render ediliyor mu?

**Test 6: Public Routes**
- [ ] Logout ol
- [ ] `/login` ve `/register` erişilebilir mi?
- [ ] Redirect olmamalı

**Test 7: Browser Back Button**
- [ ] Login ol → Dashboard
- [ ] Logout ol
- [ ] Browser back button
- [ ] Dashboard'a geri dönmemeli (replace prop)

---

## Edge Cases

### 1. Infinite Redirect Loop
```typescript
// ❌ WRONG: Login page protected
<Route element={<PrivateRoute />}>
  <Route path="/login" element={<LoginPage />} />
</Route>

// ✅ CORRECT: Login page public
<Route path="/login" element={<LoginPage />} />
```

### 2. Flash of Content (FOC)
```typescript
// ❌ WRONG: No loading state
const { isAuthenticated } = useAuth();
return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;

// ✅ CORRECT: Loading state added
const { isAuthenticated, isLoading } = useAuth();
if (isLoading) return <LoadingSpinner />;
return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
```

### 3. Token Expiry During Session
```typescript
// Future improvement: Auto-refresh token
useEffect(() => {
  const interval = setInterval(() => {
    if (isTokenExpired()) {
      removeAuthToken();
      window.location.href = '/login';
    }
  }, 60000); // Check every minute

  return () => clearInterval(interval);
}, []);
```

---

## Code Examples

### Complete Flow Example

```typescript
// 1. User visits /dashboard (not logged in)
// 2. PrivateRoute checks authentication
// 3. useAuth hook runs:
//    - getAuthToken() → null
//    - isAuthenticated = false
// 4. Navigate to /login
// 5. User logs in successfully
// 6. Token stored in localStorage
// 7. Navigate to /dashboard
// 8. PrivateRoute checks authentication
// 9. useAuth hook runs:
//    - getAuthToken() → "eyJhbGc..."
//    - isTokenExpired() → false
//    - isAuthenticated = true
// 10. Outlet renders DashboardPage
```

### Error Handling

```typescript
// In useAuth.ts
useEffect(() => {
  const checkAuth = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Validate token structure
      if (!token.includes('.')) {
        console.error('Invalid token format');
        removeAuthToken();
        setIsAuthenticated(false);
        return;
      }

      // Check expiry
      if (isTokenExpired()) {
        console.warn('Token expired');
        removeAuthToken();
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check error:', error);
      removeAuthToken();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  checkAuth();
}, []);
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-router-dom` - Navigation ve protected routes

### UI Components (To Be Built)
- `LoadingSpinner` component - Loading state için

---

## Resources

### React Router Documentation
- [React Router v6 - Protected Routes](https://reactrouter.com/docs/en/v6/examples/auth)
- [Navigate Component](https://reactrouter.com/docs/en/v6/components/navigate)
- [Outlet Component](https://reactrouter.com/docs/en/v6/components/outlet)

### JWT Documentation
- [JWT.io](https://jwt.io/) - JWT decoder ve debugger
- [JWT Structure](https://jwt.io/introduction) - JWT nasıl çalışır?

### Related Tasks
- [01-login-page.md](./01-login-page.md) - Login implementation
- [04-jwt-token-management.md](./04-jwt-token-management.md) - Token refresh logic

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Protected Routes task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/01-authentication/03-protected-routes.md

Requirements:
1. Create src/features/auth/components/PrivateRoute.tsx - Main protected route component with Outlet
2. Create src/features/auth/hooks/useAuth.ts - Authentication state hook (isAuthenticated, isLoading)
3. Update src/utils/storage.ts - Add isAuthenticated(), getTokenExpiry() functions
4. Create src/routes/AppRouter.tsx - Complete router configuration with protected and public routes
5. Create src/components/ui/LoadingSpinner.tsx - Loading spinner component for auth check

CRITICAL REQUIREMENTS:
- Use React Router v6 Outlet for nested routes
- Add loading state to prevent flash of content
- Check token expiry using JWT payload (exp field)
- Use Navigate with replace prop to prevent back button issues
- Clean up expired tokens automatically
- Public routes (login, register) must be outside PrivateRoute
- Protected routes (dashboard, profile, settings) must be inside PrivateRoute

Protected Routes Structure:
<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/settings" element={<SettingsPage />} />
</Route>

Test scenarios:
1. Logout → visit /dashboard → should redirect to /login
2. Login → visit /dashboard → should show dashboard
3. Expired token → visit /dashboard → should redirect to /login and clean token
4. Loading state should show spinner during auth check

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 04-jwt-token-management.md
