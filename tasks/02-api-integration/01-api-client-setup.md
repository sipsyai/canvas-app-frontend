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
import type { User, LoginResponse } from '@/types/auth.types';

export const authAPI = {
  /**
   * Login user (form-data format!)
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // IMPORTANT: Use URLSearchParams for form-data
    const formData = new URLSearchParams();
    formData.append('username', email);
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
   */
  register: async (email: string, password: string, fullName: string): Promise<User> => {
    const { data } = await apiClient.post<User>('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    });

    return data;
  },

  /**
   * Get current user (requires JWT token)
   */
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/api/auth/me');
    return data;
  },

  /**
   * Logout user
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
  is_system?: boolean;
  page?: number;
  page_size?: number;
}

export const fieldsAPI = {
  /**
   * Create new field
   */
  create: async (data: FieldCreateRequest): Promise<Field> => {
    const response = await apiClient.post<Field>('/api/fields', data);
    return response.data;
  },

  /**
   * List all fields (with optional filters)
   */
  list: async (params?: ListFieldsParams): Promise<Field[]> => {
    const response = await apiClient.get<Field[]>('/api/fields', { params });
    return response.data;
  },

  /**
   * Get single field by ID
   */
  getById: async (fieldId: string): Promise<Field> => {
    const response = await apiClient.get<Field>(`/api/fields/${fieldId}`);
    return response.data;
  },

  /**
   * Update field
   */
  update: async (fieldId: string, data: FieldUpdateRequest): Promise<Field> => {
    const response = await apiClient.patch<Field>(`/api/fields/${fieldId}`, data);
    return response.data;
  },

  /**
   * Delete field
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

- [Axios Docs](https://axios-http.com/docs/intro)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Backend API Guide](../../../../canvas-app-backend/docs/api/00-FRONTEND-GUIDE.md)

---

**Status:** 🟡 Pending
**Next Task:** 02-tanstack-query-setup.md
