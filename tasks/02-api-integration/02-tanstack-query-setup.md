# Task: TanStack Query Setup

**Priority:** 🔴 High
**Estimated Time:** 1 gün
**Dependencies:** 01-api-client-setup

---

## Objective

TanStack Query v5 entegrasyonu ile server state yönetimi kurmak. Query client configuration, provider setup, query keys organizasyonu ve error handling pattern'lerini oluşturmak.

---

## Technical Details

### File: `src/lib/query/queryClient.ts`

```typescript
import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Default options for all queries
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: Verinin ne kadar süre "fresh" sayılacağı (30 saniye)
    staleTime: 30 * 1000, // 30 seconds

    // Cache time: Verinin cache'te ne kadar süre tutulacağı (5 dakika)
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime in v4)

    // Retry logic
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }

      // Retry up to 2 times for 5xx errors
      return failureCount < 2;
    },

    // Retry delay: Exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch on window focus (only if data is stale)
    refetchOnWindowFocus: true,

    // Refetch on reconnect
    refetchOnReconnect: true,

    // Refetch on mount (only if data is stale)
    refetchOnMount: true,

    // Network mode
    networkMode: 'online',
  },

  mutations: {
    // Retry logic for mutations
    retry: false, // Don't retry mutations by default

    // Network mode
    networkMode: 'online',

    // Error handling
    onError: (error: any) => {
      console.error('Mutation error:', error);
      // You can add global error handling here (e.g., toast notifications)
    },
  },
};

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
```

---

### File: `src/lib/query/queryKeys.ts`

```typescript
/**
 * Query Keys Factory Pattern
 *
 * Centralized query key management for consistent cache invalidation
 * and organization. All query keys should be defined here.
 *
 * Pattern:
 * - all: ['resource'] - For all resource queries
 * - lists: ['resource', 'list', filters] - For list queries with filters
 * - list: ['resource', 'list'] - For simple list queries
 * - details: ['resource', 'detail', id] - For detail queries
 * - infinite: ['resource', 'infinite', filters] - For infinite scroll queries
 */

export const queryKeys = {
  // Auth keys
  auth: {
    all: ['auth'] as const,
    currentUser: () => [...queryKeys.auth.all, 'current-user'] as const,
  },

  // Fields keys
  fields: {
    all: ['fields'] as const,
    lists: () => [...queryKeys.fields.all, 'list'] as const,
    list: (filters?: { category?: string; is_system_field?: boolean }) =>
      [...queryKeys.fields.lists(), filters] as const,
    details: () => [...queryKeys.fields.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.fields.details(), id] as const,
  },

  // Objects keys
  objects: {
    all: ['objects'] as const,
    lists: () => [...queryKeys.objects.all, 'list'] as const,
    list: (filters?: { category?: string }) =>
      [...queryKeys.objects.lists(), filters] as const,
    details: () => [...queryKeys.objects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.objects.details(), id] as const,
  },

  // Records keys
  records: {
    all: ['records'] as const,
    lists: () => [...queryKeys.records.all, 'list'] as const,
    list: (objectId: string, filters?: { page?: number; page_size?: number }) =>
      [...queryKeys.records.lists(), objectId, filters] as const,
    details: () => [...queryKeys.records.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.records.details(), id] as const,
    searches: () => [...queryKeys.records.all, 'search'] as const,
    search: (objectId: string, query: string) =>
      [...queryKeys.records.searches(), objectId, query] as const,
  },
} as const;
```

---

### File: `src/lib/query/queryProvider.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools - Only visible in development */}
      <ReactQueryDevtools
        initialIsOpen={false}
        position="bottom-right"
        buttonPosition="bottom-right"
      />
    </QueryClientProvider>
  );
}
```

---

### File: `src/main.tsx` (Updated)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from '@/lib/query/queryProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <App />
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## Usage Examples

### 1. Basic Query Hook (useQuery)

#### File: `src/features/fields/hooks/useFields.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fieldsAPI } from '@/lib/api/fields.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { Field } from '@/types/field.types';

interface UseFieldsOptions {
  category?: string;
  is_system_field?: boolean;
}

export function useFields(options?: UseFieldsOptions) {
  return useQuery({
    queryKey: queryKeys.fields.list(options),
    queryFn: () => fieldsAPI.list(options),
    // Optional: Override default staleTime
    staleTime: 60 * 1000, // 1 minute
  });
}

