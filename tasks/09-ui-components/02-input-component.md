# Task: Input Component

**Priority:** 🔴 High
**Estimated Time:** 0.5 gün
**Dependencies:** React Aria Components 1.5

---

## Objective

React Aria Components tabanlı, erişilebilir ve yeniden kullanılabilir Input ve Textarea bileşenleri oluşturmak. React Hook Form ile tam entegrasyon sağlamak.

---

## Component Features

### Input Types
```typescript
type InputType =
  | 'text'      // Genel metin girişi
  | 'email'     // Email adresi
  | 'phone'     // Telefon numarası
  | 'number'    // Sayısal değer
  | 'password'  // Şifre (show/hide toggle ile)
  | 'url'       // Web adresi
```

### Component Props
```typescript
interface InputProps {
  type?: InputType;
  label?: string;              // Input başlığı
  placeholder?: string;        // Placeholder metni
  error?: string;              // Hata mesajı
  disabled?: boolean;          // Devre dışı durumu
  required?: boolean;          // Zorunlu alan
  leftIcon?: React.ReactNode;  // Sol taraf ikonu
  rightIcon?: React.ReactNode; // Sağ taraf ikonu
  showPasswordToggle?: boolean; // Password toggle göster (type="password" için)
}
```

---

## UI/UX Design

### Input States
```
┌─────────────────────────────────┐
│  Label (optional)               │
│  ┌───────────────────────────┐ │
│  │  [icon]  Input text...    │ │  ← Default
│  └───────────────────────────┘ │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Label (required) *             │
│  ┌───────────────────────────┐ │
│  │  [icon]  Input text...  👁 │ │  ← Password (with toggle)
│  └───────────────────────────┘ │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Label *                        │
│  ┌───────────────────────────┐ │
│  │  [icon]  Input text...    │ │  ← Focused (blue ring)
│  └───────────────────────────┘ │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Label *                        │
│  ┌───────────────────────────┐ │
│  │  [icon]  Invalid input    │ │  ← Error (red ring)
│  └───────────────────────────┘ │
│  ⚠ This field is required       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Label                          │
│  ┌───────────────────────────┐ │
│  │  [icon]  Disabled...      │ │  ← Disabled (gray bg)
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### Textarea Layout
```
┌─────────────────────────────────┐
│  Label (optional)               │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  │  Multiline text area...   │ │
│  │                           │ │
│  │                           │ │
│  └───────────────────────────┘ │
│  Character count: 45/200        │
└─────────────────────────────────┘
```

### Styling Rules
- **Default:** Gray border (#E5E7EB), white background
- **Focus:** Blue ring (#3B82F6, ring-2)
- **Error:** Red border + ring (#EF4444)
- **Disabled:** Gray background (#F3F4F6), cursor-not-allowed
- **Icon:** Left/right icon padding (pl-10 / pr-10)
- **Required:** Red asterisk (*) next to label

---

## Technical Details

### File Structure
```
src/
├── components/
│   └── ui/
│       ├── Input.tsx          ⭐ Input component
│       ├── Textarea.tsx       ⭐ Textarea component
│       └── PasswordInput.tsx  ⭐ Password input with toggle
```

### Component Implementation

#### Input.tsx
```typescript
import React, { forwardRef } from 'react';
import { TextField, Input as AriaInput, Label, FieldError } from 'react-aria-components';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    leftIcon,
    rightIcon,
    required,
    disabled,
    className,
    type = 'text',
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <TextField
        isRequired={required}
        isDisabled={disabled}
        isInvalid={!!error}
        className="w-full"
      >
        {label && (
          <Label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <AriaInput
            ref={ref}
            type={inputType}
            className={cn(
              // Base styles
              'w-full px-3.5 py-2.5 rounded-lg',
              'border border-gray-300 bg-white',
              'text-sm text-gray-900 placeholder:text-gray-400',
              'transition-all duration-200',

              // Focus state
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',

              // Error state
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500',

              // Disabled state
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',

              // Icon padding
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',

              className
            )}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {/* Error Message */}
        {error && (
          <FieldError className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </FieldError>
        )}
      </TextField>
    );
  }
);

