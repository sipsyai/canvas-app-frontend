/**
 * RadioGroup Component
 *
 * Radio button group with React Aria for full accessibility
 * - Keyboard navigation with arrow keys
 * - Automatic ARIA attributes
 * - Focus management
 * - Screen reader support
 */

import {
  RadioGroup as AriaRadioGroup,
  Radio,
  Label,
  Text,
} from 'react-aria-components';
import { cn } from '@/lib/utils/cn';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  disabled?: boolean;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  isRequired?: boolean;
}

export const RadioGroup = ({
  options,
  value,
  onChange,
  name = 'radio-group',
  disabled = false,
  error,
  orientation = 'vertical',
  label,
  isRequired = false,
}: RadioGroupProps) => {
  return (
    <AriaRadioGroup
      value={value}
      onChange={onChange}
      isDisabled={disabled}
      isRequired={isRequired}
      orientation={orientation}
      name={name}
      className="w-full"
      aria-label={label || name}
    >
      {label && (
        <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            className={cn(
              'flex items-start gap-2 group cursor-pointer',
              'focus:outline-none'
            )}
          >
            {({ isSelected, isDisabled, isFocusVisible }) => (
              <>
                <div
                  className={cn(
                    'mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-gray-300 bg-white dark:border-slate-600 dark:bg-surface-dark',
                    isDisabled && 'opacity-50 cursor-not-allowed',
                    isFocusVisible &&
                      'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div className={cn('flex-1', isDisabled && 'opacity-50')}>
                  <div className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    {option.label}
                  </div>
                  {option.description && (
                    <Text
                      slot="description"
                      className="text-xs text-gray-500 dark:text-slate-400 mt-0.5"
                    >
                      {option.description}
                    </Text>
                  )}
                </div>
              </>
            )}
          </Radio>
        ))}
      </div>
      {error && (
        <Text slot="errorMessage" className="mt-2 text-sm text-red-600">
          {error}
        </Text>
      )}
    </AriaRadioGroup>
  );
};
