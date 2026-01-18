# Task: DatePicker Component

**Priority:** 🔴 High
**Estimated Time:** 1 gün
**Dependencies:** React Aria Components 1.5

---

## Objective

React Aria Components kullanarak erişilebilir, klavye navigasyonu destekli DatePicker komponenti oluşturmak. Tek tarih seçimi, tarih aralığı seçimi ve tarih+saat seçimi özelliklerini desteklemeli.

---

## Component Features

### DatePicker Variants
1. **DatePicker** - Tek tarih seçimi
2. **DateRangePicker** - Tarih aralığı seçimi (başlangıç-bitiş)
3. **DateTimePicker** - Tarih + saat seçimi

### Core Features
- Calendar popup ile tarih seçimi
- Keyboard navigation (Arrow keys, Enter, Escape)
- Min/max date constraints
- Disabled dates (tatil günleri, geçmiş tarihler vb.)
- Locale support (TR, EN)
- Error state ve validation
- React Hook Form integration
- Tailwind CSS 4 styling
- Accessible (ARIA attributes)

---

## UI/UX Design

### DatePicker Layout
```
┌─────────────────────────────────┐
│  Select Date           [📅]     │  ← Trigger button
└─────────────────────────────────┘
         ↓ (Click opens calendar)
┌─────────────────────────────────┐
│  January 2026         [< >]     │  ← Month navigation
├─────────────────────────────────┤
│  Mo Tu We Th Fr Sa Su           │
│  30 31  1  2  3  4  5           │
│   6  7  8  9 10 11 12           │
│  13 14 15 16 17 18 19           │
│  20 21 22 23 24 25 26           │
│  27 28 29 30 31  1  2           │
│                                 │
│  [Today] [Clear] [Close]        │  ← Actions
└─────────────────────────────────┘
```

### DateRangePicker Layout
```
┌─────────────────────────────────┐
│  Start Date        [📅]         │
│  2026-01-15                     │
│                                 │
│  End Date          [📅]         │
│  2026-01-20                     │
└─────────────────────────────────┘
```

### DateTimePicker Layout
```
┌─────────────────────────────────┐
│  Select Date & Time    [📅 🕒]  │
│  2026-01-18 14:30               │
└─────────────────────────────────┘
         ↓ (Click opens calendar + time)
┌─────────────────────────────────┐
│  Calendar (same as above)       │
├─────────────────────────────────┤
│  Time                           │
│  Hour:   [14] ▲▼                │
│  Minute: [30] ▲▼                │
└─────────────────────────────────┘
```

### States
- **Default** - Normal state
- **Focused** - Keyboard focus (blue ring)
- **Hover** - Mouse hover
- **Disabled** - Grayed out, not interactive
- **Error** - Red border, error message
- **Open** - Calendar popup visible
- **Selected** - Tarih seçili (blue background)

---

## Technical Details

### File Structure
```
src/
├── components/
│   └── ui/
│       ├── DatePicker/
│       │   ├── DatePicker.tsx           ⭐ Single date picker
│       │   ├── DateRangePicker.tsx      ⭐ Date range picker
│       │   ├── DateTimePicker.tsx       ⭐ Date + time picker
│       │   ├── Calendar.tsx             ⭐ Shared calendar component
│       │   ├── CalendarGrid.tsx         ⭐ Calendar grid
│       │   ├── CalendarCell.tsx         ⭐ Single date cell
│       │   ├── TimeField.tsx            ⭐ Time input field
│       │   └── index.ts                 ⭐ Exports
│       └── datepicker.css               ⭐ Tailwind CSS 4 styles
└── utils/
    └── date.utils.ts                    ⭐ Date helper functions
```

### Component Implementation