Input.displayName = 'Input';
```

#### Textarea.tsx
```typescript
import React, { forwardRef } from 'react';
import { TextField, TextArea as AriaTextArea, Label, FieldError, Text } from 'react-aria-components';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean; // Karakter sayacını göster
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    error,
    required,
    disabled,
    className,
    maxLength,
    showCount = false,
    ...props
  }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    return (
      <TextField
        isRequired={required}
        isDisabled={disabled}
        isInvalid={!!error}
        className="w-full"
      >
        {label && (
          <Label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <AriaTextArea
          ref={ref}
          maxLength={maxLength}
          onChange={(e) => {
            setCharCount(e.target.value.length);
            props.onChange?.(e);
          }}
          className={cn(
            // Base styles
            'w-full px-3.5 py-2.5 rounded-lg min-h-[100px]',
            'border border-gray-300 bg-white',
            'text-sm text-gray-900 placeholder:text-gray-400',
            'transition-all duration-200 resize-y',

            // Focus state
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',

            // Error state
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',

            // Disabled state
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:resize-none',

            className
          )}
          {...props}
        />

        {/* Character Count */}
        {showCount && maxLength && (
          <Text slot="description" className="mt-1.5 text-xs text-gray-500 text-right">
            {charCount}/{maxLength}
          </Text>
        )}

        {/* Error Message */}
        {error && (
          <FieldError className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </FieldError>
        )}
      </TextField>
    );
  }
);

Textarea.displayName = 'Textarea';
```

---

## Usage Examples

### Basic Input
```typescript
import { Input } from '@/components/ui/Input';

// Simple text input
<Input
  label="Full Name"
  placeholder="Enter your name"
  required
/>

// Email input with icon
<Input
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  leftIcon={<MailIcon />}
  required
/>

// Password input with toggle
<Input
  type="password"
  label="Password"
  placeholder="••••••••"
  required
/>
```

### With React Hook Form
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters'),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Input */}
      <Input
        type="email"
        label="Email"
        placeholder="you@example.com"
        {...register('email')}
        error={errors.email?.message}
        leftIcon={<MailIcon className="w-5 h-5" />}
        required
      />

      {/* Phone Input */}
      <Input
        type="tel"
        label="Phone Number"
        placeholder="+90 555 123 4567"
        {...register('phone')}
        error={errors.phone?.message}
        leftIcon={<PhoneIcon className="w-5 h-5" />}
      />

      {/* Password Input */}
      <Input
        type="password"
        label="Password"
        placeholder="Enter your password"
        {...register('password')}
        error={errors.password?.message}
        required
      />

      {/* Textarea */}
      <Textarea
        label="Bio"
        placeholder="Tell us about yourself..."
        {...register('bio')}
        error={errors.bio?.message}
        maxLength={500}
        showCount
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Input Variants
```typescript
// Number input
<Input
  type="number"
  label="Age"
  placeholder="18"
  min={18}
  max={100}
/>

// URL input
<Input
  type="url"
  label="Website"
  placeholder="https://example.com"
  leftIcon={<GlobeIcon />}
/>

// Disabled input
<Input
  label="Username"
  value="johndoe"
  disabled
/>

// Input with error
<Input
  label="Email"
  value="invalid-email"
  error="Please enter a valid email address"
/>

// Input with right icon
<Input
  label="Search"
  placeholder="Search..."
  rightIcon={<SearchIcon />}
/>
```

### Textarea Variants
```typescript
// Basic textarea
<Textarea
  label="Description"
  placeholder="Enter description..."
  rows={5}
/>

// Textarea with character count
<Textarea
  label="Tweet"
  placeholder="What's happening?"
  maxLength={280}
  showCount
/>

// Required textarea with error
<Textarea
  label="Message"
  placeholder="Your message..."
  required
  error="This field is required"
