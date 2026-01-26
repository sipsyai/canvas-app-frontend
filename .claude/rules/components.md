---
globs: ["src/components/**/*.tsx"]
---
# Component Conventions

## Structure Pattern

```typescript
// Named export (not default)
export function ComponentName({ prop1, prop2, ...props }: ComponentNameProps) {
  return (
    // React Aria base component
    <AriaComponent {...props}>
      {/* Content */}
    </AriaComponent>
  );
}
```

## Props Interface

```typescript
// Extend HTML/React Aria attributes
interface ButtonProps extends AriaButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
```

## Styling with CVA

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

## Class Merging

Always use `cn()` utility for class merging:

```typescript
import { cn } from '@/lib/utils/cn';

<Button className={cn(
  buttonVariants({ variant, size }),
  'focus:ring-2 focus:ring-primary',
  className
)} />
```

## Focus Styling

All interactive components must have visible focus:

```css
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
```

## File Location

- UI primitives: `src/components/ui/`
- Layout components: `src/components/layout/`
- Common/shared: `src/components/common/`
