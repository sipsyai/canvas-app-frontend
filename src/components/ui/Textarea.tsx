/**
 * Textarea Component
 *
 * Accessible multi-line text input with React Aria
 * - Automatic label association
 * - Error message linking via aria-describedby
 * - Better validation feedback
 * - Character count support
 */

import {
  TextField,
  Label,
  TextArea as AriaTextArea,
  Text,
} from 'react-aria-components';
import type { TextFieldProps as AriaTextFieldProps } from 'react-aria-components';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends Omit<AriaTextFieldProps, 'children'> {
  error?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  maxLength?: number;
}

export const Textarea = ({
  className,
  error,
  label,
  description,
  placeholder,
  rows = 4,
  isRequired = false,
  isDisabled = false,
  maxLength,
  ...props
}: TextareaProps) => {
  return (
    <TextField
      isRequired={isRequired}
      isDisabled={isDisabled}
      isInvalid={!!error}
      className={cn('w-full', className)}
      {...props}
    >
      {label && (
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {description && !error && (
        <Text slot="description" className="text-sm text-gray-500 mb-1 block">
          {description}
        </Text>
      )}
      <AriaTextArea
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          'w-full px-3 py-2 border-2 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'data-[disabled]:bg-gray-100 data-[disabled]:text-gray-500 data-[disabled]:cursor-not-allowed',
          'resize-vertical',
          error
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400'
            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
        )}
      />
      {error && (
        <Text slot="errorMessage" className="mt-1 text-sm text-red-600">
          {error}
        </Text>
      )}
    </TextField>
  );
};

Textarea.displayName = 'Textarea';
