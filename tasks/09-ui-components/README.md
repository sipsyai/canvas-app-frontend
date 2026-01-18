# 09. UI Components

**Priority:** 🔴 High Priority
**Estimated Time:** 3-4 gün
**Dependencies:** React Aria Components setup

## Overview

Reusable UI component library. React Aria Components kullanarak accessible ve type-safe components.

## Components to Build

### Core Components
1. **Button** - Primary, secondary, destructive variants
2. **Input** - Text, email, phone, number, password
3. **Textarea** - Multi-line text input
4. **Select** - Dropdown select
5. **Checkbox** - Boolean checkbox
6. **Radio** - Radio button group
7. **DatePicker** - Date selection
8. **Dialog** - Modal dialog
9. **Toast** - Notification toast

### Advanced Components
10. **Table** - TanStack Table wrapper
11. **Form** - Form wrapper with validation
12. **Tabs** - Tab navigation
13. **Tooltip** - Tooltip component
14. **Badge** - Status badge
15. **Card** - Card container

## Technology Stack

- **Base:** React Aria Components 1.5
- **Styling:** Tailwind CSS 4
- **Variants:** class-variance-authority
- **Icons:** Lucide React
- **Form:** React Hook Form (integration)

## File Structure

```
src/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
├── Input/
│   ├── Input.tsx
│   ├── Input.test.tsx
│   └── index.ts
├── Dialog/
│   ├── Dialog.tsx
│   ├── Dialog.test.tsx
│   └── index.ts
└── ... (diğer componentler)
```

## Component API Example

### Button Component
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Input Component
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}
```

## Design System

### Colors
```typescript
const colors = {
  primary: '#3B82F6',    // Blue
  secondary: '#10B981',  // Green
  destructive: '#EF4444', // Red
  warning: '#F59E0B',    // Orange
  success: '#10B981',    // Green
};
```

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px

## Accessibility

Tüm componentler WCAG 2.1 AA uyumlu olmalı:
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Color contrast (4.5:1 minimum)

## Next Steps

Bu task tamamlandıktan sonra:
→ **03-fields-library** (Use components in fields)
→ **04-objects-management** (Use components in objects)
