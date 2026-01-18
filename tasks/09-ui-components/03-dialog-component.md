# Task: Dialog Component

**Priority:** 🔴 High
**Estimated Time:** 1 gün
**Dependencies:** React Aria Components 1.5, 01-button-component

---

## Objective

React Aria Components kullanarak erişilebilir, özelleştirilebilir ve yeniden kullanılabilir Dialog/Modal component'i oluşturmak. Farklı boyutlar, animasyonlar ve varyantları destekleyen profesyonel bir modal sistemi.

---

## Component Features

### Modal Sizes
- **sm** - 384px (max-w-sm)
- **md** - 512px (max-w-md) - Default
- **lg** - 768px (max-w-lg)
- **xl** - 1024px (max-w-xl)
- **full** - Full screen modal

### Core Features
1. **Close Button** - X icon ile kapatma (sağ üst köşe)
2. **Backdrop/Overlay** - Blur efekti ile arka plan
3. **Keyboard Support** - ESC tuşu ile kapatma
4. **Focus Trap** - Modal açıkken odak içeride kalır
5. **Animation** - Fade in/out animasyonları
6. **Sections** - Header, Body, Footer bölümleri
7. **Variants** - Normal, Confirmation (danger) varyantları

### Accessibility (React Aria)
- ARIA attributes (role="dialog", aria-modal, aria-labelledby)
- Focus management (auto-focus first element)
- Keyboard navigation (Tab, Shift+Tab, ESC)
- Screen reader support
- Click outside to close (optional)

---

## UI/UX Design

### Dialog Structure
```
┌──────────────────────────────────────┐
│  [X]                                 │ ← Close button
│                                      │
│  Dialog Title                        │ ← Header
│  ─────────────────────────────────   │
│                                      │
│  Dialog content goes here...         │ ← Body
│  Forms, text, images, etc.           │
│                                      │
│  ─────────────────────────────────   │
│  [Cancel]  [Confirm]                 │ ← Footer
└──────────────────────────────────────┘
```

### Backdrop/Overlay
```
Full screen overlay
┌────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Blur + dark overlay
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓  ┌──────────────┐  ▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓  │    Dialog    │  ▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓  └──────────────┘  ▓▓▓▓▓▓▓▓▓▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└────────────────────────────────────────┘
```

### Confirmation Dialog Variant
```
┌──────────────────────────────────────┐
│  [X]                                 │
│                                      │
│  ⚠️  Delete Account?                 │ ← Warning icon + title
│  ─────────────────────────────────   │
│                                      │
│  This action cannot be undone.       │ ← Description
│  All your data will be permanently   │
│  deleted.                            │
│                                      │
│  ─────────────────────────────────   │
│  [Cancel]  [🔴 Delete]               │ ← Danger button
└──────────────────────────────────────┘
```

### Animation States
- **Enter** - Fade in (opacity 0 → 1) + Scale (0.95 → 1) - 200ms
- **Exit** - Fade out (opacity 1 → 0) + Scale (1 → 0.95) - 150ms
- **Backdrop** - Fade in/out - 200ms

---

## Technical Details

### File Structure
```
src/
├── components/
│   └── ui/
│       ├── Dialog/
│       │   ├── Dialog.tsx              ⭐ Main dialog component
│       │   ├── DialogHeader.tsx        ⭐ Header section
│       │   ├── DialogBody.tsx          ⭐ Body section
│       │   ├── DialogFooter.tsx        ⭐ Footer section
│       │   ├── ConfirmDialog.tsx       ⭐ Confirmation variant
│       │   └── index.ts                ⭐ Barrel export
│       └── hooks/
│           └── useDialog.ts            ⭐ Dialog state hook
```

### Component Implementation