/>
```

---

## Accessibility Features

### Keyboard Navigation
- **Tab:** Navigate between inputs
- **Shift + Tab:** Navigate backwards
- **Enter:** Submit form (on input fields)
- **Space:** Toggle password visibility
- **Esc:** Clear input (optional feature)

### Screen Reader Support
- Proper ARIA labels from React Aria
- Error messages announced automatically
- Required field indication
- Input type announcements

### Focus Management
- Visible focus ring (ring-2 ring-blue-500)
- Focus trap in modal forms
- Auto-focus on error fields

---

## Acceptance Criteria

- [ ] Input component React Aria TextField kullanıyor
- [ ] Textarea component React Aria TextArea kullanıyor
- [ ] forwardRef ile React Hook Form entegrasyonu çalışıyor
- [ ] Tüm input tipleri çalışıyor (text, email, phone, number, password, url)
- [ ] Password show/hide toggle çalışıyor
- [ ] Label ve error mesajı görünüyor
- [ ] Required asterisk (*) gösteriliyor
- [ ] Left/right icon desteği çalışıyor
- [ ] Disabled state doğru görünüyor
- [ ] Focus state (blue ring) çalışıyor
- [ ] Error state (red ring) çalışıyor
- [ ] Textarea character count çalışıyor
- [ ] Tailwind CSS 4 stilleri uygulanmış
- [ ] Keyboard navigation çalışıyor
- [ ] Screen reader erişilebilirliği test edildi

---

## Testing Checklist

### Visual Testing
- [ ] Default state görünümü
- [ ] Focus state (blue ring)
- [ ] Error state (red border + message)
- [ ] Disabled state (gray background)
- [ ] With left icon
- [ ] With right icon
- [ ] Password toggle icon
- [ ] Required asterisk
- [ ] Textarea with character count
- [ ] Mobile responsive

### Functional Testing
- [ ] Type text → value updates
- [ ] Clear input → value clears
- [ ] Password toggle → type changes (password ↔ text)
- [ ] Form validation → error message shows
- [ ] React Hook Form register → value submitted
- [ ] Disabled input → cannot type
- [ ] Required validation → error on empty
- [ ] Max length → stops at limit
- [ ] Textarea resize → works correctly

### Accessibility Testing
- [ ] Tab navigation çalışıyor
- [ ] Keyboard shortcuts çalışıyor
- [ ] Screen reader announcements
- [ ] Focus visible
- [ ] Error messages announced
- [ ] Required fields announced

---

## Utility Functions

### lib/utils.ts (cn helper)
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Dependencies

### NPM Packages (Required)
```json
{
  "react-aria-components": "^1.5.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.0"
}
```

### Install Command
```bash
npm install react-aria-components clsx tailwind-merge
```

---

## Resources

### React Aria Documentation
- [TextField Component](https://react-spectrum.adobe.com/react-aria/TextField.html)
- [TextArea Component](https://react-spectrum.adobe.com/react-aria/TextArea.html)
- [Form Validation](https://react-spectrum.adobe.com/react-aria/forms.html)

### React Hook Form
- [register API](https://react-hook-form.com/api/useform/register)
- [forwardRef Pattern](https://react-hook-form.com/advanced-usage#CustomInput)
- [Error Handling](https://react-hook-form.com/advanced-usage#ErrorMessages)

### Tailwind CSS
- [Form Styles](https://tailwindcss.com/docs/forms)
- [Focus Ring Utilities](https://tailwindcss.com/docs/ring-width)
- [Transition Utilities](https://tailwindcss.com/docs/transition-property)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Input Component task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/09-ui-components/02-input-component.md

Requirements:
1. Create src/components/ui/Input.tsx - Input component with React Aria TextField
2. Create src/components/ui/Textarea.tsx - Textarea component with React Aria TextArea
3. Both components must use forwardRef for React Hook Form integration
4. Support all input types: text, email, phone, number, password, url
5. Password input must have show/hide toggle button
6. Support label, error message, placeholder, disabled, required states
7. Support left/right icon slots
8. Textarea must support character count (maxLength + showCount)
9. Error state styling (red border + ring + icon)
10. Focus state styling (blue ring)
11. Disabled state styling (gray background)
12. Full keyboard navigation support
13. Screen reader accessibility (React Aria handles this)
14. Tailwind CSS 4 styling

CRITICAL REQUIREMENTS:
- Use React Aria Components (TextField, Input, TextArea, Label, FieldError, Text)
- forwardRef MUST work with React Hook Form register
- Password toggle MUST show eye icon (open/closed)
- Error messages MUST show with warning icon
- Required fields MUST show red asterisk (*) next to label
- Character count MUST update in real-time for Textarea
- All states (focus, error, disabled) MUST have proper visual feedback
- Mobile responsive design

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 03-button-component.md
