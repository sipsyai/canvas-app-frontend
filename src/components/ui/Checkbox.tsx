import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          'h-6 w-6 rounded border-2 border-gray-300 text-blue-600',
          'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'cursor-pointer transition-colors',
          className
        )}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';
