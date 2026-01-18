# Task: Button Component

**Priority:** 🔴 High
**Estimated Time:** 0.5 gün
**Dependencies:** React Aria Components 1.5, class-variance-authority

---

## Objective

React Aria Components kullanarak erişilebilir, type-safe ve Tailwind CSS 4 ile stillenmiş Button bileşeni oluşturmak. Multiple variants, sizes, states ve icon desteği ile.

---

## Design System Specs

### Button Variants
1. **Primary** - Ana aksiyonlar için (login, submit, create)
2. **Secondary** - İkincil aksiyonlar için (cancel, back)
3. **Outline** - Daha az öncelikli aksiyonlar için
4. **Ghost** - Minimal görünüm (dropdown items, toolbar)
5. **Danger** - Destructive aksiyonlar için (delete, remove)

### Button Sizes
- **sm** - 32px height (compact UI, tables)
- **md** - 40px height (default, forms)
- **lg** - 48px height (hero sections, CTAs)

### Button States
- **Default** - Normal state
- **Hover** - Mouse üzerine geldiğinde
- **Focus** - Keyboard focus (accessible)
- **Active** - Tıklanırken
- **Disabled** - Tıklanamaz state
- **Loading** - API call sırasında (spinner)

---

## UI/UX Design

### Visual Examples

#### Primary Button (Default)
```
┌──────────────────────┐
│   ▶  Create Object   │  ← Icon + Text
└──────────────────────┘
Background: #3B82F6 (blue-500)
Text: White
Border: None
Shadow: sm
```

#### Secondary Button
```
┌──────────────────────┐
│       Cancel         │
└──────────────────────┘
Background: #F3F4F6 (gray-100)
Text: #374151 (gray-700)
Border: None
```

#### Outline Button
```
┌──────────────────────┐
│   Export Data   ↓    │  ← Text + Icon (right)
└──────────────────────┘
Background: Transparent
Text: #3B82F6 (blue-500)
Border: 1px solid #3B82F6
```

#### Ghost Button
```
┌──────────────────────┐
│       Settings       │
└──────────────────────┘
Background: Transparent
Text: #6B7280 (gray-500)
Hover: bg-gray-100
```

#### Danger Button
```
┌──────────────────────┐
│   🗑  Delete Object   │
└──────────────────────┘
Background: #EF4444 (red-500)
Text: White
```

#### Loading State
```
┌──────────────────────┐
│   ⚪ Loading...      │  ← Spinner + Text
└──────────────────────┘
Opacity: 0.7
Cursor: not-allowed
Disabled: true
```

### Size Comparison
```
┌────────────┐  sm (h-8, px-3, text-sm)
│  Button    │

┌───────────────┐  md (h-10, px-4, text-base) ← Default
│    Button     │

┌──────────────────┐  lg (h-12, px-6, text-lg)
│     Button       │
```

---

## Technical Details

### File Structure
```
src/
├── components/
│   └── ui/
│       ├── Button.tsx               ⭐ Main component (React Aria + cva)
│       ├── Button.stories.tsx       ⭐ Storybook examples
│       └── Button.test.tsx          ⭐ Unit tests
└── lib/
    └── utils/
        └── cn.ts                     ⭐ classnames utility (already exists)
```

### Component Implementation

#### Button.tsx
```typescript
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles (shared by all variants)
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-500 text-white shadow-sm hover:bg-blue-600 active:bg-blue-700 focus-visible:ring-blue-500',
        secondary:
          'bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-500',
        outline:
          'border border-blue-500 bg-transparent text-blue-500 hover:bg-blue-50 active:bg-blue-100 focus-visible:ring-blue-500',
        ghost:
          'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 focus-visible:ring-gray-500',
        danger:
          'bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends Omit<AriaButtonProps, 'className'>,
  VariantProps<typeof buttonVariants> {
  /** Button loading state (shows spinner) */
  loading?: boolean;
  /** Icon to show on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right side */
  rightIcon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Button children (text) */
  children: React.ReactNode;
}

export const Button = ({
  variant,
  size,
  fullWidth,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  isDisabled,
  ...props
}: ButtonProps) => {
  return (
    <AriaButton
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      isDisabled={isDisabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && leftIcon && leftIcon}
      {children}
      {!loading && rightIcon && rightIcon}
    </AriaButton>
  );
};
```

#### cn.ts (Utility - Already Exists)
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Usage Examples

### Basic Buttons
```typescript
import { Button } from '@/components/ui/Button';

// Primary button (default)
<Button>Create Object</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Outline button
<Button variant="outline">Export Data</Button>

// Ghost button
<Button variant="ghost">Settings</Button>

// Danger button
<Button variant="danger">Delete</Button>
```

### Button Sizes
```typescript
// Small button
<Button size="sm">Small Button</Button>

// Medium button (default)
<Button size="md">Medium Button</Button>

// Large button
<Button size="lg">Large Button</Button>
```

