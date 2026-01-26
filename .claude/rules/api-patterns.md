---
globs: ["src/lib/api/**/*.ts", "src/features/**/hooks/*.ts", "src/features/**/*.api.ts"]
---
# API Patterns

## Client Configuration

Location: `src/lib/api/client.ts`

```typescript
// Base URL from environment
baseURL: import.meta.env.VITE_API_BASE_URL

// JWT token auto-inject via interceptor
// 401 response -> remove token (PrivateRoute handles redirect)
```

## TanStack Query Patterns

```typescript
// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => api.getResource(id),
});

// Mutations with cache invalidation
const mutation = useMutation({
  mutationFn: api.createResource,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resources'] });
  },
});
```

## Authentication

### Login Endpoint
- URL: `POST /api/auth/login`
- Content-Type: `application/x-www-form-urlencoded`
- Field name: `username` (NOT email!)

```typescript
const formData = new URLSearchParams();
formData.append('username', email);
formData.append('password', password);

await apiClient.post('/api/auth/login', formData, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
```

### Token Storage
- Store: `localStorage.setItem('access_token', token)`
- Remove on 401: `localStorage.removeItem('access_token')`

## API Endpoint Prefixes

All backend endpoints use `/api/` prefix:
- `/api/auth/*` - Authentication
- `/api/fields/*` - Fields management
- `/api/objects/*` - Objects management
- `/api/records/*` - Records CRUD
- `/api/relationships/*` - Relationships
- `/api/applications/*` - Applications

## Error Handling

```typescript
try {
  const response = await apiClient.post('/api/resource', data);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle API errors
    throw new Error(error.response?.data?.detail || 'Request failed');
  }
  throw error;
}
```
