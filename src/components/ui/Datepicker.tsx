import React, { forwardRef, useState, useRef, useEffect } from 'react';
import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isBefore,
  isAfter,
  isValid,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DatepickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: string; // ISO format (yyyy-MM-dd)
  // eslint-disable-next-line no-unused-vars
  onChange?: (date: string) => void;
  dateFormat?: string; // Display format, default: 'MMM dd, yyyy'
  minDate?: string; // ISO format
  maxDate?: string; // ISO format
  error?: string;
}

export const Datepicker = forwardRef<HTMLInputElement, DatepickerProps>(
  (
    {
      value,
      onChange,
      dateFormat = 'MMM dd, yyyy',
      minDate,
      maxDate,
      error,
      className,
      disabled,
      placeholder = 'Select a date',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(
      value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date()
    );
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse date constraints
    const minDateObj = minDate ? parse(minDate, 'yyyy-MM-dd', new Date()) : null;
    const maxDateObj = maxDate ? parse(maxDate, 'yyyy-MM-dd', new Date()) : null;

    // Format display value
    const displayValue = value
      ? format(parse(value, 'yyyy-MM-dd', new Date()), dateFormat)
      : '';

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Handle date selection
    const handleDateSelect = (date: Date) => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onChange?.(formattedDate);
      setIsOpen(false);
    };

    // Check if date is disabled
    const isDateDisabled = (date: Date) => {
      if (!isValid(date)) return true;
      if (minDateObj && isBefore(date, minDateObj)) return true;
      if (maxDateObj && isAfter(date, maxDateObj)) return true;
      return false;
    };

    // Generate calendar days
    const generateCalendarDays = () => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);

      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    };

    const calendarDays = generateCalendarDays();
    const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : null;

    return (
      <div ref={containerRef} className={cn('relative w-full', className)}>
        <div className="relative">
          <input
            ref={ref}
            type="text"
            value={displayValue}
            placeholder={placeholder}
            readOnly
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
            )}
            {...props}
          />
          <CalendarIcon
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none',
              error ? 'text-red-400' : 'text-gray-400'
            )}
          />
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {/* Calendar Popup */}
        {isOpen && (
          <div
            className={cn(
              'absolute top-full left-0 mt-2 z-50',
              'bg-white rounded-lg border border-gray-200 shadow-lg',
              'p-4 w-80',
              'animate-in fade-in zoom-in-95'
            )}
          >
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className={cn(
                  'p-1 rounded hover:bg-gray-100 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <span className="font-semibold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </span>

              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className={cn(
                  'p-1 rounded hover:bg-gray-100 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                const disabled = isDateDisabled(day);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => !disabled && handleDateSelect(day)}
                    disabled={disabled}
                    className={cn(
                      'h-9 w-9 rounded text-sm transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500',
                      'disabled:cursor-not-allowed',
                      isCurrentMonth
                        ? 'text-gray-900'
                        : 'text-gray-300',
                      isSelected &&
                        'bg-blue-600 text-white hover:bg-blue-700 font-semibold',
                      !isSelected && isTodayDate && 'border-2 border-blue-600',
                      !isSelected && !disabled && 'hover:bg-gray-100',
                      disabled && 'text-gray-300 hover:bg-transparent'
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Datepicker.displayName = 'Datepicker';
