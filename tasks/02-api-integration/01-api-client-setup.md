# Task: API Client Setup

**Priority:** 🔴 High
**Estimated Time:** 1 gün
**Dependencies:** 01-authentication (token management)

---

## Objective

Centralized Axios HTTP client oluşturmak. Tüm API call'ları bu client üzerinden yapılacak.

---

## Technical Details

### File: `src/lib/api/client.ts`

```typescript
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken, removeAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Auto-inject JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle global errors
apiClient.interceptors.response.use(
  (response) => {
    // Success response, return as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const errorData = error.response.data as any;

      if (Array.isArray(errorData.detail)) {
        // Pydantic validation errors
        const errors = errorData.detail.map((err: any) => ({
          field: err.loc[err.loc.length - 1],
          message: err.msg,
        }));

        throw {
          status: 422,
          errors,
          message: 'Validation error',
        };
      }
    }

    // Handle other errors
    const errorMessage = (error.response?.data as any)?.detail || error.message || 'An error occurred';

    throw {
      status: error.response?.status,
      message: errorMessage,
      originalError: error,
    };
  }
);

export default apiClient;
```

---

### File: `src/lib/api/types.ts`

```typescript
// Generic API response wrapper
export interface APIResponse<T> {
  data: T;
  message?: string;
}

// Generic API error
export interface APIError {
  status?: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  originalError?: any;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
```

---

### File: `.env.development`

```bash
VITE_API_BASE_URL=http://localhost:8000
```

### File: `.env.production`

```bash
VITE_API_BASE_URL=https://your-production-api.com
```

---

## Usage Example

### Authentication Endpoints

#### File: `src/lib/api/auth.api.ts`

```typescript
import apiClient from './client';
import type { User, LoginResponse, RegisterRequest } from '@/types/auth.types';

export const authAPI = {
  /**
   * Login user (OAuth2 Password Flow - form-data format!)
   * Backend Docs: /backend-docs/api/01-authentication/02-login.md
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // IMPORTANT: Use URLSearchParams for form-data (OAuth2 standard)
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);

    const { data } = await apiClient.post<LoginResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return data;
  },

  /**
   * Register new user
   * Backend Docs: /backend-docs/api/01-authentication/01-register.md
   */
  register: async (request: RegisterRequest): Promise<User> => {
    const { data } = await apiClient.post<User>('/api/auth/register', {
      email: request.email,
      password: request.password,
      full_name: request.fullName,
    });

    return data;
  },

  /**
   * Get current user (requires JWT token)
   * Backend Docs: /backend-docs/api/01-authentication/03-get-current-user.md
   */
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/api/auth/me');
    return data;
  },

  /**
   * Logout user (blacklist token)
   * Backend Docs: /backend-docs/api/01-authentication/04-logout.md
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },
};
```

---

### Fields Endpoints

#### File: `src/lib/api/fields.api.ts`

```typescript
import apiClient from './client';
import type { Field, FieldCreateRequest, FieldUpdateRequest } from '@/types/field.types';

interface ListFieldsParams {
  category?: string;
  is_system_field?: boolean; // Backend uses 'is_system_field', not 'is_system'
  page?: number;
  page_size?: number;
}

export const fieldsAPI = {
  /**
   * Create new field
   * Backend Docs: /backend-docs/api/02-fields/01-create-field.md
   *
   * Field ID auto-generated: fld_xxxxxxxx (8 char hex)
   * created_by auto-set from JWT token
   */
  create: async (data: FieldCreateRequest): Promise<Field> => {
    const response = await apiClient.post<Field>('/api/fields', data);
    return response.data;
  },

  /**
   * List all fields (with optional filters)
   * Backend Docs: /backend-docs/api/02-fields/02-list-fields.md
   *
   * Supports pagination and filtering by category/is_system_field
   */
  list: async (params?: ListFieldsParams): Promise<Field[]> => {
    const response = await apiClient.get<Field[]>('/api/fields', { params });
    return response.data;
  },

  /**
   * Get single field by ID
   * Backend Docs: /backend-docs/api/02-fields/03-get-field.md
   */
  getById: async (fieldId: string): Promise<Field> => {
    const response = await apiClient.get<Field>(`/api/fields/${fieldId}`);
    return response.data;
  },

  /**
   * Update field
   * Backend Docs: /backend-docs/api/02-fields/04-update-field.md
   *
   * Note: name and type cannot be changed after creation
   */
  update: async (fieldId: string, data: FieldUpdateRequest): Promise<Field> => {
    const response = await apiClient.patch<Field>(`/api/fields/${fieldId}`, data);
    return response.data;
  },

  /**
   * Delete field
   * Backend Docs: /backend-docs/api/02-fields/05-delete-field.md
   *
   * WARNING: CASCADE delete - removes all object-field relationships!
   */
  delete: async (fieldId: string): Promise<void> => {
    await apiClient.delete(`/api/fields/${fieldId}`);
  },
};
```

---

### Objects Endpoints

#### File: `src/lib/api/objects.api.ts`

```typescript
import apiClient from './client';
import type { Object, ObjectCreateRequest, ObjectUpdateRequest } from '@/types/object.types';

interface ListObjectsParams {
  category?: string;
  page?: number;
  page_size?: number;
}

export const objectsAPI = {
  create: async (data: ObjectCreateRequest): Promise<Object> => {
    const response = await apiClient.post<Object>('/api/objects', data);
    return response.data;
  },

  list: async (params?: ListObjectsParams): Promise<Object[]> => {
    const response = await apiClient.get<Object[]>('/api/objects', { params });
    return response.data;
  },

  getById: async (objectId: string): Promise<Object> => {
    const response = await apiClient.get<Object>(`/api/objects/${objectId}`);
    return response.data;
  },

  update: async (objectId: string, data: ObjectUpdateRequest): Promise<Object> => {
    const response = await apiClient.patch<Object>(`/api/objects/${objectId}`, data);
    return response.data;
  },

  delete: async (objectId: string): Promise<void> => {
    await apiClient.delete(`/api/objects/${objectId}`);
  },
};
```