#### Dialog.tsx
```typescript
import { ReactNode } from 'react';
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
  Heading,
} from 'react-aria-components';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full w-full h-full rounded-none',
};

export const Dialog = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOutsideClick = true,
  showCloseButton = true,
  children,
  className,
}: DialogProps) => {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onClose}
      isDismissable={closeOnOutsideClick}
      className={cn(
        // Overlay styles
        'fixed inset-0 z-50',
        'bg-black/50 backdrop-blur-sm',
        // Animation
        'data-[entering]:animate-in data-[entering]:fade-in-0',
        'data-[exiting]:animate-out data-[exiting]:fade-out-0',
        'duration-200'
      )}
    >
      <Modal
        className={cn(
          // Center modal
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'z-50 w-full',
          // Size
          sizeClasses[size],
          // Base styles
          'bg-white rounded-2xl shadow-2xl',
          'border border-gray-200',
          // Animation
          'data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95',
          'data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95',
          'duration-200',
          className
        )}
      >
        <AriaDialog className="outline-none">
          {({ close }) => (
            <div className="relative">
              {/* Close Button */}
              {showCloseButton && (
                <button
                  onClick={close}
                  className={cn(
                    'absolute right-4 top-4 z-10',
                    'rounded-lg p-1.5',
                    'text-gray-400 hover:text-gray-600',
                    'hover:bg-gray-100',
                    'transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Title */}
              {title && (
                <Heading
                  slot="title"
                  className="px-6 pt-6 pb-4 text-xl font-semibold text-gray-900"
                >
                  {title}
                </Heading>
              )}

              {/* Content */}
              <div className={cn(!title && 'pt-6')}>{children}</div>
            </div>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
};
```

#### DialogHeader.tsx
```typescript
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export const DialogHeader = ({ children, className }: DialogHeaderProps) => {
  return (
    <div
      className={cn(
        'px-6 pb-4',
        'border-b border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
};
```

#### DialogBody.tsx
```typescript
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DialogBodyProps {
  children: ReactNode;
  className?: string;
}

export const DialogBody = ({ children, className }: DialogBodyProps) => {
  return (
    <div
      className={cn(
        'px-6 py-4',
        'max-h-[calc(100vh-200px)] overflow-y-auto',
        className
      )}
    >
      {children}
    </div>
  );
};
```

#### DialogFooter.tsx
```typescript
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export const DialogFooter = ({ children, className }: DialogFooterProps) => {
  return (
    <div
      className={cn(
        'px-6 py-4',
        'border-t border-gray-200',
        'flex items-center justify-end gap-3',
        className
      )}
    >
      {children}
    </div>
  );
};
```

#### ConfirmDialog.tsx
```typescript
import { Dialog, DialogBody, DialogFooter } from './';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    buttonVariant: 'warning' as const,
  },
  info: {
    icon: AlertTriangle,
    iconColor: 'text-blue-600',
    buttonVariant: 'primary' as const,
  },
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="sm">
      <DialogBody>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex-shrink-0 rounded-full p-3',
              variant === 'danger' && 'bg-red-100',
              variant === 'warning' && 'bg-yellow-100',
              variant === 'info' && 'bg-blue-100'
            )}
          >
            <Icon className={cn('h-6 w-6', config.iconColor)} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" onPress={onClose} isDisabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={config.buttonVariant}
          onPress={handleConfirm}
          isDisabled={isLoading}
          isPending={isLoading}
        >
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
```

#### useDialog.ts
```typescript
import { useState, useCallback } from 'react';

export interface UseDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useDialog = (defaultOpen = false): UseDialogReturn => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

// Advanced version with data
export interface UseDialogWithDataReturn<T> extends UseDialogReturn {
  data: T | null;
  openWithData: (data: T) => void;
}

export const useDialogWithData = <T>(
  defaultOpen = false
): UseDialogWithDataReturn<T> => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const openWithData = useCallback((newData: T) => {
    setData(newData);
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    data,
    openWithData,
  };
};
```

#### index.ts
```typescript
export { Dialog } from './Dialog';
export type { DialogProps } from './Dialog';

export { DialogHeader } from './DialogHeader';
export type { DialogHeaderProps } from './DialogHeader';

export { DialogBody } from './DialogBody';
export type { DialogBodyProps } from './DialogBody';

export { DialogFooter } from './DialogFooter';
export type { DialogFooterProps } from './DialogFooter';

export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';
```

---

## Usage Examples

