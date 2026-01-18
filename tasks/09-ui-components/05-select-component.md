# Task: Select Component

**Priority:** 🔴 High
**Estimated Time:** 1 gün
**Dependencies:** React Aria Components 1.5

---

## Objective

React Aria Components kullanarak erişilebilir, esnek ve zengin özelliklere sahip Select ve MultiSelect component'leri oluşturmak.

---

## Component Özellikleri

### Select Component (Single Select)
- **Temel İşlevsellik**
  - Tek seçim (single select)
  - Arama/filtreleme (search/filter)
  - Klavye navigasyonu (Arrow keys, Enter, Escape)
  - Açılır menü (dropdown)
  - Placeholder desteği

- **Gelişmiş Özellikler**
  - Gruplandırılmış seçenekler (grouped options)
  - Özel option rendering (custom option rendering)
  - Devre dışı seçenekler (disabled options)
  - Loading state
  - Error state
  - React Hook Form entegrasyonu
  - Tailwind CSS 4 styling

### MultiSelect Component (Multi Select)
- **Temel İşlevsellik**
  - Çoklu seçim (multiple selection)
  - Seçili öğeleri gösterme (chips/tags)
  - Seçili öğe kaldırma (remove chips)
  - "Select All" / "Clear All" seçenekleri

- **Gelişmiş Özellikler**
  - Maksimum seçim limiti
  - Arama/filtreleme
  - Gruplandırılmış seçenekler
  - Özel chip rendering
  - Loading ve error state

---

## UI/UX Design

### Select Component Layout
```
┌─────────────────────────────────────┐
│  Label Text              (Optional) │
│  ┌───────────────────────────────┐  │
│  │  Selected Value         ▼    │  │ ← Trigger button
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🔍 Search...                 │  │ ← Search input (optional)
│  ├───────────────────────────────┤  │
│  │  ✓ Option 1                   │  │ ← Selected
│  │    Option 2                   │  │
│  │    Option 3 (disabled)        │  │ ← Disabled
│  ├───────────────────────────────┤  │
│  │  Group Title                  │  │ ← Group header
│  │    Option 4                   │  │
│  │    Option 5                   │  │
│  └───────────────────────────────┘  │
│                                     │
│  Helper text / Error message        │
└─────────────────────────────────────┘
```

### MultiSelect Component Layout
```
┌─────────────────────────────────────┐
│  Label Text                         │
│  ┌───────────────────────────────┐  │
│  │  [Tag 1 ×] [Tag 2 ×]      ▼  │  │ ← Selected items as chips
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🔍 Search...                 │  │
│  │  [ Select All ] [ Clear All ] │  │
│  ├───────────────────────────────┤  │
│  │  ☑ Option 1                   │  │ ← Checked
│  │  ☐ Option 2                   │  │ ← Unchecked
│  │  ☑ Option 3                   │  │ ← Checked
│  │  ☐ Option 4                   │  │
│  └───────────────────────────────┘  │
│                                     │
│  3 items selected (max 5)           │
└─────────────────────────────────────┘
```

### States
- **Idle** - Normal state, closed dropdown
- **Open** - Dropdown açık, seçenekler görünür
- **Focused** - Keyboard focus (border highlight)
- **Loading** - Seçenekler yükleniyor (spinner)
- **Error** - Validasyon hatası (kırmızı border)
- **Disabled** - Component devre dışı (opacity 0.5)

---

## Technical Details

### File Structure
```
src/
├── components/
│   └── ui/
│       ├── Select/
│       │   ├── Select.tsx               ⭐ Single select component
│       │   ├── MultiSelect.tsx          ⭐ Multi select component
│       │   ├── SelectOption.tsx         ⭐ Option component
│       │   ├── SelectGroup.tsx          ⭐ Group component
│       │   ├── SelectSearch.tsx         ⭐ Search input component
│       │   ├── Select.types.ts          ⭐ TypeScript types
│       │   └── index.ts                 ⭐ Exports
│       └── Tag/
│           └── Tag.tsx                  ⭐ Chip/Tag component (for multi-select)
```

### Component Implementation

