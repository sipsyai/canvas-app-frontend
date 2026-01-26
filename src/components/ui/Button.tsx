/**
 * Button Component
 *
 * Accessible button with React Aria
 * - Better press state handling
 * - Proper keyboard support (Enter and Space)
 * - Loading state with aria-busy
 * - Multiple variants and sizes using CVA
 */

import { Button as AriaButton } from 'react-aria-components';
import type { ButtonProps as AriaButtonProps } from 'react-aria-components';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[pressed]:scale-95',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary/50 shadow-sm shadow-primary/30',
        secondary: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-400',
        ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-slate-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        link: 'text-primary hover:text-primary-dark underline-offset-4 hover:underline focus:ring-primary/50',
      },
      size: {
        xs: 'px-2.5 py-1.5 text-xs',
        sm: 'px-4 py-2 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps extends Omit<AriaButtonProps, 'className' | 'children'>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  title?: string;
  children?: ReactNode;
}

export function Button({
  className,
  variant,
  size,
  loading,
  children,
  isDisabled,
  disabled,
  title,
  ...props
}: ButtonProps) {
  const isButtonDisabled = isDisabled || disabled || loading;

  return (
    <AriaButton
      className={cn(buttonVariants({ variant, size, className }))}
      isDisabled={isButtonDisabled}
      aria-label={title}
      {...props}
    >
      {loading && (
        <Loader2
          className="h-4 w-4 animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </AriaButton>
  );
}