// Usage in component:
// const { data: fields, isLoading, error } = useFields({ category: 'contact' });
```

---

### 2. Detail Query Hook

#### File: `src/features/fields/hooks/useField.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fieldsAPI } from '@/lib/api/fields.api';
import { queryKeys } from '@/lib/query/queryKeys';

export function useField(fieldId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.fields.detail(fieldId),
    queryFn: () => fieldsAPI.getById(fieldId),
    enabled: options?.enabled ?? !!fieldId, // Only fetch if fieldId exists
  });
}

// Usage in component:
// const { data: field, isLoading } = useField(fieldId);
```

---

### 3. Mutation Hook with Cache Invalidation

#### File: `src/features/fields/hooks/useCreateField.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldsAPI } from '@/lib/api/fields.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { FieldCreateRequest, Field } from '@/types/field.types';

export function useCreateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FieldCreateRequest) => fieldsAPI.create(data),

    onSuccess: (newField: Field) => {
      // Invalidate all fields list queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.fields.lists(),
      });

      // Optional: Add new field to cache optimistically
      // queryClient.setQueryData(
      //   queryKeys.fields.detail(newField.id),
      //   newField
      // );
    },

    onError: (error: any) => {
      console.error('Failed to create field:', error);
      // Handle error (e.g., show toast notification)
    },
  });
}

// Usage in component:
// const { mutate: createField, isPending, isError } = useCreateField();
// createField({ name: 'email', label: 'Email', type: 'email' });
```

---

### 4. Mutation Hook with Optimistic Updates

#### File: `src/features/fields/hooks/useUpdateField.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldsAPI } from '@/lib/api/fields.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { FieldUpdateRequest, Field } from '@/types/field.types';

interface UpdateFieldVariables {
  fieldId: string;
  data: FieldUpdateRequest;
}

export function useUpdateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, data }: UpdateFieldVariables) =>
      fieldsAPI.update(fieldId, data),

    // Optimistic update: Update cache before API response
    onMutate: async ({ fieldId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.fields.detail(fieldId),
      });

      // Snapshot previous value
      const previousField = queryClient.getQueryData<Field>(
        queryKeys.fields.detail(fieldId)
      );

      // Optimistically update cache
      if (previousField) {
        queryClient.setQueryData<Field>(
          queryKeys.fields.detail(fieldId),
          { ...previousField, ...data }
        );
      }

      // Return context with previous value
      return { previousField };
    },

    // Rollback on error
    onError: (error, { fieldId }, context) => {
      if (context?.previousField) {
        queryClient.setQueryData(
          queryKeys.fields.detail(fieldId),
          context.previousField
        );
      }
    },

    // Refetch after success or error
    onSettled: (data, error, { fieldId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fields.detail(fieldId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.fields.lists(),
      });
    },
  });
}

// Usage in component:
// const { mutate: updateField, isPending } = useUpdateField();
// updateField({ fieldId: 'fld_xxx', data: { label: 'New Label' } });
```

---

### 5. Delete Mutation Hook

#### File: `src/features/fields/hooks/useDeleteField.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldsAPI } from '@/lib/api/fields.api';
import { queryKeys } from '@/lib/query/queryKeys';

export function useDeleteField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: string) => fieldsAPI.delete(fieldId),

    onSuccess: (_, fieldId) => {
      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: queryKeys.fields.detail(fieldId),
      });

      // Invalidate lists to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.fields.lists(),
      });
    },
  });
}

// Usage in component:
// const { mutate: deleteField, isPending } = useDeleteField();
// deleteField('fld_xxx');
```

---

### 6. Component Error Handling

#### File: `src/features/fields/components/FieldsList.tsx`

```typescript
import { useFields } from '../hooks/useFields';

export function FieldsList() {
  const { data: fields, isLoading, error, isError } = useFields();

  // Loading state
  if (isLoading) {
    return <div>Loading fields...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="error">
        <h3>Failed to load fields</h3>
        <p>{error?.message || 'An error occurred'}</p>
      </div>
    );
  }

  // Success state
  return (
    <div>
      {fields?.map((field) => (
        <div key={field.id}>{field.label}</div>
      ))}
    </div>
  );
}
```

---

### 7. Loading States Pattern

```typescript
import { useFields } from '../hooks/useFields';
import { Spinner } from '@/components/ui/Spinner';