### Basic Dialog
```typescript
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useDialog } from '@/components/ui/hooks/useDialog';

function MyComponent() {
  const dialog = useDialog();

  return (
    <>
      <Button onPress={dialog.open}>Open Dialog</Button>

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="Dialog Title"
        size="md"
      >
        <DialogBody>
          <p className="text-gray-600">
            This is the dialog content. You can put any content here.
          </p>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onPress={dialog.close}>
            Cancel
          </Button>
          <Button variant="primary" onPress={dialog.close}>
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
```

### Form Modal
```typescript
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDialog } from '@/components/ui/hooks/useDialog';
import { useForm } from 'react-hook-form';

interface FormData {
  name: string;
  email: string;
}

function CreateUserDialog() {
  const dialog = useDialog();
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    dialog.close();
    reset();
  };

  return (
    <>
      <Button onPress={dialog.open}>Create User</Button>

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="Create New User"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input {...register('name', { required: true })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input type="email" {...register('email', { required: true })} />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onPress={dialog.close}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create User
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
```

### Confirmation Dialog
```typescript
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useDialog } from '@/components/ui/hooks/useDialog';

function DeleteUserButton() {
  const confirmDialog = useDialog();

  const handleDelete = () => {
    // Delete user logic
    console.log('User deleted');
  };

  return (
    <>
      <Button variant="danger" onPress={confirmDialog.open}>
        Delete Account
      </Button>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.close}
        onConfirm={handleDelete}
        title="Delete Account?"
        description="This action cannot be undone. All your data will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
```

### Dialog with Data
```typescript
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useDialogWithData } from '@/components/ui/hooks/useDialog';

interface User {
  id: string;
  name: string;
  email: string;
}

function UsersList() {
  const dialog = useDialogWithData<User>();

  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  return (
    <>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border rounded">
            <span>{user.name}</span>
            <Button onPress={() => dialog.openWithData(user)}>View Details</Button>
          </div>
        ))}
      </div>

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="User Details"
        size="md"
      >
        <DialogBody>
          {dialog.data && (
            <div className="space-y-2">
              <p><strong>ID:</strong> {dialog.data.id}</p>
              <p><strong>Name:</strong> {dialog.data.name}</p>
              <p><strong>Email:</strong> {dialog.data.email}</p>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onPress={dialog.close}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
```

### Full Screen Dialog
```typescript
import { Dialog, DialogBody } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useDialog } from '@/components/ui/hooks/useDialog';

function ImageGallery() {
  const dialog = useDialog();

  return (
    <>
      <Button onPress={dialog.open}>View Full Screen</Button>

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        size="full"
      >
        <DialogBody className="h-full flex items-center justify-center">
          <img
            src="/image.jpg"
            alt="Full screen"
            className="max-w-full max-h-full object-contain"
          />
        </DialogBody>
      </Dialog>
    </>
  );
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-aria-components` - Accessible dialog/modal primitives
- `lucide-react` - Icons (X, AlertTriangle)
- `tailwindcss` - Styling
- `class-variance-authority` - Variant management (optional)

### Required Components
- ✅ `Button` component (from 01-button-component)
- ✅ `Input` component (optional, for form examples)

---

## Styling Details

### Tailwind CSS 4 Configuration

#### tailwind.config.ts
```typescript
export default {
  theme: {
    extend: {
      animation: {
        'in': 'fadeIn 200ms ease-out',
        'out': 'fadeOut 150ms ease-in',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        fadeOut: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
      },
      backdropBlur: {
        sm: '4px',
      },
    },
  },
};
```

### Color Variants
```typescript
// Confirmation dialog colors
danger: {
  background: 'bg-red-100',
  icon: 'text-red-600',
  button: 'bg-red-600 hover:bg-red-700',
}

warning: {
  background: 'bg-yellow-100',
  icon: 'text-yellow-600',
  button: 'bg-yellow-600 hover:bg-yellow-700',
}

info: {
  background: 'bg-blue-100',
  icon: 'text-blue-600',
  button: 'bg-blue-600 hover:bg-blue-700',
}
```

---

## Acceptance Criteria