#### Select.tsx (Single Select)
```typescript
import React, { useState } from 'react';
import {
  Select as AriaSelect,
  SelectValue,
  Button,
  Popover,
  ListBox,
  Label,
  Text,
} from 'react-aria-components';
import { SelectOption } from './SelectOption';
import { SelectSearch } from './SelectSearch';
import { SelectProps, SelectOptionType } from './Select.types';

export const Select = <T extends string | number>({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  onSearchChange,
  searchable = false,
  grouped = false,
  loading = false,
  error,
  helperText,
  disabled = false,
  required = false,
  className,
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`select-wrapper ${className || ''}`}>
      {label && (
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <AriaSelect
        selectedKey={value}
        onSelectionChange={onChange}
        isDisabled={disabled}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <Button
          className={`
            w-full flex items-center justify-between
            px-4 py-2.5 rounded-lg border
            text-left text-sm
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white hover:border-gray-400'}
            focus:outline-none focus:ring-2 focus:ring-offset-1
          `}
        >
          <SelectValue className="flex-1 text-gray-900">
            {selectedOption ? selectedOption.label : placeholder}
          </SelectValue>
          <span className="ml-2 text-gray-500">
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </span>
        </Button>

        <Popover
          className="
            mt-1 rounded-lg border border-gray-200
            bg-white shadow-lg
            max-h-60 overflow-auto
            z-50
          "
        >
          {searchable && (
            <SelectSearch
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search..."
            />
          )}

          <ListBox className="outline-none">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                {loading ? 'Loading...' : 'No options found'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <SelectOption
                  key={option.value}
                  option={option}
                  isSelected={value === option.value}
                />
              ))
            )}
          </ListBox>
        </Popover>
      </AriaSelect>

      {(helperText || error) && (
        <Text
          slot="description"
          className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}
        >
          {error || helperText}
        </Text>
      )}
    </div>
  );
};
```