export function FieldsListWithStates() {
  const {
    data: fields,
    isLoading,      // Initial loading
    isFetching,     // Background refetching
    isRefetching,   // Explicit refetch
    error
  } = useFields();

  return (
    <div>
      {/* Show spinner only on initial load */}
      {isLoading && <Spinner />}

      {/* Show subtle indicator during background refetch */}
      {isFetching && !isLoading && (
        <div className="text-sm text-gray-500">Updating...</div>
      )}

      {/* Render data even during refetch */}
      {fields && (
        <div>
          {fields.map((field) => (
            <div key={field.id}>{field.label}</div>
          ))}
        </div>
      )}

      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

---

### 8. Manual Cache Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';

export function RefreshButton() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate all fields queries
    queryClient.invalidateQueries({
      queryKey: queryKeys.fields.all,
    });

    // Or invalidate specific query
    queryClient.invalidateQueries({
      queryKey: queryKeys.fields.list({ category: 'contact' }),
    });

    // Or refetch immediately
    queryClient.refetchQueries({
      queryKey: queryKeys.fields.lists(),
    });
  };

  return <button onClick={handleRefresh}>Refresh Fields</button>;
}
```

---

### 9. Current User Query (Always Enabled)

#### File: `src/features/auth/hooks/useCurrentUser.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '@/lib/api/auth.api';
import { queryKeys } from '@/lib/query/queryKeys';
import { getAuthToken } from '@/utils/storage';

export function useCurrentUser() {
  const token = getAuthToken();

  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => authAPI.getCurrentUser(),
    enabled: !!token, // Only fetch if user is logged in
    staleTime: 5 * 60 * 1000, // 5 minutes (user data doesn't change often)
    retry: false, // Don't retry if unauthorized
  });
}

// Usage in component:
// const { data: user, isLoading } = useCurrentUser();
```

---

## Cache Invalidation Strategies

### Strategy 1: Invalidate All Related Queries

```typescript
// After creating a field, invalidate all fields lists
queryClient.invalidateQueries({
  queryKey: queryKeys.fields.lists(),
});
```

### Strategy 2: Invalidate Specific Query

```typescript
// After updating a field, invalidate both detail and lists
queryClient.invalidateQueries({
  queryKey: queryKeys.fields.detail(fieldId),
});
queryClient.invalidateQueries({
  queryKey: queryKeys.fields.lists(),
});
```

### Strategy 3: Remove from Cache

```typescript
// After deleting a field, remove from cache
queryClient.removeQueries({
  queryKey: queryKeys.fields.detail(fieldId),
});
```

### Strategy 4: Set Query Data Manually

```typescript
// Manually update cache after mutation
queryClient.setQueryData(
  queryKeys.fields.detail(fieldId),
  updatedField
);
```

---

## Installation

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

---

## Acceptance Criteria

- [ ] `queryClient` instance oluşturuldu (staleTime, gcTime, retry logic)
- [ ] `queryKeys` factory pattern uygulandı (auth, fields, objects, records)
- [ ] `QueryProvider` component oluşturuldu
- [ ] `QueryProvider` main.tsx'e eklendi
- [ ] React Query DevTools entegre edildi (development only)
- [ ] `useFields` hook oluşturuldu (query example)
- [ ] `useField` hook oluşturuldu (detail query)
- [ ] `useCreateField` hook oluşturuldu (mutation + invalidation)
- [ ] `useUpdateField` hook oluşturuldu (optimistic update)
- [ ] `useDeleteField` hook oluşturuldu (remove from cache)
- [ ] `useCurrentUser` hook oluşturuldu (auth query)
- [ ] Error handling pattern dokümante edildi
- [ ] Loading states pattern dokümante edildi
- [ ] Cache invalidation strategies dokümante edildi

---

## Testing

### Manual Test (Browser Console)

```typescript
// Test query hook
import { queryClient } from '@/lib/query/queryClient';
import { queryKeys } from '@/lib/query/queryKeys';

// Check cache
console.log('Fields cache:', queryClient.getQueryData(queryKeys.fields.lists()));

// Invalidate cache
queryClient.invalidateQueries({ queryKey: queryKeys.fields.all });

// Check query state
const fieldsQuery = queryClient.getQueryState(queryKeys.fields.lists());
console.log('Fields query state:', fieldsQuery);
```

### Test in React Component

```typescript
import { useFields } from '@/features/fields/hooks/useFields';
import { useCreateField } from '@/features/fields/hooks/useCreateField';

