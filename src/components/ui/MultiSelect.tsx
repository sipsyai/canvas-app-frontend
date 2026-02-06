/**
 * MultiSelect Component
 *
 * Multi-select dropdown with React Aria for full accessibility
 * - Keyboard navigation (Arrow keys, Space, Enter, Escape)
 * - Automatic ARIA attributes
 * - Focus management
 * - Screen reader support
 */

import { useState, useRef } from 'react';
import {
  Label,
  Button,
  Popover,
  ListBox,
  ListBoxItem,
  Text,
  DialogTrigger,
} from 'react-aria-components';
import type { Selection } from 'react-aria-components';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface MultiSelectOption {
  value: string;
  label: string;
  color?: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  isRequired?: boolean;
}

export const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  disabled = false,
  error,
  label,
  isRequired = false,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const handleSelectionChange = (selection: Selection) => {
    if (selection === 'all') {
      onChange(options.map((opt) => opt.value));
    } else {
      onChange(Array.from(selection) as string[]);
    }
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className="w-full">
      {label && (
        <Label className="text-sm font-medium text-gray-700 mb-1 block">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <Button
          ref={triggerRef}
          isDisabled={disabled}
          className={cn(
            'min-h-[42px] px-3 py-2 border rounded-lg w-full',
            'flex flex-wrap gap-2 items-center',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            'data-[disabled]:bg-gray-100 data-[disabled]:cursor-not-allowed',
            error ? 'border-red-500' : 'border-gray-300'
          )}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-light text-primary rounded text-sm"
              >
                {opt.label}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(opt.value);
                    }}
                    className="hover:text-primary-dark focus:outline-none focus:ring-1 focus:ring-primary rounded"
                    aria-label={`Remove ${opt.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))
          )}
          <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
        </Button>
        <Popover
          triggerRef={triggerRef}
          className={cn(
            'entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out',
            'w-[--trigger-width] mt-1'
          )}
        >
          <ListBox
            selectionMode="multiple"
            selectedKeys={new Set(value)}
            onSelectionChange={handleSelectionChange}
            className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto outline-none"
            aria-label={label || 'Multi-select options'}
          >
            {options.length === 0 ? (
              <ListBoxItem
                className="px-3 py-2 text-gray-500 text-sm"
                textValue="No options"
              >
                No options available
              </ListBoxItem>
            ) : (
              options.map((option) => (
                <ListBoxItem
                  key={option.value}
                  id={option.value}
                  textValue={option.label}
                  className={cn(
                    'px-3 py-2 text-sm text-gray-700 cursor-pointer outline-none',
                    'flex items-center gap-2',
                    'data-[focused]:bg-gray-100',
                    'data-[selected]:bg-primary-light data-[selected]:text-primary'
                  )}
                >
                  {({ isSelected }) => (
                    <>
                      <div
                        className={cn(
                          'h-4 w-4 rounded border flex items-center justify-center',
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'bg-white border-gray-300'
                        )}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span>{option.label}</span>
                    </>
                  )}
                </ListBoxItem>
              ))
            )}
          </ListBox>
        </Popover>
      </DialogTrigger>
      {error && (
        <Text className="mt-1 text-sm text-red-600">
          {error}
        </Text>
      )}
    </div>
  );
};