---

### Records Endpoints

#### File: `src/lib/api/records.api.ts`

```typescript
import apiClient from './client';
import type { Record, RecordCreateRequest, RecordUpdateRequest } from '@/types/record.types';

interface ListRecordsParams {
  object_id: string; // REQUIRED
  page?: number;
  page_size?: number;
}

interface SearchRecordsParams {
  object_id: string; // REQUIRED
  q: string;         // REQUIRED - Search query
  page?: number;
  page_size?: number;
}

export const recordsAPI = {
  create: async (data: RecordCreateRequest): Promise<Record> => {
    const response = await apiClient.post<Record>('/api/records', data);
    return response.data;
  },

  list: async (params: ListRecordsParams): Promise<Record[]> => {
    const response = await apiClient.get<Record[]>('/api/records', { params });
    return response.data;
  },

  getById: async (recordId: string): Promise<Record> => {
    const response = await apiClient.get<Record>(`/api/records/${recordId}`);
    return response.data;
  },

  update: async (recordId: string, data: RecordUpdateRequest): Promise<Record> => {
    // IMPORTANT: Backend merges data, doesn't overwrite!
    const response = await apiClient.patch<Record>(`/api/records/${recordId}`, data);
    return response.data;
  },

  delete: async (recordId: string): Promise<void> => {
    await apiClient.delete(`/api/records/${recordId}`);
  },

  search: async (params: SearchRecordsParams): Promise<Record[]> => {
    const response = await apiClient.get<Record[]>('/api/records/search', { params });
    return response.data;
  },
};
```

---

## Acceptance Criteria

- [ ] `apiClient` instance oluşturuldu
- [ ] Request interceptor JWT token'ı inject ediyor
- [ ] Response interceptor 401 error'ları handle ediyor
- [ ] 401 error'ında token siliniyor ve `/login`'e redirect
- [ ] 422 validation error'ları parse ediliyor
- [ ] Environment variables (.env) kullanılıyor
- [ ] TypeScript types tanımlandı (`types.ts`)
- [ ] `authAPI` oluşturuldu ve test edildi
- [ ] `fieldsAPI` oluşturuldu
- [ ] `objectsAPI` oluşturuldu
- [ ] `recordsAPI` oluşturuldu

---

## Testing

### Manual Test (Browser Console)

```typescript
// Test login
import { authAPI } from '@/lib/api/auth.api';

const testLogin = async () => {
  try {
    const response = await authAPI.login('test@example.com', 'testpass123');
    console.log('Login success:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

testLogin();

// Test fields list (after login)
import { fieldsAPI } from '@/lib/api/fields.api';

const testFields = async () => {
  try {
    const fields = await fieldsAPI.list();
    console.log('Fields:', fields);
  } catch (error) {
    console.error('Fields failed:', error);
  }
};

testFields();
```

---

## Error Handling Examples

```typescript
// Usage in component
import { fieldsAPI } from '@/lib/api/fields.api';

const createField = async () => {
  try {
    const field = await fieldsAPI.create({
      name: 'email',
      label: 'Email',
      type: 'email',
    });

    console.log('Field created:', field);
  } catch (error: any) {
    if (error.status === 422) {
      // Validation errors
      error.errors?.forEach((err: any) => {
        console.error(`${err.field}: ${err.message}`);
      });
    } else {
      console.error('Error:', error.message);
    }
  }
};
```

---

## Resources

### Backend Documentation (Local)
- [API Documentation Index](../../backend-docs/api/00-API-DOCUMENTATION-INDEX.md) - All 34 endpoints
- [Frontend Developer Guide](../../backend-docs/api/00-FRONTEND-GUIDE.md) - Complete guide
- [Authentication API](../../backend-docs/api/01-authentication/README.md)
- [Fields API](../../backend-docs/api/02-fields/README.md)
- [Objects API](../../backend-docs/api/03-objects/README.md)
- [Records API](../../backend-docs/api/04-records/README.md)

### External Resources
- [Axios Docs](https://axios-http.com/docs/intro)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the API Client Setup task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/02-api-integration/01-api-client-setup.md

Requirements:
1. Create src/lib/api/client.ts - Centralized Axios instance with request/response interceptors
2. Create src/lib/api/types.ts - Generic API types (APIResponse, APIError, PaginationParams)
3. Create src/lib/api/auth.api.ts - Authentication endpoints (login, register, getCurrentUser, logout)
4. Create src/lib/api/fields.api.ts - Fields CRUD endpoints
5. Create src/lib/api/objects.api.ts - Objects CRUD endpoints
6. Create src/lib/api/records.api.ts - Records CRUD + search endpoints
7. Create .env.development and .env.production files

CRITICAL REQUIREMENTS:
- Request interceptor must auto-inject JWT token from localStorage
- Response interceptor must handle 401 errors → remove token + redirect to /login
- Response interceptor must parse 422 validation errors (Pydantic format)
- Login endpoint uses form-data with 'username' field (not 'email')
- Use VITE_API_BASE_URL environment variable (default: http://localhost:8000)
- All API functions must be type-safe with TypeScript

Follow the exact code examples provided in the task file. The API client should handle all 34 backend endpoints.
```

---

**Status:** 🟡 Pending
**Next Task:** 02-tanstack-query-setup.md