- [ ] Dialog component React Aria ile oluşturuldu
- [ ] 5 farklı boyut (sm, md, lg, xl, full) çalışıyor
- [ ] Close button (X icon) çalışıyor
- [ ] ESC tuşu ile kapatma çalışıyor
- [ ] Click outside to close çalışıyor
- [ ] Focus trap çalışıyor (Tab, Shift+Tab)
- [ ] Backdrop blur efekti çalışıyor
- [ ] Fade in/out animasyonları çalışıyor
- [ ] DialogHeader, DialogBody, DialogFooter bileşenleri çalışıyor
- [ ] ConfirmDialog variant çalışıyor
- [ ] useDialog hook çalışıyor
- [ ] useDialogWithData hook çalışıyor
- [ ] ARIA attributes doğru (role, aria-modal, aria-labelledby)
- [ ] Keyboard navigation çalışıyor
- [ ] Mobile responsive design
- [ ] TypeScript tipleri tam

---

## Testing Checklist

### Manual Testing
- [ ] Dialog açılıyor/kapanıyor
- [ ] 5 farklı boyut doğru çalışıyor
- [ ] X button ile kapatma
- [ ] ESC tuşu ile kapatma
- [ ] Overlay click ile kapatma
- [ ] Tab tuşu ile fokus modal içinde kalıyor
- [ ] Shift+Tab ile geriye gitme
- [ ] Animation smooth çalışıyor
- [ ] Backdrop blur görünüyor
- [ ] Form submit modal içinde çalışıyor
- [ ] Confirmation dialog onConfirm çalışıyor
- [ ] Loading state çalışıyor
- [ ] Mobile'da tam ekran çalışıyor

### Accessibility Testing
- [ ] Screen reader ile erişilebilir
- [ ] ARIA attributes doğru
- [ ] Focus management çalışıyor
- [ ] Keyboard navigation tam
- [ ] Color contrast yeterli

---

## Performance Considerations

### Optimization
- Modal sadece `isOpen` true olduğunda DOM'da render edilir
- Exit animasyon bittikten sonra unmount edilir
- Backdrop lazy load ile yüklenir
- Focus trap sadece modal açıkken aktif

### Bundle Size
- React Aria Components: ~15KB (gzipped)
- Lucide icons: ~2KB (tree-shaken)
- Total impact: ~17KB

---

## Resources

### React Aria Documentation
- [Dialog Docs](https://react-spectrum.adobe.com/react-aria/Dialog.html)
- [Modal Overlay](https://react-spectrum.adobe.com/react-aria/Modal.html)
- [Focus Management](https://react-spectrum.adobe.com/react-aria/FocusScope.html)

### Design References
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [Headless UI Dialog](https://headlessui.com/react/dialog)
- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Dialog Component task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/09-ui-components/03-dialog-component.md

Requirements:
1. Create src/components/ui/Dialog/Dialog.tsx - Main dialog component with React Aria
2. Create src/components/ui/Dialog/DialogHeader.tsx - Header section with border
3. Create src/components/ui/Dialog/DialogBody.tsx - Body section with scroll
4. Create src/components/ui/Dialog/DialogFooter.tsx - Footer with action buttons
5. Create src/components/ui/Dialog/ConfirmDialog.tsx - Confirmation variant (danger/warning/info)
6. Create src/components/ui/Dialog/index.ts - Barrel export
7. Create src/components/ui/hooks/useDialog.ts - Dialog state management hook (useDialog, useDialogWithData)

CRITICAL REQUIREMENTS:
- Use React Aria Components (Dialog, Modal, ModalOverlay, Heading)
- Support 5 sizes: sm (384px), md (512px), lg (768px), xl (1024px), full (100%)
- Close button with X icon (Lucide React)
- Backdrop with blur (backdrop-blur-sm) and dark overlay (bg-black/50)
- ESC key support for closing
- Click outside to close (isDismissable prop)
- Focus trap with Tab/Shift+Tab navigation
- Fade in/out + scale animations (data-[entering]/data-[exiting])
- ARIA attributes (role="dialog", aria-modal, aria-labelledby)
- ConfirmDialog with danger/warning/info variants
- useDialog hook for state management
- useDialogWithData hook for passing data to modal
- Tailwind CSS 4 styling with custom animations

Follow the exact code examples and usage patterns provided in the task file. Test all variants and sizes.
```

---

**Status:** 🟡 Pending
**Next Task:** 04-input-component.md