#### MultiSelect.tsx
```typescript
import React, { useState } from 'react';
import {
  Select as AriaSelect,
  Button,
  Popover,
  ListBox,
  Label,
  Text,
} from 'react-aria-components';
import { Tag } from '../Tag/Tag';
import { SelectSearch } from './SelectSearch';
import { MultiSelectProps, SelectOptionType } from './Select.types';

export const MultiSelect = <T extends string | number>({
  label,
  placeholder = 'Select options',
  options,
  value = [],
  onChange,
  onSearchChange,
  searchable = true,
  maxSelections,
  showSelectAll = true,
  loading = false,
  error,
  helperText,
  disabled = false,
  required = false,
  className,
}: MultiSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = searchable && searchTerm
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleToggleOption = (optionValue: T) => {
    if (value.includes(optionValue)) {
      // Remove from selection
      onChange(value.filter((v) => v !== optionValue));
    } else {
      // Add to selection (check max limit)
      if (!maxSelections || value.length < maxSelections) {
        onChange([...value, optionValue]);
      }
    }
  };

  const handleSelectAll = () => {
    const selectableOptions = options.filter((opt) => !opt.disabled);
    const allValues = selectableOptions.map((opt) => opt.value);
    onChange(maxSelections ? allValues.slice(0, maxSelections) : allValues);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleRemoveTag = (valueToRemove: T) => {
    onChange(value.filter((v) => v !== valueToRemove));
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <div className={`multi-select-wrapper ${className || ''}`}>
      {label && (
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <AriaSelect
        selectionMode="multiple"
        selectedKeys={value}
        onSelectionChange={onChange}
        isDisabled={disabled}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        {/* Trigger Button with Tags */}
        <Button
          className={`
            w-full flex items-center gap-2 flex-wrap
            px-3 py-2 rounded-lg border
            min-h-[42px]
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white hover:border-gray-400'}
            focus:outline-none focus:ring-2 focus:ring-offset-1
          `}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap flex-1">
              {selectedOptions.map((option) => (
                <Tag
                  key={option.value}
                  label={option.label}
                  onRemove={() => handleRemoveTag(option.value)}
                  disabled={disabled}
                />
              ))}
            </div>
          )}
          <span className="ml-auto text-gray-500">
            <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </Button>

        <Popover
          className="
            mt-1 rounded-lg border border-gray-200
            bg-white shadow-lg
            max-h-72 overflow-auto
            z-50 w-full
          "
        >
          {searchable && (
            <SelectSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search..."
            />
          )}

          {showSelectAll && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          <ListBox className="outline-none">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => !option.disabled && handleToggleOption(option.value)}
                className={`
                  flex items-center gap-3 px-4 py-2.5
                  text-sm cursor-pointer
                  transition-colors
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                  ${value.includes(option.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                `}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  disabled={option.disabled}
                  onChange={() => {}}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="flex-1">{option.label}</span>
                {option.icon && <span className="text-gray-400">{option.icon}</span>}
              </div>
            ))}
          </ListBox>
        </Popover>
      </AriaSelect>

      {(helperText || error) && (
        <Text
          slot="description"
          className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}
        >
          {error || helperText}
          {maxSelections && ` (${value.length}/${maxSelections} selected)`}
        </Text>
      )}
    </div>
  );
};
```

#### SelectOption.tsx
```typescript
import React from 'react';
import { ListBoxItem } from 'react-aria-components';
import { SelectOptionType } from './Select.types';

interface SelectOptionProps<T> {
  option: SelectOptionType<T>;
  isSelected: boolean;
}

export const SelectOption = <T extends string | number>({
  option,
  isSelected,
}: SelectOptionProps<T>) => {
  return (
    <ListBoxItem
      id={option.value}
      textValue={option.label}
      className={`
        flex items-center justify-between
        px-4 py-2.5 text-sm
        cursor-pointer transition-colors
        ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'}
        outline-none focus:bg-gray-100
      `}
      isDisabled={option.disabled}
    >
      <span className="flex items-center gap-2">
        {option.icon && <span className="text-gray-400">{option.icon}</span>}
        {option.label}
        {option.description && (
          <span className="text-xs text-gray-500">{option.description}</span>
        )}
      </span>
      {isSelected && (
        <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </ListBoxItem>
  );
};
```

#### SelectSearch.tsx
```typescript
import React from 'react';
import { SearchField, Input } from 'react-aria-components';

interface SelectSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SelectSearch: React.FC<SelectSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
}) => {
  return (
    <div className="p-2 border-b border-gray-100">
      <SearchField
        value={value}
        onChange={onChange}
        className="relative"
      >
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <Input
            placeholder={placeholder}
            className="
              w-full pl-9 pr-3 py-2
              text-sm border border-gray-200 rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500
              placeholder:text-gray-400
            "
          />
        </div>
      </SearchField>
    </div>
  );
};
```

#### Tag.tsx (for MultiSelect)
```typescript
import React from 'react';

interface TagProps {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
}

export const Tag: React.FC<TagProps> = ({ label, onRemove, disabled }) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2.5 py-1 rounded-md
        text-xs font-medium
        bg-blue-100 text-blue-700
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      {label}
      {onRemove && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};
```

#### Select.types.ts
```typescript
export interface SelectOptionType<T = string | number> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps<T = string | number> {
  label?: string;
  placeholder?: string;
  options: SelectOptionType<T>[];
  value?: T;
  onChange: (value: T) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchable?: boolean;
  grouped?: boolean;
  loading?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface MultiSelectProps<T = string | number> {
  label?: string;
  placeholder?: string;
  options: SelectOptionType<T>[];
  value?: T[];
  onChange: (values: T[]) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchable?: boolean;
  maxSelections?: number;
  showSelectAll?: boolean;
  loading?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}
```

---

## Usage Examples

### Basic Select
```typescript
import { Select } from '@/components/ui/Select';

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
];

function MyForm() {
  const [framework, setFramework] = useState('react');

  return (
    <Select
      label="Framework"
      placeholder="Select a framework"
      options={options}
      value={framework}
      onChange={setFramework}
    />
  );
}
```

### Select with Search
```typescript
<Select
  label="Country"
  placeholder="Select country"
  options={countryOptions}
  value={country}
  onChange={setCountry}
  searchable={true}
  helperText="Start typing to search"
/>
```

### Select with Groups
```typescript
const groupedOptions = [
  { value: 'js', label: 'JavaScript', group: 'Frontend' },
  { value: 'ts', label: 'TypeScript', group: 'Frontend' },
  { value: 'py', label: 'Python', group: 'Backend' },
  { value: 'go', label: 'Go', group: 'Backend' },
];

<Select
  label="Programming Language"
  options={groupedOptions}
  value={language}
  onChange={setLanguage}
  grouped={true}
/>
```

### Select with Icons
```typescript
const options = [
  {
    value: 'github',
    label: 'GitHub',
    icon: <GithubIcon />,
  },
  {
    value: 'gitlab',
    label: 'GitLab',
    icon: <GitlabIcon />,
  },
];
```

### MultiSelect Basic
```typescript
import { MultiSelect } from '@/components/ui/Select';

<MultiSelect
  label="Skills"
  placeholder="Select your skills"
  options={skillOptions}
  value={selectedSkills}
  onChange={setSelectedSkills}
/>
```

### MultiSelect with Limit
```typescript
<MultiSelect
  label="Top 3 Technologies"
  options={techOptions}
  value={technologies}
  onChange={setTechnologies}
  maxSelections={3}
  helperText="Select up to 3 technologies"
/>
```

### React Hook Form Integration
```typescript
import { useForm, Controller } from 'react-hook-form';

const { control, handleSubmit } = useForm();

<Controller
  name="framework"
  control={control}
  rules={{ required: 'Please select a framework' }}
  render={({ field, fieldState }) => (
    <Select
      label="Framework"
      options={frameworkOptions}
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
      required
    />
  )}
/>
```

### Async Loading
```typescript
const [options, setOptions] = useState([]);
const [loading, setLoading] = useState(false);

const handleSearch = async (searchTerm: string) => {
  setLoading(true);
  const results = await fetchOptions(searchTerm);
  setOptions(results);
  setLoading(false);
};

<Select
  label="City"
  options={options}
  value={city}
  onChange={setCity}
  onSearchChange={handleSearch}
  searchable={true}
  loading={loading}
/>
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-aria-components` v1.5 - Accessibility and keyboard navigation
- `react-hook-form` - Form integration
- `@hookform/resolvers` - Validation integration
- `tailwindcss` v4 - Styling

### Additional Components
- `Tag` component - For MultiSelect chips
- `SearchField` component - For search functionality

---

## Acceptance Criteria

### Select Component
- [ ] Tek seçim (single select) çalışıyor
- [ ] Placeholder gösteriliyor
- [ ] Seçilen değer görünüyor
- [ ] Dropdown açılıp kapanıyor
- [ ] Arama/filtreleme çalışıyor (searchable=true)
- [ ] Gruplandırılmış seçenekler gösteriliyor
- [ ] Disabled seçenekler tıklanamıyor
- [ ] Loading state spinner gösteriyor
- [ ] Error state kırmızı border gösteriyor
- [ ] Helper text gösteriliyor
- [ ] Klavye navigasyonu çalışıyor (Arrow keys, Enter, Escape)
- [ ] React Hook Form ile entegre
- [ ] Tailwind CSS 4 ile stillendirilmiş

### MultiSelect Component
- [ ] Çoklu seçim çalışıyor
- [ ] Seçili öğeler chip/tag olarak görünüyor
- [ ] Chip'ler kaldırılabiliyor (× butonu)
- [ ] "Select All" butonu çalışıyor
- [ ] "Clear All" butonu çalışıyor
- [ ] Maksimum seçim limiti çalışıyor
- [ ] Arama/filtreleme çalışıyor
- [ ] Seçili öğe sayısı gösteriliyor
- [ ] Loading ve error state çalışıyor
- [ ] Klavye navigasyonu çalışıyor
- [ ] React Hook Form ile entegre

### Erişilebilirlik (Accessibility)
- [ ] ARIA labels ve roles doğru
- [ ] Keyboard navigation tam destek
- [ ] Screen reader uyumlu
- [ ] Focus states görünür
- [ ] Tab order mantıklı

---

## Testing Checklist

### Manual Testing
- [ ] Dropdown aç/kapat
- [ ] Seçenek seç → değer değişiyor
- [ ] Arama yap → filtreleme çalışıyor
- [ ] Disabled seçenek → tıklanamıyor
- [ ] Loading state → spinner görünüyor
- [ ] Error state → kırmızı border
- [ ] MultiSelect → çoklu seçim
- [ ] Chip kaldır → seçim kaldırılıyor
- [ ] Select All → tümü seçiliyor
- [ ] Clear All → tümü kaldırılıyor
- [ ] Max limit → fazla seçilemiyor
- [ ] Keyboard navigation → Arrow keys çalışıyor
- [ ] Enter → seçenek seçiliyor
- [ ] Escape → dropdown kapanıyor
- [ ] React Hook Form → validation çalışıyor

---

## Code Examples

### Complete Form Example
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, MultiSelect } from '@/components/ui/Select';

const formSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  experience: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const UserProfileForm = () => {
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: '',
      skills: [],
      experience: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Single Select */}
      <Controller
        name="country"
        control={control}
        render={({ field, fieldState }) => (
          <Select
            label="Country"
            placeholder="Select your country"
            options={countryOptions}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            searchable
            required
          />
        )}
      />

      {/* Multi Select */}
      <Controller
        name="skills"
        control={control}
        render={({ field, fieldState }) => (
          <MultiSelect
            label="Skills"
            placeholder="Select your skills"
            options={skillOptions}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            maxSelections={5}
            required
          />
        )}
      />

      {/* Select with Groups */}
      <Controller
        name="experience"
        control={control}
        render={({ field }) => (
          <Select
            label="Experience Level"
            options={experienceOptions}
            value={field.value}
            onChange={field.onChange}
            grouped
          />
        )}
      />

      <button type="submit" className="btn-primary">
        Submit
      </button>
    </form>
  );
};
```

---

## Resources

### React Aria Documentation
- [Select](https://react-spectrum.adobe.com/react-aria/Select.html) - React Aria Select docs
- [ListBox](https://react-spectrum.adobe.com/react-aria/ListBox.html) - ListBox component
- [SearchField](https://react-spectrum.adobe.com/react-aria/SearchField.html) - Search field

### Tailwind CSS
- [Form Elements](https://tailwindcss.com/docs/forms) - Tailwind forms
- [Tailwind CSS 4](https://tailwindcss.com/docs) - Latest docs

### Design References
- [Radix UI Select](https://www.radix-ui.com/primitives/docs/components/select) - Design inspiration
- [Headless UI Listbox](https://headlessui.com/react/listbox) - Alternative implementation

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Select Component task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/09-ui-components/05-select-component.md

Requirements:
1. Create src/components/ui/Select/Select.tsx - Single select component with React Aria
2. Create src/components/ui/Select/MultiSelect.tsx - Multi-select component with chips/tags
3. Create src/components/ui/Select/SelectOption.tsx - Option component with icon and description support
4. Create src/components/ui/Select/SelectGroup.tsx - Group component for grouped options
5. Create src/components/ui/Select/SelectSearch.tsx - Search input component for filtering
6. Create src/components/ui/Select/Select.types.ts - TypeScript type definitions
7. Create src/components/ui/Select/index.ts - Barrel exports
8. Create src/components/ui/Tag/Tag.tsx - Chip/Tag component for multi-select

CRITICAL REQUIREMENTS:
- Use React Aria Components 1.5 for accessibility and keyboard navigation
- Support single select and multi-select variants
- Include search/filter functionality (optional)
- Support grouped options
- Support custom option rendering (icon, description)
- Handle disabled options
- Show loading state with spinner
- Show error state with red border
- Integrate with React Hook Form (Controller)
- Full keyboard navigation (Arrow keys, Enter, Escape, Tab)
- Style with Tailwind CSS 4
- MultiSelect: Show selected items as removable chips
- MultiSelect: Add "Select All" and "Clear All" buttons
- MultiSelect: Support max selection limit
- Responsive design (mobile-friendly)

Follow the exact code examples and component structure provided in the task file.
Test all states: idle, open, focused, loading, error, disabled.
Ensure full keyboard accessibility and screen reader support.
```

---

**Status:** 🟡 Pending
**Next Task:** 06-textarea-component.md
