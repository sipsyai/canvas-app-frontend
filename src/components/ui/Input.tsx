/**
 * Input Component
 *
 * Accessible text input with React Aria
 * - Automatic label association
 * - Error message linking via aria-describedby
 * - Password toggle accessible
 * - Better validation feedback
 */

import { useState } from 'react';
import {
  TextField,
  Label,
  Input as AriaInput,
  Text,
} from 'react-aria-components';
import type { TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { cn } from '@/lib/utils/cn';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends Omit<AriaTextFieldProps, 'children'> {
  error?: string;
  label?: string;
  description?: string;
  type?: string;
  placeholder?: string;
  className?: string;
}

export const Input = ({
  error,
  type = 'text',
  className,
  label,
  description,
  placeholder,
  isRequired = false,
  isDisabled = false,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <TextField
      type={inputType}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isInvalid={!!error}
      className={cn('w-full', className)}
      {...props}
    >
      {label && (
        <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {description && !error && (
        <Text slot="description" className="text-sm text-gray-500 dark:text-slate-400 mb-1 block">
          {description}
        </Text>
      )}
      <div className="relative">
        <AriaInput
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-3 rounded-lg border-2 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:bg-gray-100 data-[disabled]:dark:bg-slate-800',
            error
              ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300'
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 dark:border-slate-600 dark:bg-surface-dark dark:text-white dark:placeholder-slate-500',
            isPassword && 'pr-12'
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200',
              'focus:outline-none focus:ring-2 focus:ring-primary rounded',
              'p-1'
            )}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <Text slot="errorMessage" className="mt-1 text-sm text-red-600">
          {error}
        </Text>
      )}
    </TextField>
  );
};

Input.displayName = 'Input';
