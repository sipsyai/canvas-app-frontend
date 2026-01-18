# Task: Checkbox Component

**Priority:** 🔴 High
**Estimated Time:** 0.5 gün
**Dependencies:** React Aria Components 1.5

---

## Objective

React Aria kullanarak erişilebilir, özelleştirilebilir ve React Hook Form ile entegre Checkbox ve CheckboxGroup componentleri oluşturmak.

---

## Component Specifications

### Checkbox Component

#### States
1. **Unchecked** - Seçili değil (boş kutu)
2. **Checked** - Seçili (checkmark ile)
3. **Indeterminate** - Belirsiz durum (tire işareti)
4. **Disabled** - Etkileşim yok (opacity düşük)
5. **Error** - Hata durumu (kırmızı border)

#### Features
- Keyboard navigation (Space/Enter)
- Screen reader desteği
- Custom checkmark SVG
- Label desteği (sağda veya solda)
- Error message gösterimi
- React Hook Form integration
- Controlled/uncontrolled modes

### CheckboxGroup Component

#### Features
- Multiple checkbox yönetimi
- Grup label
- Grup error state
- Horizontal/vertical layout
- Select all/none functionality (optional)
- React Hook Form integration

---

## UI/UX Design

### Checkbox States Visual
```
┌─────────────────────────────────────┐
│ [ ] Unchecked                       │
│ [✓] Checked                         │
│ [−] Indeterminate                   │
│ [✓] With Label                      │
│ [✓] Error State (red border)       │
│ [ ] Disabled (opacity 50%)          │
└─────────────────────────────────────┘
```

### CheckboxGroup Layout
```
┌─────────────────────────────────────┐
│ Preferences                          │
│                                      │
│ [✓] Email notifications             │
│ [✓] SMS notifications               │
│ [ ] Push notifications              │
│                                      │
│ Error: At least one required        │
└─────────────────────────────────────┘
```

### Size Variants
- **Small** - 16x16px checkbox
- **Medium** - 20x20px checkbox (default)
- **Large** - 24x24px checkbox

---

## Technical Details

### File Structure
```
src/
├── components/
│   └── ui/
│       ├── Checkbox.tsx              ⭐ Main Checkbox component
│       ├── CheckboxGroup.tsx         ⭐ Checkbox group component
│       └── __tests__/
│           ├── Checkbox.test.tsx
│           └── CheckboxGroup.test.tsx
```

### Component Implementation

#### Checkbox.tsx
```typescript
import React from 'react';
import { Checkbox as AriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<AriaCheckboxProps, 'className'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <AriaCheckbox
          {...props}
          className={({ isPressed, isSelected, isDisabled, isInvalid }) =>
            cn(
              'group flex items-center gap-2 cursor-pointer',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )
          }
        >
          {({ isSelected, isIndeterminate, isDisabled, isInvalid }) => (
            <>
              <div
                className={cn(
                  'flex items-center justify-center rounded border-2 transition-all',
                  sizeClasses[size],
                  // Default state
                  'border-gray-300 bg-white',
                  // Hover state
                  'group-hover:border-blue-500',
                  // Checked/Indeterminate state
                  (isSelected || isIndeterminate) && 'border-blue-600 bg-blue-600',
                  // Error state
                  (error || isInvalid) && 'border-red-500',
                  (error || isInvalid) && (isSelected || isIndeterminate) && 'bg-red-500 border-red-500',
                  // Disabled state
                  isDisabled && 'bg-gray-100 border-gray-300',
                  // Focus state
                  'group-focus-visible:ring-2 group-focus-visible:ring-blue-500 group-focus-visible:ring-offset-2'
                )}
              >
                {/* Checkmark SVG */}
                {isSelected && (
                  <svg
                    className={cn('text-white', size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5')}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5 4L6 11.5L2.5 8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {/* Indeterminate line */}
                {isIndeterminate && !isSelected && (
                  <svg
                    className={cn('text-white', size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5')}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8H13"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>

              {/* Label and description */}
              {(label || description) && (
                <div className="flex flex-col gap-0.5">
                  {label && (
                    <span
                      className={cn(
                        'text-sm font-medium text-gray-900',
                        isDisabled && 'text-gray-500'
                      )}
                    >
                      {label}
                    </span>
                  )}
                  {description && (
                    <span className="text-xs text-gray-500">
                      {description}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </AriaCheckbox>

        {/* Error message */}
        {error && (
          <span className="text-xs text-red-500 ml-7">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
```

