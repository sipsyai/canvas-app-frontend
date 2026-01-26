import { forwardRef, useState, useMemo } from 'react';
import {
  Select as AriaSelect,
  SelectValue,
  Button,
  Popover,
  ListBox,
  ListBoxItem,
  Label,
} from 'react-aria-components';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  // eslint-disable-next-line no-unused-vars
  onChange?: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  name?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      label,
      error,
      disabled,
      searchable = false,
      className,
      name,
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      if (!searchable || !searchQuery) return options;

      return options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery, searchable]);

    // Find selected option label
    const selectedLabel = useMemo(() => {
      const selected = options.find((opt) => opt.value === value);
      return selected?.label || placeholder;
    }, [options, value, placeholder]);

    const handleSelectionChange = (selectedKey: string | number | null) => {
      if (selectedKey !== null) {
        onChange?.(selectedKey);
      }
      setSearchQuery(''); // Reset search on selection
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </Label>
        )}

        <AriaSelect
          selectedKey={value?.toString()}
          onSelectionChange={handleSelectionChange}
          isDisabled={disabled}
          name={name}
        >
          <Button
            ref={ref}
            className={cn(
              'relative w-full px-4 py-3 rounded-lg border-2 transition-colors',
              'flex items-center justify-between',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-300 bg-red-50 text-red-900'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
            )}
          >
            <SelectValue className="flex-1 text-left">
              {({ selectedText }) => (
                <span
                  className={cn(
                    !value && 'text-gray-400'
                  )}
                >
                  {selectedText || selectedLabel}
                </span>
              )}
            </SelectValue>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-gray-500 transition-transform',
                'group-data-[open]:rotate-180'
              )}
            />
          </Button>

          <Popover
            className={cn(
              'w-[--trigger-width] mt-1 rounded-lg border border-gray-200 bg-white shadow-lg',
              'data-[entering]:animate-in data-[entering]:fade-in data-[entering]:zoom-in-95',
              'data-[exiting]:animate-out data-[exiting]:fade-out data-[exiting]:zoom-out-95',
              'max-h-60 overflow-hidden'
            )}
          >
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={cn(
                    'w-full px-3 py-2 rounded border border-gray-300',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'text-sm'
                  )}
                />
              </div>
            )}

            <ListBox className="overflow-y-auto max-h-48 p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <ListBoxItem
                    key={option.value}
                    id={option.value.toString()}
                    textValue={option.label}
                    isDisabled={option.disabled}
                    className={cn(
                      'px-3 py-2 rounded cursor-pointer outline-none text-sm',
                      'transition-colors',
                      'hover:bg-primary-light hover:text-primary',
                      'focus:bg-primary-light focus:text-primary',
                      'data-[selected]:bg-primary data-[selected]:text-white',
                      'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed'
                    )}
                  >
                    {option.label}
                  </ListBoxItem>
                ))
              )}
            </ListBox>
          </Popover>
        </AriaSelect>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
