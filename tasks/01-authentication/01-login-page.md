# Task: Login Page

**Priority:** 🔴 High
**Estimated Time:** 1 gün
**Dependencies:** Hiç yok

---

## Objective

Kullanıcıların email ve password ile giriş yapabilmesi için login sayfası oluşturmak.

---

## Backend API

### Endpoint
```
POST /api/auth/login
```

### Request Format
**IMPORTANT:** `application/x-www-form-urlencoded` (JSON DEĞİL!)

```typescript
interface LoginRequest {
  username: string;  // Email (form-data key: "username")
  password: string;  // Password
}
```

### Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Response Fields:**
- `access_token` - JWT token (1 hour validity)
- `token_type` - Always "bearer"
- `expires_in` - Token expiry in seconds (3600 = 1 hour)

### Error Responses
- `401 Unauthorized` - Incorrect email or password
- `422 Unprocessable Entity` - Validation hatası

**Backend Documentation:**
→ [POST /api/auth/login](../../backend-docs/api/01-authentication/02-login.md)

---

## UI/UX Design

### Page Layout
```
┌─────────────────────────────────┐
│                                 │
│        Canvas App Logo          │
│                                 │
│  ┌───────────────────────────┐ │
│  │  Email                    │ │
│  │  [input field]            │ │
│  │                           │ │
│  │  Password                 │ │
│  │  [input field]            │ │
│  │                           │ │
│  │  [ ] Remember me          │ │
│  │                           │ │
│  │  [   Login Button    ]    │ │
│  │                           │ │
│  │  Forgot password?         │ │
│  │  Don't have account?      │ │
│  │  Sign up                  │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### Form Fields
1. **Email Input**
   - Type: email
   - Placeholder: "you@example.com"
   - Validation: Email format required
   - Error messages: "Please enter a valid email"

2. **Password Input**
   - Type: password
   - Placeholder: "••••••••"
   - Show/Hide toggle button
   - Validation: Minimum 8 characters
   - Error messages: "Password must be at least 8 characters"

3. **Remember Me Checkbox**
   - Optional feature
   - Keeps user logged in (extends token?)

4. **Login Button**
   - Primary color (#3B82F6)
   - Loading state (spinner)
   - Disabled during API call

### States
- **Idle** - Form boş, butona basılabilir
- **Loading** - API call yapılıyor, button disabled + spinner
- **Success** - Redirect to dashboard
- **Error** - Hata mesajı göster (toast/alert)

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── auth/
│       ├── pages/
│       │   └── LoginPage.tsx          ⭐ Main component
│       ├── components/
│       │   └── LoginForm.tsx          ⭐ Form component
│       ├── hooks/
│       │   └── useLogin.ts            ⭐ Login hook (TanStack Query)
│       └── types/
│           └── auth.types.ts          ⭐ TypeScript types
├── lib/
│   └── api/
│       └── auth.api.ts                ⭐ API calls
└── utils/
    └── storage.ts                     ⭐ localStorage helpers
```

### Component Implementation

#### LoginPage.tsx
```typescript
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Canvas App
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:text-blue-700">
            Forgot password?
          </a>
          <div className="mt-4 text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### LoginForm.tsx
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks/useLogin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: login, isPending, isError, error } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <Input
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />
      </div>

      <div className="flex items-center">
        <Checkbox {...register('rememberMe')} />
        <label className="ml-2 text-sm text-gray-700">Remember me</label>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error?.message || 'Login failed. Please try again.'}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
        loading={isPending}
      >
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};
```

#### useLogin.ts
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
```

#### auth.api.ts
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // Token expiry in seconds (3600 = 1 hour)
}

export const loginAPI = async (email: string, password: string): Promise<LoginResponse> => {
  // IMPORTANT: Use URLSearchParams for form-data!
  // Backend follows OAuth2 Password Flow standard
  const formData = new URLSearchParams();
  formData.append('username', email); // NOT 'email', backend expects 'username' (OAuth2 standard)
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

#### storage.ts
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
  return !!getAuthToken();
};

// Check if JWT token is expired
export const isTokenExpired = (): boolean => {
  const token = getAuthToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch (error) {
    return true;
  }
};
```