#### DatePicker.tsx
```typescript
import React from 'react';
import {
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateValue,
  Button,
  Calendar,
  CalendarGrid,
  CalendarCell,
  DateInput,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
} from 'react-aria-components';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';

export interface DatePickerProps extends Omit<AriaDatePickerProps<DateValue>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string;
  className?: string;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDisabled?: boolean;
  isRequired?: boolean;
}

export const DatePicker = ({
  label,
  description,
  errorMessage,
  className,
  minValue,
  maxValue,
  isDisabled,
  isRequired,
  ...props
}: DatePickerProps) => {
  return (
    <AriaDatePicker
      className={cn('flex flex-col gap-1', className)}
      minValue={minValue}
      maxValue={maxValue}
      isDisabled={isDisabled}
      isRequired={isRequired}
      {...props}
    >
      {label && (
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Group
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'rounded-lg border border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-800',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
          'transition-all duration-200',
          isDisabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          errorMessage && 'border-red-500 focus-within:ring-red-500'
        )}
      >
        <DateInput className="flex-1 flex gap-1">
          {(segment) => (
            <DateSegment
              segment={segment}
              className={cn(
                'px-1 rounded',
                'focus:bg-blue-500 focus:text-white',
                'outline-none',
                'tabular-nums'
              )}
            />
          )}
        </DateInput>

        <Button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
          <CalendarIcon className="w-5 h-5 text-gray-500" />
        </Button>
      </Group>

      {description && !errorMessage && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}

      <Popover
        className={cn(
          'bg-white dark:bg-gray-800',
          'border border-gray-300 dark:border-gray-600',
          'rounded-lg shadow-lg',
          'p-4',
          'z-50'
        )}
      >
        <Dialog className="outline-none">
          <Calendar>
            <header className="flex items-center justify-between mb-4">
              <Button
                slot="previous"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                ←
              </Button>
              <Heading className="font-semibold text-gray-900 dark:text-white" />
              <Button
                slot="next"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                →
              </Button>
            </header>

            <CalendarGrid className="border-separate border-spacing-1">
              {(date) => (
                <CalendarCell
                  date={date}
                  className={cn(
                    'w-9 h-9 text-sm rounded-lg',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'selected:bg-blue-500 selected:text-white',
                    'disabled:text-gray-300 disabled:cursor-not-allowed',
                    'outside-month:text-gray-400',
                    'transition-colors duration-150'
                  )}
                />
              )}
            </CalendarGrid>

            <div className="flex gap-2 mt-4">
              <Button
                className={cn(
                  'px-3 py-1.5 text-sm',
                  'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
                  'rounded transition-colors'
                )}
              >
                Today
              </Button>
              <Button
                className={cn(
                  'px-3 py-1.5 text-sm',
                  'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
                  'rounded transition-colors'
                )}
              >
                Clear
              </Button>
            </div>
          </Calendar>
        </Dialog>
      </Popover>
    </AriaDatePicker>
  );
};
```