#### CheckboxGroup.tsx
```typescript
import React from 'react';
import {
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
} from 'react-aria-components';
import { cn } from '@/lib/utils';

interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'className'> {
  label?: string;
  description?: string;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children: React.ReactNode;
}

export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ label, description, error, orientation = 'vertical', className, children, ...props }, ref) => {
    return (
      <AriaCheckboxGroup
        {...props}
        className={cn('flex flex-col gap-3', className)}
        ref={ref}
      >
        {({ isDisabled, isInvalid }) => (
          <>
            {/* Group label and description */}
            {(label || description) && (
              <div className="flex flex-col gap-1">
                {label && (
                  <span
                    className={cn(
                      'text-sm font-medium text-gray-900',
                      isDisabled && 'text-gray-500'
                    )}
                  >
                    {label}
                  </span>
                )}
                {description && (
                  <span className="text-xs text-gray-500">
                    {description}
                  </span>
                )}
              </div>
            )}

            {/* Checkbox items */}
            <div
              className={cn(
                'flex gap-4',
                orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
              )}
            >
              {children}
            </div>

            {/* Error message */}
            {error && (
              <span className="text-xs text-red-500">
                {error}
              </span>
            )}
          </>
        )}
      </AriaCheckboxGroup>
    );
  }
);

CheckboxGroup.displayName = 'CheckboxGroup';
```

---

## React Hook Form Integration

### Single Checkbox with RHF
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/Checkbox';

const schema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  newsletter: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export const SettingsForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      acceptTerms: false,
      newsletter: false,
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="acceptTerms"
        control={control}
        render={({ field }) => (
          <Checkbox
            isSelected={field.value}
            onChange={field.onChange}
            label="Accept terms and conditions"
            error={errors.acceptTerms?.message}
          />
        )}
      />

      <Controller
        name="newsletter"
        control={control}
        render={({ field }) => (
          <Checkbox
            isSelected={field.value}
            onChange={field.onChange}
            label="Subscribe to newsletter"
            description="Get weekly updates about new features"
          />
        )}
      />

      <button type="submit" className="btn-primary">
        Save Settings
      </button>
    </form>
  );
};
```

### CheckboxGroup with RHF
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { Checkbox } from '@/components/ui/Checkbox';

const schema = z.object({
  notifications: z.array(z.string()).min(1, 'Select at least one notification method'),
});

type FormData = z.infer<typeof schema>;

export const NotificationForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      notifications: ['email'],
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="notifications"
        control={control}
        render={({ field }) => (
          <CheckboxGroup
            label="Notification Preferences"
            description="Choose how you want to receive notifications"
            value={field.value}
            onChange={field.onChange}
            error={errors.notifications?.message}
          >
            <Checkbox value="email" label="Email notifications" />
            <Checkbox value="sms" label="SMS notifications" />
            <Checkbox value="push" label="Push notifications" />
          </CheckboxGroup>
        )}
      />

      <button type="submit" className="btn-primary">
        Save Preferences
      </button>
    </form>
  );
};
```

---

## Usage Examples

### Basic Checkbox
```typescript
import { Checkbox } from '@/components/ui/Checkbox';

export const Example1 = () => {
  return (
    <Checkbox label="Remember me" />
  );
};
```

### Checkbox with Description
```typescript
import { Checkbox } from '@/components/ui/Checkbox';

export const Example2 = () => {
  return (
    <Checkbox
      label="Enable notifications"
      description="Receive email notifications for new messages"
    />
  );
};
```

### Controlled Checkbox
```typescript
import { useState } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';

export const Example3 = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div>
      <Checkbox
        isSelected={checked}
        onChange={setChecked}
        label="I agree to terms and conditions"
      />
      <p className="mt-2 text-sm text-gray-600">
        Status: {checked ? 'Agreed' : 'Not agreed'}
      </p>
    </div>
  );
};
```

### Checkbox with Error
```typescript
import { Checkbox } from '@/components/ui/Checkbox';

export const Example4 = () => {
  return (
    <Checkbox
      label="Accept privacy policy"
      error="You must accept the privacy policy to continue"
    />
  );
};
```

### Indeterminate Checkbox (Select All)
```typescript
import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';

export const Example5 = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>(['item1']);
  const allItems = ['item1', 'item2', 'item3'];

  const isAllSelected = selectedItems.length === allItems.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < allItems.length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? allItems : []);
  };

  return (
    <div className="space-y-2">
      <Checkbox
        isSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onChange={handleSelectAll}
        label="Select All"
      />
      <div className="ml-6 space-y-2">
        {allItems.map((item) => (
          <Checkbox
            key={item}
            value={item}
            isSelected={selectedItems.includes(item)}
            onChange={(checked) => {
              setSelectedItems((prev) =>
                checked ? [...prev, item] : prev.filter((i) => i !== item)
              );
            }}
            label={`Item ${item.slice(-1)}`}
          />
        ))}
      </div>
    </div>
  );
};
```

### CheckboxGroup - Vertical Layout
```typescript
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { Checkbox } from '@/components/ui/Checkbox';

export const Example6 = () => {
  return (
    <CheckboxGroup
      label="Select your interests"
      description="Choose all that apply"
    >
      <Checkbox value="design" label="Design" />
      <Checkbox value="development" label="Development" />
      <Checkbox value="marketing" label="Marketing" />
      <Checkbox value="sales" label="Sales" />
    </CheckboxGroup>
  );
};
```