#### auth.types.ts
```typescript
export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface LoginRequest {
  username: string; // Email
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@tanstack/react-query` - API state management
- `axios` - HTTP client
- `react-router-dom` - Navigation

### UI Components (To Be Built)
- `Button` component (React Aria)
- `Input` component (React Aria)
- `Checkbox` component (React Aria)

---

## Acceptance Criteria

- [ ] Login sayfası `/login` route'unda çalışıyor
- [ ] Email ve password validation çalışıyor (Zod)
- [ ] Form submission doğru format (form-data, username key)
- [ ] Başarılı login sonrası JWT token localStorage'da
- [ ] Başarılı login sonrası `/dashboard`'a redirect
- [ ] Hatalı login sonrası error mesajı gösteriliyor
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Remember me checkbox çalışıyor (optional)
- [ ] Forgot password ve Sign up linkleri çalışıyor
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Boş form submit → validation errors
- [ ] Geçersiz email format → error
- [ ] Kısa password (< 8 char) → error
- [ ] Doğru credentials → success + redirect
- [ ] Yanlış credentials → 401 error mesajı
- [ ] Network error → error mesajı
- [ ] Loading state görünüyor
- [ ] Token localStorage'da saklanıyor

### Test Credentials (Backend Test User)
```
Email: test@example.com
Password: testpass123
```

---

## Code Examples

### Complete Login Flow
```typescript
// 1. User enters email and password
// 2. Form validation (Zod)
// 3. Submit form → useLogin mutation
// 4. API call with form-data
// 5. Receive JWT token
// 6. Store token in localStorage
// 7. Redirect to /dashboard
// 8. Protected routes now accessible
```

### Error Handling
```typescript
// API Client (auth.api.ts)
export const loginAPI = async (email: string, password: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const { data } = await axios.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    }
    if (error.response?.status === 422) {
      throw new Error('Please check your input');
    }
    throw new Error('Login failed. Please try again.');
  }
};
```

---

## Resources

### Backend Documentation
- [POST /api/auth/login](../../backend-docs/api/01-authentication/02-login.md) - Detailed endpoint documentation
- [Authentication Overview](../../backend-docs/api/01-authentication/README.md) - Auth system overview
- [Frontend Developer Guide](../../backend-docs/api/00-FRONTEND-GUIDE.md) - Complete frontend guide

### Frontend Libraries
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Login Page task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/01-authentication/01-login-page.md

Requirements:
1. Create src/features/auth/pages/LoginPage.tsx - Main login page component with gradient background
2. Create src/features/auth/components/LoginForm.tsx - Form component with React Hook Form + Zod validation
3. Create src/features/auth/hooks/useLogin.ts - TanStack Query mutation hook for login
4. Create src/lib/api/auth.api.ts - Authentication API functions (loginAPI, registerAPI, getCurrentUser)
5. Update src/utils/storage.ts - Add setAuthToken, getAuthToken, removeAuthToken, isTokenExpired functions
6. Create src/features/auth/types/auth.types.ts - TypeScript type definitions

CRITICAL REQUIREMENTS:
- Login endpoint uses form-data format (URLSearchParams), NOT JSON!
- Use 'username' field for email (backend requirement)
- Store JWT token in localStorage after successful login
- Redirect to /dashboard after successful login
- Handle 401 (wrong credentials) and 422 (validation) errors
- Add loading state (button disabled + spinner)
- Mobile responsive design with Tailwind CSS 4

Follow the exact code examples and file structure provided in the task file. Test with credentials:
Email: test@example.com
Password: testpass123
```

---

**Status:** 🟡 Pending
**Next Task:** 02-register-page.md