#### DateRangePicker.tsx
```typescript
import React from 'react';
import {
  DateRangePicker as AriaDateRangePicker,
  DateRangePickerProps as AriaDateRangePickerProps,
  DateValue,
  Button,
  Calendar,
  CalendarGrid,
  CalendarCell,
  DateInput,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
  RangeCalendar,
} from 'react-aria-components';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';

export interface DateRangePickerProps extends Omit<AriaDateRangePickerProps<DateValue>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string;
  className?: string;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDisabled?: boolean;
  isRequired?: boolean;
}

export const DateRangePicker = ({
  label,
  description,
  errorMessage,
  className,
  minValue,
  maxValue,
  isDisabled,
  isRequired,
  ...props
}: DateRangePickerProps) => {
  return (
    <AriaDateRangePicker
      className={cn('flex flex-col gap-1', className)}
      minValue={minValue}
      maxValue={maxValue}
      isDisabled={isDisabled}
      isRequired={isRequired}
      {...props}
    >
      {label && (
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Group
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'rounded-lg border border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-800',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
          'transition-all duration-200',
          isDisabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          errorMessage && 'border-red-500 focus-within:ring-red-500'
        )}
      >
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Start:</span>
            <DateInput slot="start" className="flex gap-1">
              {(segment) => (
                <DateSegment
                  segment={segment}
                  className={cn(
                    'px-1 rounded',
                    'focus:bg-blue-500 focus:text-white',
                    'outline-none',
                    'tabular-nums'
                  )}
                />
              )}
            </DateInput>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">End:</span>
            <DateInput slot="end" className="flex gap-1">
              {(segment) => (
                <DateSegment
                  segment={segment}
                  className={cn(
                    'px-1 rounded',
                    'focus:bg-blue-500 focus:text-white',
                    'outline-none',
                    'tabular-nums'
                  )}
                />
              )}
            </DateInput>
          </div>
        </div>

        <Button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
          <CalendarIcon className="w-5 h-5 text-gray-500" />
        </Button>
      </Group>

      {description && !errorMessage && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}

      <Popover
        className={cn(
          'bg-white dark:bg-gray-800',
          'border border-gray-300 dark:border-gray-600',
          'rounded-lg shadow-lg',
          'p-4',
          'z-50'
        )}
      >
        <Dialog className="outline-none">
          <RangeCalendar>
            <header className="flex items-center justify-between mb-4">
              <Button
                slot="previous"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                ←
              </Button>
              <Heading className="font-semibold text-gray-900 dark:text-white" />
              <Button
                slot="next"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                →
              </Button>
            </header>

            <CalendarGrid className="border-separate border-spacing-1">
              {(date) => (
                <CalendarCell
                  date={date}
                  className={cn(
                    'w-9 h-9 text-sm rounded-lg',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'selected:bg-blue-500 selected:text-white',
                    'selection-start:rounded-l-lg selection-end:rounded-r-lg',
                    'disabled:text-gray-300 disabled:cursor-not-allowed',
                    'outside-month:text-gray-400',
                    'transition-colors duration-150'
                  )}
                />
              )}
            </CalendarGrid>

            <div className="flex gap-2 mt-4">
              <Button
                className={cn(
                  'px-3 py-1.5 text-sm',
                  'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
                  'rounded transition-colors'
                )}
              >
                This Week
              </Button>
              <Button
                className={cn(
                  'px-3 py-1.5 text-sm',
                  'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
                  'rounded transition-colors'
                )}
              >
                This Month
              </Button>
              <Button
                className={cn(
                  'px-3 py-1.5 text-sm',
                  'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
                  'rounded transition-colors'
                )}
              >
                Clear
              </Button>
            </div>
          </RangeCalendar>
        </Dialog>
      </Popover>
    </AriaDateRangePicker>
  );
};
```

#### DateTimePicker.tsx
```typescript
import React from 'react';
import {
  DatePicker as AriaDatePicker,
  DatePickerProps as AriaDatePickerProps,
  DateValue,
  TimeField,
  TimeValue,
  Button,
  Calendar,
  CalendarGrid,
  CalendarCell,
  DateInput,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
} from 'react-aria-components';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';

export interface DateTimePickerProps extends Omit<AriaDatePickerProps<DateValue>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string;
  className?: string;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDisabled?: boolean;
  isRequired?: boolean;
  defaultTimeValue?: TimeValue;
}

export const DateTimePicker = ({
  label,
  description,
  errorMessage,
  className,
  minValue,
  maxValue,
  isDisabled,
  isRequired,
  defaultTimeValue,
  ...props
}: DateTimePickerProps) => {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="flex gap-2">
        {/* Date Picker */}
        <AriaDatePicker
          className="flex-1"
          minValue={minValue}
          maxValue={maxValue}
          isDisabled={isDisabled}
          isRequired={isRequired}
          {...props}
        >
          <Group
            className={cn(
              'flex items-center gap-2 px-3 py-2',
              'rounded-lg border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
              'transition-all duration-200',
              isDisabled && 'opacity-50 cursor-not-allowed bg-gray-50',
              errorMessage && 'border-red-500 focus-within:ring-red-500'
            )}
          >
            <DateInput className="flex-1 flex gap-1">
              {(segment) => (
                <DateSegment
                  segment={segment}
                  className={cn(
                    'px-1 rounded',
                    'focus:bg-blue-500 focus:text-white',
                    'outline-none',
                    'tabular-nums'
                  )}
                />
              )}
            </DateInput>

            <Button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
            </Button>
          </Group>

          <Popover
            className={cn(
              'bg-white dark:bg-gray-800',
              'border border-gray-300 dark:border-gray-600',
              'rounded-lg shadow-lg',
              'p-4',
              'z-50'
            )}
          >
            <Dialog className="outline-none">
              <Calendar>
                <header className="flex items-center justify-between mb-4">
                  <Button
                    slot="previous"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    ←
                  </Button>
                  <Heading className="font-semibold text-gray-900 dark:text-white" />
                  <Button
                    slot="next"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    →
                  </Button>
                </header>

                <CalendarGrid className="border-separate border-spacing-1">
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className={cn(
                        'w-9 h-9 text-sm rounded-lg',
                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        'selected:bg-blue-500 selected:text-white',
                        'disabled:text-gray-300 disabled:cursor-not-allowed',
                        'outside-month:text-gray-400',
                        'transition-colors duration-150'
                      )}
                    />
                  )}
                </CalendarGrid>
              </Calendar>
            </Dialog>
          </Popover>
        </AriaDatePicker>

        {/* Time Field */}
        <TimeField
          defaultValue={defaultTimeValue}
          isDisabled={isDisabled}
          className="w-32"
        >
          <Group
            className={cn(
              'flex items-center gap-2 px-3 py-2',
              'rounded-lg border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
              'transition-all duration-200',
              isDisabled && 'opacity-50 cursor-not-allowed bg-gray-50',
              errorMessage && 'border-red-500 focus-within:ring-red-500'
            )}
          >
            <DateInput className="flex-1 flex gap-1">
              {(segment) => (
                <DateSegment
                  segment={segment}
                  className={cn(
                    'px-1 rounded',
                    'focus:bg-blue-500 focus:text-white',
                    'outline-none',
                    'tabular-nums'
                  )}
                />
              )}
            </DateInput>
            <ClockIcon className="w-5 h-5 text-gray-500" />
          </Group>
        </TimeField>
      </div>

      {description && !errorMessage && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  );
};
```

