/**
 * Datepicker Component
 *
 * Simple accessible date picker using native HTML date input
 * - Full keyboard support
 * - Built-in browser validation
 * - Screen reader compatible
 * - No external date library dependencies
 */

import { useId, type ChangeEvent } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DatepickerProps {
  value?: string; // ISO format (yyyy-MM-dd)
  onChange?: (date: string) => void;
  minValue?: string; // ISO format
  maxValue?: string; // ISO format
  error?: string;
  label?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const Datepicker = ({
  value = '',
  onChange,
  minValue,
  maxValue,
  error,
  label,
  isRequired = false,
  isDisabled = false,
  className,
}: DatepickerProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type="date"
          value={value}
          onChange={handleChange}
          min={minValue}
          max={maxValue}
          required={isRequired}
          disabled={isDisabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full px-4 py-2.5 pr-10 rounded-lg border transition-colors text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800',
            error
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <CalendarIcon
            className={cn(
              'h-5 w-5',
              error ? 'text-red-400' : 'text-slate-400 dark:text-slate-500'
            )}
          />
        </div>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

Datepicker.displayName = 'Datepicker';
