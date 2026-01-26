/**
 * Checkbox Component
 *
 * Accessible checkbox with React Aria
 * - Proper aria-checked attribute
 * - Better focus management
 * - Indeterminate state support
 * - Full keyboard support
 */

import { Checkbox as AriaCheckbox } from 'react-aria-components';
import type { CheckboxProps as AriaCheckboxProps } from 'react-aria-components';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps extends Omit<AriaCheckboxProps, 'children'> {
  label?: string;
  description?: string;
}

export const Checkbox = ({
  className,
  label,
  description,
  ...props
}: CheckboxProps) => {
  return (
    <AriaCheckbox
      className={cn(
        'group flex items-start gap-2 cursor-pointer',
        'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {({ isSelected, isIndeterminate, isDisabled, isFocusVisible }) => (
        <>
          <div
            className={cn(
              'h-6 w-6 rounded border-2 flex items-center justify-center transition-colors',
              isSelected || isIndeterminate
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300',
              isDisabled && 'opacity-50 cursor-not-allowed',
              isFocusVisible && 'ring-2 ring-blue-500 ring-offset-2'
            )}
          >
            {isIndeterminate ? (
              <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" d="M5 12h14" />
              </svg>
            ) : isSelected ? (
              <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : null}
          </div>
          {label && (
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">{label}</div>
              {description && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {description}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AriaCheckbox>
  );
};

Checkbox.displayName = 'Checkbox';