#### date.utils.ts
```typescript
import { parseDate, parseAbsoluteToLocal } from '@internationalized/date';

export const formatDate = (date: Date, locale: string = 'tr-TR'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date, locale: string = 'tr-TR'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const isDisabledDate = (
  date: Date,
  disabledDates?: Date[],
  minDate?: Date,
  maxDate?: Date
): boolean => {
  // Check if date is in disabled dates array
  if (disabledDates?.some(d => d.getTime() === date.getTime())) {
    return true;
  }

  // Check min date
  if (minDate && date < minDate) {
    return true;
  }

  // Check max date
  if (maxDate && date > maxDate) {
    return true;
  }

  return false;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getToday = () => {
  const now = new Date();
  return parseDate(now.toISOString().split('T')[0]);
};

export const getTomorrow = () => {
  const tomorrow = addDays(new Date(), 1);
  return parseDate(tomorrow.toISOString().split('T')[0]);
};

export const getNextWeek = () => {
  const nextWeek = addDays(new Date(), 7);
  return parseDate(nextWeek.toISOString().split('T')[0]);
};
```

#### index.ts
```typescript
export { DatePicker } from './DatePicker';
export { DateRangePicker } from './DateRangePicker';
export { DateTimePicker } from './DateTimePicker';

export type { DatePickerProps } from './DatePicker';
export type { DateRangePickerProps } from './DateRangePicker';
export type { DateTimePickerProps } from './DateTimePicker';
```

---

## Dependencies

### NPM Packages
```bash
npm install react-aria-components
npm install @internationalized/date
npm install @heroicons/react
```

**Already Installed:**
- `react-hook-form` - Form integration
- `@hookform/resolvers` - Validation integration
- `zod` - Schema validation

---

## Usage Examples

### Basic DatePicker
```typescript
import { DatePicker } from '@/components/ui/DatePicker';
import { parseDate } from '@internationalized/date';

function MyForm() {
  const [date, setDate] = useState(parseDate('2026-01-18'));

  return (
    <DatePicker
      label="Select Date"
      value={date}
      onChange={setDate}
      description="Choose a date from the calendar"
    />
  );
}
```

### DatePicker with Constraints
```typescript
import { DatePicker } from '@/components/ui/DatePicker';
import { parseDate } from '@internationalized/date';
import { getToday, getNextWeek } from '@/utils/date.utils';

function BookingForm() {
  return (
    <DatePicker
      label="Booking Date"
      minValue={getToday()}
      maxValue={getNextWeek()}
      isRequired
      errorMessage="Please select a valid date"
    />
  );
}
```