### CheckboxGroup - Horizontal Layout
```typescript
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { Checkbox } from '@/components/ui/Checkbox';

export const Example7 = () => {
  return (
    <CheckboxGroup
      label="Days available"
      orientation="horizontal"
    >
      <Checkbox value="mon" label="Mon" />
      <Checkbox value="tue" label="Tue" />
      <Checkbox value="wed" label="Wed" />
      <Checkbox value="thu" label="Thu" />
      <Checkbox value="fri" label="Fri" />
    </CheckboxGroup>
  );
};
```

### Size Variants
```typescript
import { Checkbox } from '@/components/ui/Checkbox';

export const Example8 = () => {
  return (
    <div className="space-y-4">
      <Checkbox size="sm" label="Small checkbox" />
      <Checkbox size="md" label="Medium checkbox (default)" />
      <Checkbox size="lg" label="Large checkbox" />
    </div>
  );
};
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-aria-components` - Accessible checkbox primitives
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration for RHF
- `zod` - Schema validation

### Related Components
- `cn()` utility function (`@/lib/utils`)
- Button component (for form submissions)

---

## Acceptance Criteria

- [ ] Checkbox component tüm state'leri destekliyor (checked, unchecked, indeterminate, disabled, error)
- [ ] Custom checkmark SVG düzgün görünüyor
- [ ] Label ve description desteği çalışıyor
- [ ] Keyboard navigation çalışıyor (Space, Enter, Tab)
- [ ] Screen reader desteği var (aria labels)
- [ ] CheckboxGroup component çalışıyor
- [ ] React Hook Form ile entegrasyon çalışıyor (Controller)
- [ ] Horizontal ve vertical layout seçenekleri çalışıyor
- [ ] Size variants (sm, md, lg) doğru boyutlarda
- [ ] Error state ve error message gösterimi çalışıyor
- [ ] Focus ring görünüyor (Tailwind ring utilities)
- [ ] Hover state animasyonları düzgün
- [ ] Disabled state opacity ve cursor değişikliği çalışıyor
- [ ] Controlled ve uncontrolled modes destekleniyor
- [ ] TypeScript type safety tam

---

## Testing Checklist

### Manual Testing
- [ ] Checkbox'a tıklama → state değişiyor
- [ ] Space tuşu → checkbox toggle
- [ ] Enter tuşu → checkbox toggle
- [ ] Tab tuşu → focus hareket ediyor
- [ ] Focus ring görünüyor
- [ ] Hover effect çalışıyor
- [ ] Label'a tıklama → checkbox toggle
- [ ] Disabled checkbox → tıklanamıyor
- [ ] Error state → kırmızı border
- [ ] Indeterminate state → tire işareti
- [ ] CheckboxGroup → multiple selection çalışıyor
- [ ] React Hook Form validation → error messages

### Accessibility Testing
- [ ] Screen reader checkbox state'i okuyor
- [ ] Keyboard navigation sorunsuz
- [ ] Focus indicator görünür
- [ ] Label association doğru (aria-labelledby)
- [ ] Error announcement çalışıyor (aria-invalid, aria-describedby)

---

## Code Examples

### Tailwind CSS 4 Custom Checkmark
```css
/* globals.css - Custom checkbox animation (optional) */
@keyframes checkmark {
  0% {
    stroke-dashoffset: 16;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.checkbox-checkmark {
  stroke-dasharray: 16;
  animation: checkmark 0.2s ease-in-out;
}
```

### Utility Function (cn)
```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Resources

### React Aria Documentation
- [Checkbox Component](https://react-spectrum.adobe.com/react-aria/Checkbox.html)
- [CheckboxGroup Component](https://react-spectrum.adobe.com/react-aria/CheckboxGroup.html)
- [useCheckbox Hook](https://react-spectrum.adobe.com/react-aria/useCheckbox.html)

### Design References
- [Tailwind UI Checkbox Examples](https://tailwindui.com/components/application-ui/forms/checkboxes)
- [Radix UI Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox)
- [Shadcn UI Checkbox](https://ui.shadcn.com/docs/components/checkbox)

### Accessibility Guidelines
- [WAI-ARIA Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)
- [WCAG 2.1 - Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Checkbox and CheckboxGroup components exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/09-ui-components/06-checkbox-component.md

Requirements:
1. Create src/components/ui/Checkbox.tsx - Main checkbox component with React Aria
2. Create src/components/ui/CheckboxGroup.tsx - Checkbox group component
3. Add custom checkmark SVG (no external icons)
4. Support all states: checked, unchecked, indeterminate, disabled, error
5. Add label, description, and error message support
6. Implement size variants: sm, md, lg
7. Add React Hook Form integration examples
8. Add Tailwind CSS 4 styling with focus rings and hover effects

CRITICAL REQUIREMENTS:
- Use React Aria Components 1.5 (react-aria-components package)
- Custom SVG checkmark (no icon libraries)
- Full keyboard navigation support (Space, Enter, Tab)
- Screen reader support (proper ARIA attributes)
- Support both controlled and uncontrolled modes
- Indeterminate state for "select all" functionality
- TypeScript strict mode compatibility
- Follow Tailwind CSS 4 best practices

Test all states and keyboard interactions. Verify React Hook Form integration with Controller component.
```

---

**Status:** 🟡 Pending
**Next Task:** 07-radio-group-component.md