export function TestComponent() {
  const { data: fields, isLoading, error } = useFields();
  const { mutate: createField, isPending } = useCreateField();

  const handleCreate = () => {
    createField({
      name: 'test_field',
      label: 'Test Field',
      type: 'text',
    });
  };

  console.log('Fields:', fields);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  return (
    <div>
      <button onClick={handleCreate} disabled={isPending}>
        Create Field
      </button>
    </div>
  );
}
```

### Test DevTools

1. Run app: `npm run dev`
2. Open browser DevTools
3. Check React Query DevTools panel (bottom-right)
4. Inspect queries, mutations, and cache state
5. Test refetch, invalidate, and clear cache buttons

---

## Performance Best Practices

### 1. Use Appropriate Stale Times

```typescript
// Frequently changing data (messages, notifications)
staleTime: 0

// Moderate data (user lists, fields)
staleTime: 30 * 1000 // 30 seconds

// Rarely changing data (user profile, settings)
staleTime: 5 * 60 * 1000 // 5 minutes
```

### 2. Use Enabled Option for Conditional Fetching

```typescript
// Don't fetch until userId is available
const { data } = useField(fieldId, { enabled: !!fieldId });
```

### 3. Use Optimistic Updates for Better UX

```typescript
// Update UI immediately, rollback if error
onMutate: async (variables) => {
  await queryClient.cancelQueries({ queryKey });
  const previous = queryClient.getQueryData(queryKey);
  queryClient.setQueryData(queryKey, optimisticData);
  return { previous };
}
```

### 4. Prefetch Data for Better UX

```typescript
// Prefetch on hover
const queryClient = useQueryClient();

const handleMouseEnter = (fieldId: string) => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.fields.detail(fieldId),
    queryFn: () => fieldsAPI.getById(fieldId),
  });
};
```

---

## Common Patterns

### Pattern 1: Dependent Queries

```typescript
// Fetch object first, then fetch records
const { data: object } = useObject(objectId);
const { data: records } = useRecords(object?.id, {
  enabled: !!object?.id
});
```

### Pattern 2: Parallel Queries

```typescript
// Fetch multiple resources in parallel
const { data: fields } = useFields();
const { data: objects } = useObjects();
const { data: user } = useCurrentUser();

// All three queries run simultaneously
```

### Pattern 3: Polling / Auto-Refetch

```typescript
// Refetch every 30 seconds
const { data } = useFields({
  refetchInterval: 30 * 1000,
  refetchIntervalInBackground: true, // Continue polling in background
});
```

---

## Resources

### Official Documentation
- [TanStack Query v5 Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Query Keys Guide](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [Mutations Guide](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [DevTools Guide](https://tanstack.com/query/latest/docs/framework/react/devtools)

### Migration from v4 to v5
- [Migration Guide](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)
- Key changes: `cacheTime` → `gcTime`, `useQuery` destructuring changes

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the TanStack Query Setup task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/02-api-integration/02-tanstack-query-setup.md

Requirements:
1. Install @tanstack/react-query and @tanstack/react-query-devtools
2. Create src/lib/query/queryClient.ts - QueryClient with default config (staleTime, gcTime, retry logic)
3. Create src/lib/query/queryKeys.ts - Query keys factory pattern for all resources
4. Create src/lib/query/queryProvider.tsx - QueryClientProvider wrapper with DevTools
5. Update src/main.tsx - Wrap App with QueryProvider
6. Create example hooks:
   - src/features/fields/hooks/useFields.ts (list query)
   - src/features/fields/hooks/useField.ts (detail query)
   - src/features/fields/hooks/useCreateField.ts (mutation + invalidation)
   - src/features/fields/hooks/useUpdateField.ts (optimistic update)
   - src/features/fields/hooks/useDeleteField.ts (remove from cache)
   - src/features/auth/hooks/useCurrentUser.ts (auth query)

CRITICAL REQUIREMENTS:
- Use TanStack Query v5 API (gcTime instead of cacheTime)
- Query keys must use factory pattern for consistent cache invalidation
- Mutations must invalidate related queries after success
- Optimistic updates must include rollback on error
- DevTools must be visible only in development
- Error handling must be consistent across all hooks
- Loading states must differentiate between initial load and refetch

Follow the exact code examples provided in the task file. All hooks must be type-safe with TypeScript.
```

---

**Status:** 🟡 Pending
**Next Task:** 03-authentication-hooks.md
