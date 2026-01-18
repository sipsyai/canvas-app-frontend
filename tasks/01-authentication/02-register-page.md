# Task: Register Page

**Priority:** 🔴 High
**Estimated Time:** 1 gün
**Dependencies:** 01-login-page

---

## Objective

Kullanıcıların email, şifre ve tam ad bilgileri ile kayıt olabilmesi için register sayfası oluşturmak.

---

## Backend API

### Endpoint
```
POST /api/auth/register
```

### Request Format
**Content-Type:** `application/json`

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}
```

### Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "Ali Yılmaz",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-01-18T17:30:00.000Z",
  "last_login": null
}
```

**Response Fields:**
- `id` - Kullanıcı UUID
- `email` - Kullanıcı email adresi
- `full_name` - Kullanıcı tam adı
- `is_active` - Kullanıcı aktif mi? (varsayılan: true)
- `is_verified` - Email doğrulandı mı? (varsayılan: false)
- `created_at` - Kayıt tarihi (ISO 8601)
- `last_login` - Son giriş tarihi (null)

### Error Responses
- `400 Bad Request` - Email already registered
- `422 Unprocessable Entity` - Validation hatası (email format, password length, etc.)

**Backend Documentation:**
→ [POST /api/auth/register](../../backend-docs/api/01-authentication/01-register.md)

---

## UI/UX Design

### Page Layout
```
┌─────────────────────────────────┐
│                                 │
│        Canvas App Logo          │
│      Create your account        │
│                                 │
│  ┌───────────────────────────┐ │
│  │  Full Name                │ │
│  │  [input field]            │ │
│  │                           │ │
│  │  Email                    │ │
│  │  [input field]            │ │
│  │                           │ │
│  │  Password                 │ │
│  │  [input field]            │ │
│  │                           │ │
│  │  Confirm Password         │ │
│  │  [input field]            │ │
│  │                           │ │
│  │  [  Create Account   ]    │ │
│  │                           │ │
│  │  Already have account?    │ │
│  │  Sign in                  │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### Form Fields
1. **Full Name Input**
   - Type: text
   - Placeholder: "Ali Yılmaz"
   - Validation: Minimum 1 character required
   - Error messages: "Full name is required"

2. **Email Input**
   - Type: email
   - Placeholder: "you@example.com"
   - Validation: Email format required
   - Error messages: "Please enter a valid email"

3. **Password Input**
   - Type: password
   - Placeholder: "••••••••"
   - Show/Hide toggle button
   - Validation: Minimum 8 characters
   - Error messages: "Password must be at least 8 characters"

4. **Confirm Password Input**
   - Type: password
   - Placeholder: "••••••••"
   - Show/Hide toggle button
   - Validation: Must match password field
   - Error messages: "Passwords do not match"

5. **Create Account Button**
   - Primary color (#3B82F6)
   - Loading state (spinner)
   - Disabled during API call

### States
- **Idle** - Form boş, butona basılabilir
- **Loading** - API call yapılıyor, button disabled + spinner
- **Success** - Auto-login or redirect to login page
- **Error** - Hata mesajı göster (toast/alert)

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── auth/
│       ├── pages/
│       │   └── RegisterPage.tsx        ⭐ Main component
│       ├── components/
│       │   └── RegisterForm.tsx        ⭐ Form component
│       ├── hooks/
│       │   └── useRegister.ts          ⭐ Register hook (TanStack Query)
│       └── types/
│           └── auth.types.ts           ⭐ TypeScript types (update)
├── lib/
│   └── api/
│       └── auth.api.ts                 ⭐ API calls (add registerAPI)
```

### Component Implementation

#### RegisterPage.tsx
```typescript
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Canvas App
          </h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};
```

#### RegisterForm.tsx
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '../hooks/useRegister';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate: registerUser, isPending, isError, error } = useRegister();

  const onSubmit = (data: RegisterFormData) => {
    registerUser({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <Input
          type="text"
          placeholder="Ali Yılmaz"
          {...register('full_name')}
          error={errors.full_name?.message}
        />
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register('confirm_password')}
          error={errors.confirm_password?.message}
        />
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error?.message || 'Registration failed. Please try again.'}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
        loading={isPending}
      >
        {isPending ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};
```

#### useRegister.ts
```typescript
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registerAPI, loginAPI } from '@/lib/api/auth.api';
import { setAuthToken } from '@/utils/storage';

interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
}

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      // Register user
      const user = await registerAPI(
        credentials.email,
        credentials.password,
        credentials.full_name
      );

      // Auto-login after successful registration
      const loginResponse = await loginAPI(credentials.email, credentials.password);

      return { user, loginResponse };
    },
    onSuccess: (data) => {
      // Store JWT token in localStorage
      setAuthToken(data.loginResponse.access_token);

      // Redirect to dashboard
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
    },
  });
};
```

#### auth.api.ts (Add registerAPI)
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface RegisterResponse {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
}

export const registerAPI = async (
  email: string,
  password: string,
  full_name: string
): Promise<RegisterResponse> => {
  try {
    const { data } = await axios.post<RegisterResponse>(
      `${API_BASE_URL}/api/auth/register`,
      {
        email,
        password,
        full_name,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Email already registered');
    }
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.detail;
      if (Array.isArray(validationErrors)) {
        throw new Error(validationErrors[0]?.msg || 'Validation failed');
      }
      throw new Error('Please check your input');
    }
    throw new Error('Registration failed. Please try again.');
  }
};
```

#### auth.types.ts (Update)
```typescript
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
}

export interface LoginRequest {
  username: string; // Email
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
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

### UI Components (Already Built ✅)
- `Button` component (React Aria)
- `Input` component (React Aria)

---

## Acceptance Criteria

- [ ] Register sayfası `/register` route'unda çalışıyor
- [ ] Full name, email, password ve confirm_password validation çalışıyor (Zod)
- [ ] Passwords match validation çalışıyor
- [ ] Form submission doğru format (JSON)
- [ ] Başarılı kayıt sonrası otomatik login yapılıyor
- [ ] JWT token localStorage'da saklanıyor
- [ ] Başarılı kayıt sonrası `/dashboard`'a redirect
- [ ] Email already registered hatası gösteriliyor (400)
- [ ] Validation hataları gösteriliyor (422)
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Sign in linki çalışıyor
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Boş form submit → validation errors
- [ ] Geçersiz email format → error
- [ ] Kısa password (< 8 char) → error
- [ ] Passwords don't match → error
- [ ] Boş full name → error
- [ ] Doğru credentials → success + auto-login + redirect
- [ ] Duplicate email → 400 error mesajı
- [ ] Network error → error mesajı
- [ ] Loading state görünüyor
- [ ] Token localStorage'da saklanıyor
- [ ] Auto-login sonrası dashboard'a yönleniyor

### Test Credentials
```
Full Name: Test User
Email: newuser@example.com
Password: testpass123
```

---

## Code Examples

### Complete Registration Flow
```typescript
// 1. User enters full name, email, password, and confirm password
// 2. Form validation (Zod) - email format, password length, passwords match
// 3. Submit form → useRegister mutation
// 4. API call to /api/auth/register (JSON)
// 5. Receive user data (201 Created)
// 6. Auto-login: API call to /api/auth/login
// 7. Receive JWT token
// 8. Store token in localStorage
// 9. Redirect to /dashboard
// 10. Protected routes now accessible
```

### Error Handling
```typescript
// API Client (auth.api.ts)
export const registerAPI = async (email: string, password: string, full_name: string) => {
  try {
    const { data } = await axios.post('/api/auth/register', {
      email,
      password,
      full_name,
    });

    return data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Email already registered');
    }
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.detail;
      if (Array.isArray(validationErrors)) {
        // Show first validation error
        throw new Error(validationErrors[0]?.msg || 'Validation failed');
      }
      throw new Error('Please check your input');
    }
    throw new Error('Registration failed. Please try again.');
  }
};
```

### Password Match Validation
```typescript
// RegisterForm.tsx - Zod schema
const registerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"], // Error shows under confirm_password field
});
```

---

## Resources

### Backend Documentation
- [POST /api/auth/register](../../backend-docs/api/01-authentication/01-register.md) - Detailed endpoint documentation
- [POST /api/auth/login](../../backend-docs/api/01-authentication/02-login.md) - Auto-login endpoint
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
Please implement the Register Page task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/01-authentication/02-register-page.md

Requirements:
1. Create src/features/auth/pages/RegisterPage.tsx - Main register page component with gradient background
2. Create src/features/auth/components/RegisterForm.tsx - Form component with React Hook Form + Zod validation
3. Create src/features/auth/hooks/useRegister.ts - TanStack Query mutation hook for registration + auto-login
4. Update src/lib/api/auth.api.ts - Add registerAPI function
5. Update src/features/auth/types/auth.types.ts - Add RegisterRequest, RegisterResponse, RegisterCredentials types

CRITICAL REQUIREMENTS:
- Register endpoint uses JSON format (Content-Type: application/json)
- Form fields: full_name (min 1 char), email (valid format), password (min 8 chars), confirm_password
- Password match validation using Zod refine()
- After successful registration, auto-login user and redirect to /dashboard
- Store JWT token in localStorage after auto-login
- Handle 400 (email already registered) and 422 (validation) errors
- Add loading state (button disabled + spinner)
- Mobile responsive design with Tailwind CSS 4
- Show specific error messages for each validation failure

Follow the exact code examples and file structure provided in the task file. Test with:
Full Name: Test User
Email: newuser@example.com
Password: testpass123
```

---

**Status:** 🟡 Pending
**Previous Task:** 01-login-page.md
**Next Task:** 03-protected-routes.md
