/**
 * RadioGroup Component
 *
 * Radio button group with React Aria
 */

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
}

export const RadioGroup = ({
  options,
  value,
  onChange,
  name = 'radio-group',
  disabled = false,
  error,
  orientation = 'vertical',
}: RadioGroupProps) => {
  return (
    <div className="w-full">
      <div
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-2 cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">
                {option.label}
              </div>
              {option.description && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {option.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};