### Button with Icons
```typescript
import { Plus, Download, Settings, Trash2 } from 'lucide-react';

// Left icon
<Button leftIcon={<Plus className="h-4 w-4" />}>
  Create Object
</Button>

// Right icon
<Button variant="outline" rightIcon={<Download className="h-4 w-4" />}>
  Export Data
</Button>

// Icon only (text still required for accessibility)
<Button variant="ghost" aria-label="Settings">
  <Settings className="h-4 w-4" />
</Button>
```

### Loading State
```typescript
import { useLogin } from '@/features/auth/hooks/useLogin';

const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();

  return (
    <Button
      loading={isPending}
      onClick={() => login({ email, password })}
      fullWidth
    >
      {isPending ? 'Signing in...' : 'Sign in'}
    </Button>
  );
};
```

### Disabled State
```typescript
<Button isDisabled>
  Cannot Click
</Button>

// With form validation
<Button isDisabled={!form.isValid}>
  Submit Form
</Button>
```

### Full Width Button
```typescript
// Mobile-first design
<Button fullWidth variant="primary">
  Continue
</Button>
```

### Form Submit Button
```typescript
<form onSubmit={handleSubmit}>
  <Button type="submit" loading={isSubmitting}>
    Save Changes
  </Button>
</form>
```

---

## Storybook Examples

### Button.stories.tsx
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Plus, Download, Trash2 } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Default button
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
  },
};

// Sizes
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// With icons
export const WithLeftIcon: Story = {
  args: {
    children: 'Create Object',
    leftIcon: <Plus className="h-4 w-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Export Data',
    variant: 'outline',
    rightIcon: <Download className="h-4 w-4" />,
  },
};

export const DangerWithIcon: Story = {
  args: {
    children: 'Delete Object',
    variant: 'danger',
    leftIcon: <Trash2 className="h-4 w-4" />,
  },
};

// States
export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    isDisabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
};

