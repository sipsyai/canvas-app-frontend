# 02. API Integration

**Priority:** 🔴 High Priority
**Estimated Time:** 2-3 gün
**Dependencies:** 01-authentication

## Overview

Centralized API client setup, TanStack Query configuration, error handling ve custom hooks.

## Tasks

1. **01-api-client-setup.md** - Axios instance, interceptors, base configuration
2. **02-tanstack-query-setup.md** - QueryClient config, DevTools, cache management
3. **03-api-hooks.md** - Custom hooks for all backend endpoints

## Key Features

- ✅ Centralized Axios client
- ✅ Request/Response interceptors
- ✅ Automatic JWT token injection
- ✅ Global error handling (401 → logout)
- ✅ TanStack Query cache management
- ✅ Type-safe API hooks
- ✅ Loading/Error states

## Architecture

```
src/lib/api/
├── client.ts           ⭐ Axios instance + interceptors
├── auth.api.ts         ⭐ Authentication endpoints
├── fields.api.ts       ⭐ Fields endpoints
├── objects.api.ts      ⭐ Objects endpoints
├── records.api.ts      ⭐ Records endpoints
├── relationships.api.ts ⭐ Relationships endpoints
└── applications.api.ts ⭐ Applications endpoints

src/hooks/api/
├── useAuth.ts          ⭐ Authentication hooks
├── useFields.ts        ⭐ Fields hooks
├── useObjects.ts       ⭐ Objects hooks
├── useRecords.ts       ⭐ Records hooks
├── useRelationships.ts ⭐ Relationships hooks
└── useApplications.ts  ⭐ Applications hooks
```

## Technical Stack

- **HTTP Client:** Axios
- **State Management:** TanStack Query v5
- **TypeScript:** Strict type safety
- **Environment Variables:** Vite env

## Acceptance Criteria

- [ ] Axios client configured with interceptors
- [ ] JWT token auto-inject working
- [ ] 401 errors trigger logout
- [ ] TanStack Query DevTools working
- [ ] All 34 backend endpoints have API functions
- [ ] Custom hooks for all endpoints
- [ ] Error handling works correctly
- [ ] Type-safe API responses

## Next Steps

Bu task tamamlandıktan sonra:
→ **09-ui-components** (React Aria components)
→ **03-fields-library** (First feature implementation)