### DateRangePicker
```typescript
import { DateRangePicker } from '@/components/ui/DatePicker';
import { parseDate } from '@internationalized/date';

function ReportForm() {
  const [range, setRange] = useState({
    start: parseDate('2026-01-01'),
    end: parseDate('2026-01-31'),
  });

  return (
    <DateRangePicker
      label="Report Period"
      value={range}
      onChange={setRange}
      description="Select start and end dates"
    />
  );
}
```

### DateTimePicker
```typescript
import { DateTimePicker } from '@/components/ui/DatePicker';
import { parseDate, parseTime } from '@internationalized/date';

function MeetingForm() {
  return (
    <DateTimePicker
      label="Meeting Time"
      defaultTimeValue={parseTime('09:00')}
      description="Select meeting date and time"
    />
  );
}
```

### React Hook Form Integration
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DatePicker } from '@/components/ui/DatePicker';
import { parseDate } from '@internationalized/date';

const formSchema = z.object({
  birthDate: z.custom((val) => val instanceof Date, {
    message: 'Please select a valid date',
  }),
  startDate: z.custom((val) => val instanceof Date),
  endDate: z.custom((val) => val instanceof Date),
});

type FormData = z.infer<typeof formSchema>;

function BookingForm() {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="birthDate"
        control={control}
        render={({ field, fieldState }) => (
          <DatePicker
            label="Birth Date"
            value={field.value}
            onChange={field.onChange}
            errorMessage={fieldState.error?.message}
            maxValue={getToday()}
            isRequired
          />
        )}
      />

      <Controller
        name="startDate"
        control={control}
        render={({ field, fieldState }) => (
          <DatePicker
            label="Start Date"
            value={field.value}
            onChange={field.onChange}
            errorMessage={fieldState.error?.message}
            minValue={getToday()}
          />
        )}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Disabled Dates Example
```typescript
import { DatePicker } from '@/components/ui/DatePicker';
import { parseDate } from '@internationalized/date';
import { isWeekend } from '@/utils/date.utils';

function WeekdayPicker() {
  const isDateUnavailable = (date) => {
    // Disable weekends
    return isWeekend(date.toDate());
  };

  return (
    <DatePicker
      label="Select Weekday"
      isDateUnavailable={isDateUnavailable}
      description="Only weekdays are available"
    />
  );
}
```

### Locale Support
```typescript
import { DatePicker } from '@/components/ui/DatePicker';
import { I18nProvider } from 'react-aria-components';

function LocalizedDatePicker() {
  return (
    <I18nProvider locale="tr-TR">
      <DatePicker
        label="Tarih Seç"
        description="Takvimden tarih seçiniz"
      />
    </I18nProvider>
  );
}
```

---

## Acceptance Criteria

- [ ] DatePicker komponenti tek tarih seçimi yapabiliyor
- [ ] DateRangePicker başlangıç-bitiş tarihi seçebiliyor
- [ ] DateTimePicker tarih + saat seçebiliyor
- [ ] Calendar popup açılıyor/kapanıyor
- [ ] Keyboard navigation çalışıyor (Arrow keys, Enter, Escape)
- [ ] Min/max date constraints uygulanıyor
- [ ] Disabled dates gösteriliyor (grayed out)
- [ ] Locale support çalışıyor (TR, EN)
- [ ] Error state gösteriliyor
- [ ] React Hook Form integration çalışıyor
- [ ] Tailwind CSS 4 styling uygulanmış
- [ ] Dark mode desteği var
- [ ] Accessible (ARIA attributes)
- [ ] Mobile responsive
- [ ] Loading state yok (instant)
- [ ] Today/Clear/Close butonları çalışıyor

---

## Testing Checklist

### Manual Testing
- [ ] Tek tarih seçimi çalışıyor
- [ ] Tarih aralığı seçimi çalışıyor
- [ ] Tarih + saat seçimi çalışıyor
- [ ] Keyboard ile navigasyon (Tab, Arrow keys, Enter, Escape)
- [ ] Min date öncesi seçilemiyor
- [ ] Max date sonrası seçilemiyor
- [ ] Disabled dates seçilemiyor
- [ ] Today butonu bugünü seçiyor
- [ ] Clear butonu seçimi temizliyor
- [ ] Error state gösteriliyor
- [ ] Form validation çalışıyor
- [ ] Locale değişimi çalışıyor (TR/EN)
- [ ] Dark mode düzgün görünüyor
- [ ] Mobile'da touch friendly

### Component States
- [ ] Default state
- [ ] Focused state (keyboard)
- [ ] Hover state
- [ ] Disabled state
- [ ] Error state
- [ ] Open state (calendar visible)
- [ ] Selected state

---

## Styling Guide

### Tailwind CSS 4 Classes

#### DatePicker Container
```css
.date-picker {
  @apply flex flex-col gap-1;
}

.date-picker-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.date-picker-group {
  @apply flex items-center gap-2 px-3 py-2;
  @apply rounded-lg border border-gray-300 dark:border-gray-600;
  @apply bg-white dark:bg-gray-800;
  @apply focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500;
  @apply transition-all duration-200;
}

.date-picker-group[data-disabled] {
  @apply opacity-50 cursor-not-allowed bg-gray-50;
}

.date-picker-group[data-invalid] {
  @apply border-red-500 focus-within:ring-red-500;
}
```

#### Calendar Popup
```css
.calendar-popup {
  @apply bg-white dark:bg-gray-800;
  @apply border border-gray-300 dark:border-gray-600;
  @apply rounded-lg shadow-lg p-4 z-50;
}

.calendar-header {
  @apply flex items-center justify-between mb-4;
}

.calendar-nav-button {
  @apply p-2 hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply rounded transition-colors;
}

.calendar-heading {
  @apply font-semibold text-gray-900 dark:text-white;
}
```

#### Calendar Grid
```css
.calendar-grid {
  @apply border-separate border-spacing-1;
}

.calendar-cell {
  @apply w-9 h-9 text-sm rounded-lg;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
  @apply transition-colors duration-150;
}

.calendar-cell[data-selected] {
  @apply bg-blue-500 text-white;
}

.calendar-cell[data-disabled] {
  @apply text-gray-300 cursor-not-allowed;
}

.calendar-cell[data-outside-month] {
  @apply text-gray-400;
}

.calendar-cell[data-today] {
  @apply ring-2 ring-blue-300;
}
```

#### Date Segment
```css
.date-segment {
  @apply px-1 rounded tabular-nums;
  @apply outline-none;
}

.date-segment[data-focused] {
  @apply bg-blue-500 text-white;
}

.date-segment[data-placeholder] {
  @apply text-gray-400;
}
```

---

## Resources

### React Aria Documentation
- [DatePicker](https://react-spectrum.adobe.com/react-aria/DatePicker.html)
- [DateRangePicker](https://react-spectrum.adobe.com/react-aria/DateRangePicker.html)
- [Calendar](https://react-spectrum.adobe.com/react-aria/Calendar.html)
- [TimeField](https://react-spectrum.adobe.com/react-aria/TimeField.html)
- [Internationalized Date](https://react-spectrum.adobe.com/internationalized/date/)

### Design References
- [Tailwind CSS 4 Docs](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)
- [React Hook Form](https://react-hook-form.com/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the DatePicker Component task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/09-ui-components/07-datepicker-component.md

Requirements:
1. Create src/components/ui/DatePicker/DatePicker.tsx - Single date picker component with React Aria
2. Create src/components/ui/DatePicker/DateRangePicker.tsx - Date range picker (start-end dates)
3. Create src/components/ui/DatePicker/DateTimePicker.tsx - Date + time picker component
4. Create src/components/ui/DatePicker/index.ts - Export all components and types
5. Create src/utils/date.utils.ts - Date helper functions (formatDate, isWeekend, addDays, etc.)

CRITICAL REQUIREMENTS:
- Use React Aria Components 1.5 (@latest)
- Support keyboard navigation (Arrow keys, Enter, Escape, Tab)
- Implement min/max date constraints
- Add disabled dates support (weekends, custom dates)
- Support locale (TR, EN) via I18nProvider
- Show error state with red border + message
- Integrate with React Hook Form (Controller)
- Use Tailwind CSS 4 for styling
- Add dark mode support (dark: prefix)
- Make it accessible (ARIA attributes)
- Mobile responsive design

Follow the exact code examples and file structure provided in the task file. Test all three variants:
- DatePicker (single date)
- DateRangePicker (date range)
- DateTimePicker (date + time)
```

---

**Status:** 🟡 Pending
**Next Task:** 08-table-component.md
