---
globs: ["src/**/*.ts", "src/**/*.tsx"]
---
# TypeScript Standards

## Strict Mode

tsconfig.json has `strict: true`. Follow these rules:

## No `any` Type

```typescript
// BAD
const data: any = response.data;

// GOOD
const data: unknown = response.data;

// Type guard for unknown
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}
```

## Explicit Return Types

```typescript
// Functions must have explicit return types
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Async functions
async function fetchUser(id: string): Promise<User> {
  const response = await apiClient.get(`/api/users/${id}`);
  return response.data;
}
```

## Path Aliases

Use `@/` alias for imports:

```typescript
// Good
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Avoid relative paths for deep imports
// Bad: import { Button } from '../../../components/ui/Button';
```

## Type Definitions

- Interfaces for objects with known shape
- Types for unions, primitives, and computed types

```typescript
// Interface for data models
interface User {
  id: string;
  email: string;
  name: string;
}

// Type for unions
type Status = 'pending' | 'active' | 'archived';

// Type for component props (can extend)
type ButtonProps = AriaButtonProps & {
  variant?: 'primary' | 'secondary';
};
```

## Nullish Handling

```typescript
// Optional chaining
const userName = user?.profile?.name;

// Nullish coalescing
const displayName = userName ?? 'Anonymous';

// Non-null assertion only when certain
const element = document.getElementById('root')!;
```

## Generic Constraints

```typescript
// Constrain generics
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```