// All variants in one view
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div className="space-x-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>

      <div className="space-x-2">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      <div className="space-x-2">
        <Button loading>Loading</Button>
        <Button isDisabled>Disabled</Button>
        <Button leftIcon={<Plus className="h-4 w-4" />}>With Icon</Button>
      </div>
    </div>
  ),
};
```

---

## Testing Examples

### Button.test.tsx
```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';
import { Plus } from 'lucide-react';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onPress={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });

  it('applies size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8', 'px-3', 'text-sm');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12', 'px-6', 'text-lg');
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    // Check if Loader2 icon is present
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('disables button when isDisabled prop is true', () => {
    render(<Button isDisabled>Disabled</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables button when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders left icon', () => {
    render(
      <Button leftIcon={<Plus data-testid="left-icon" />}>
        Create
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders right icon', () => {
    render(
      <Button rightIcon={<Plus data-testid="right-icon" />}>
        Create
      </Button>
    );
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('hides icons when loading', () => {
    render(
      <Button
        loading
        leftIcon={<Plus data-testid="left-icon" />}
        rightIcon={<Plus data-testid="right-icon" />}
      >
        Loading
      </Button>
    );
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });

  it('merges custom className with variant classes', () => {
    render(<Button className="custom-class">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('bg-blue-500'); // Default primary variant
  });

  it('supports keyboard navigation', async () => {
    const handleClick = vi.fn();
    render(<Button onPress={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Dependencies

### NPM Packages
```bash
# Already installed ✅
npm install react-aria-components    # v1.5.0+ (React Aria Components)
npm install class-variance-authority # v0.7.1+ (cva for variants)
npm install lucide-react             # v0.469.0+ (Icons)
npm install clsx                     # v2.1.1+ (classnames utility)
npm install tailwind-merge           # v2.6.0+ (Tailwind merge)

# Dev dependencies
npm install -D @storybook/react      # Storybook
npm install -D vitest                # Testing
npm install -D @testing-library/react
npm install -D @testing-library/user-event
```

### Tailwind CSS 4 Config
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        red: {
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        gray: {
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          500: '#6B7280',
          700: '#374151',
        },
      },
      keyframes: {
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## Acceptance Criteria

- [ ] Button component React Aria Components ile oluşturuldu
- [ ] 5 variant çalışıyor (primary, secondary, outline, ghost, danger)
- [ ] 3 size çalışıyor (sm, md, lg)
- [ ] Loading state çalışıyor (spinner + disabled)
- [ ] Disabled state çalışıyor
- [ ] Left/right icon desteği çalışıyor
- [ ] Full width option çalışıyor
- [ ] Tailwind CSS 4 ile stillendirildi
- [ ] class-variance-authority (cva) kullanıldı
- [ ] Keyboard navigation çalışıyor (Enter, Space)
- [ ] Focus ring görünüyor (accessibility)
- [ ] Custom className merge edilebiliyor
- [ ] TypeScript types eksiksiz
- [ ] Storybook stories oluşturuldu
- [ ] Unit testler yazıldı (%100 coverage)

---

## Testing Checklist

### Visual Testing (Storybook)
- [ ] Primary variant doğru renklerde
- [ ] Secondary variant doğru renklerde
- [ ] Outline variant border ile gösteriliyor
- [ ] Ghost variant transparent background
- [ ] Danger variant kırmızı renkte
- [ ] Small button 32px height
- [ ] Medium button 40px height (default)
- [ ] Large button 48px height
- [ ] Loading spinner dönüyor
- [ ] Disabled button opacity 50%
- [ ] Icons doğru pozisyonda (left/right)
- [ ] Full width button %100 genişlikte

### Interaction Testing
- [ ] Click event çalışıyor
- [ ] Enter tuşu ile activate oluyor
- [ ] Space tuşu ile activate oluyor
- [ ] Disabled button tıklanamıyor
- [ ] Loading button tıklanamıyor
- [ ] Focus ring keyboard navigation ile görünüyor
- [ ] Hover state çalışıyor
- [ ] Active state (basılıyken) çalışıyor

### Accessibility Testing
- [ ] Button role doğru (`role="button"`)
- [ ] aria-disabled loading/disabled durumunda
- [ ] aria-label icon-only buttons için çalışıyor
- [ ] Keyboard navigation destekleniyor
- [ ] Focus visible (outline) görünüyor
- [ ] Screen reader uyumlu

---

## Real-World Usage Examples

### Login Form Button
```typescript
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/features/auth/hooks/useLogin';

export const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();

  return (
    <Button
      type="submit"
      fullWidth
      loading={isPending}
      onPress={() => login(credentials)}
    >
      {isPending ? 'Signing in...' : 'Sign in'}
    </Button>
  );
};
```

### Create Object Button
```typescript
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

<Button
  variant="primary"
  size="md"
  leftIcon={<Plus className="h-4 w-4" />}
  onPress={() => setIsModalOpen(true)}
>
  Create Object
</Button>
```

### Delete Confirmation
```typescript
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

<div className="flex gap-2 justify-end">
  <Button variant="secondary" onPress={onCancel}>
    Cancel
  </Button>
  <Button
    variant="danger"
    leftIcon={<Trash2 className="h-4 w-4" />}
    loading={isDeleting}
    onPress={handleDelete}
  >
    {isDeleting ? 'Deleting...' : 'Delete Object'}
  </Button>
</div>
```

### Export Data Button
```typescript
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

<Button
  variant="outline"
  size="sm"
  rightIcon={<Download className="h-4 w-4" />}
  onPress={handleExport}
>
  Export Data
</Button>
```

### Settings Button (Ghost)
```typescript
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';

<Button
  variant="ghost"
  size="sm"
  aria-label="Open settings"
  onPress={openSettings}
>
  <Settings className="h-4 w-4" />
</Button>
```

---

## Resources

### Documentation
- [React Aria Components - Button](https://react-spectrum.adobe.com/react-aria/Button.html) - Official docs
- [class-variance-authority](https://cva.style/docs) - cva documentation
- [Lucide React Icons](https://lucide.dev/icons) - Icon library
- [Tailwind CSS v4 Alpha](https://tailwindcss.com/docs) - Styling

### Design References
- [Shadcn/ui Button](https://ui.shadcn.com/docs/components/button) - Design inspiration
- [Radix UI Button](https://www.radix-ui.com/primitives/docs/components/button) - Primitive reference
- [Material UI Button](https://mui.com/material-ui/react-button/) - Variant ideas

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Button Component task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/09-ui-components/01-button-component.md

Requirements:
1. Create src/components/ui/Button.tsx - React Aria Button wrapper with cva variants
2. Create src/components/ui/Button.stories.tsx - Storybook stories for all variants
3. Create src/components/ui/Button.test.tsx - Unit tests with 100% coverage

CRITICAL REQUIREMENTS:
- Use React Aria Components 1.5 (not HTML button)
- Use class-variance-authority (cva) for variants system
- Implement 5 variants: primary, secondary, outline, ghost, danger
- Implement 3 sizes: sm (32px), md (40px), lg (48px)
- Add loading state with Lucide React Loader2 spinner
- Add disabled state (isDisabled prop)
- Support left/right icons (leftIcon, rightIcon props)
- Support fullWidth option
- Style with Tailwind CSS 4
- Ensure keyboard accessibility (Enter, Space keys)
- Add focus-visible ring for accessibility
- TypeScript strict mode with all types
- Custom className should merge with variant classes (use cn utility)

Follow the exact code examples and implementation provided in the task file. Create Storybook stories for all variants and comprehensive unit tests.
```

---

**Status:** 🟡 Pending
**Next Task:** 02-input-component.md
