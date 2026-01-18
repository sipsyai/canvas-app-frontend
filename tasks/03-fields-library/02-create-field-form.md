# Task: Create Field Form

**Priority:** 🟡 Medium
**Estimated Time:** 2 gün
**Dependencies:** 01-field-list-page, 09-ui-components

---

## Objective

Kullanıcıların yeni custom field oluşturabilmesi için field oluşturma formu geliştirmek. 12 farklı field tipini destekleyen, dinamik konfigürasyon alanlarına sahip bir form.

---

## Backend API

### Endpoint
```
POST /api/fields
```

### Request Format
**Content-Type:** `application/json`

```typescript
interface CreateFieldRequest {
  name: string;              // Field adı (snake_case)
  label: string;             // Görünen ad
  type: string;              // Field tipi (text, email, phone vb.)
  description?: string;      // Açıklama (opsiyonel)
  category?: string;         // Kategori (opsiyonel)
  config?: Record<string, any>; // Dinamik konfigürasyon
}
```

### Response
```json
{
  "id": "fld_a1b2c3d4",
  "name": "email",
  "label": "Email Address",
  "type": "email",
  "description": "Contact email address",
  "category": "Contact Info",
  "is_global": false,
  "is_system_field": false,
  "is_custom": true,
  "config": {
    "validation": {
      "required": true,
      "regex": "^[^@]+@[^@]+\\.[^@]+$"
    },
    "placeholder": "user@example.com"
  },
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

**Response Fields:**
- `id` - Otomatik oluşturulan field ID (fld_xxxxxxxx)
- Backend tarafından auto-generate edilir
- Kullanıcı ID girişi yapmaz

### Error Responses
- `401 Unauthorized` - JWT token eksik veya geçersiz
- `422 Unprocessable Entity` - Validation hatası

**Backend Documentation:**
→ [POST /api/fields](../../backend-docs/api/02-fields/01-create-field.md)

---

## UI/UX Design

### Modal Layout
```
┌─────────────────────────────────────────────────┐
│  ✕                Create New Field              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Field Information                              │
│  ┌──────────────────────────────────────────┐  │
│  │ Field Name *                             │  │
│  │ [email_address              ]            │  │
│  │ (snake_case format)                      │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Display Label *                          │  │
│  │ [Email Address              ]            │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Field Type *                             │  │
│  │ [Select type... ▼           ]            │  │
│  │                                          │  │
│  │ 📧 Email - Email address validation      │  │
│  │ 📝 Text - Single line text               │  │
│  │ 📱 Phone - Phone number                  │  │
│  │ 🔢 Number - Numeric values               │  │
│  │ ... (12 options total)                   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Category                                 │  │
│  │ [Contact Info               ]            │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Description                              │  │
│  │ [Detailed description...    ]            │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Field Configuration (Dynamic)                  │
│  ┌──────────────────────────────────────────┐  │
│  │ (Type: Email selected)                   │  │
│  │                                          │  │
│  │ Placeholder                              │  │
│  │ [user@example.com           ]            │  │
│  │                                          │  │
│  │ ☑ Required                               │  │
│  │ ☐ Unique                                 │  │
│  │                                          │  │
│  │ Min Length: [0  ]  Max Length: [255]     │  │
│  │                                          │  │
│  │ Regex Pattern (Advanced)                 │  │
│  │ [^[^@]+@[^@]+\.[^@]+$       ]            │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│          [Cancel]      [Create Field]           │
└─────────────────────────────────────────────────┘
```

### Field Types (12 Total)

| Icon | Type | Description | Config Options |
|------|------|-------------|----------------|
| 📝 | text | Tek satır metin | placeholder, min_length, max_length, pattern |
| 📧 | email | Email adresi | placeholder, required, unique, regex |
| 📱 | phone | Telefon numarası | format, placeholder, required |
| 🔢 | number | Sayı | min, max, step, precision |
| 📅 | date | Tarih | format, min_date, max_date |
| 🕐 | datetime | Tarih + saat | timezone, format |
| 📄 | textarea | Çok satır metin | rows, max_length, placeholder |
| ☑️ | checkbox | Boolean (evet/hayır) | default_value |
| 🔽 | select | Tek seçim dropdown | options[], default |
| ✅ | multiselect | Çoklu seçim | options[], max_selections |
| 🔘 | radio | Radyo buton | options[], default |
| 🔗 | url | Web URL | open_in_new_tab, validate_ssl |

### Dynamic Configuration by Type

#### Text / Email
```typescript
{
  placeholder?: string;
  min_length?: number;
  max_length?: number;
  pattern?: string;        // Regex pattern
  validation?: {
    required?: boolean;
    unique?: boolean;
  }
}
```

#### Number
```typescript
{
  min?: number;
  max?: number;
  step?: number;           // Increment (e.g., 0.01 for decimals)
  precision?: number;      // Decimal places
  validation?: {
    required?: boolean;
  }
}
```

#### Select / Multiselect / Radio
```typescript
{
  options: Array<{
    value: string;
    label: string;
  }>;
  default?: string;        // Default selected value
  max_selections?: number; // For multiselect only
  validation?: {
    required?: boolean;
  }
}
```

#### Textarea
```typescript
{
  rows?: number;           // Default: 5
  max_length?: number;
  placeholder?: string;
  validation?: {
    required?: boolean;
  }
}
```

#### Date / DateTime
```typescript
{
  format?: string;         // "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss"
  min_date?: string;
  max_date?: string;
  timezone?: string;       // For datetime only
  validation?: {
    required?: boolean;
  }
}
```

#### Checkbox
```typescript
{
  default_value?: boolean; // Default: false
  label_on?: string;       // e.g., "Yes"
  label_off?: string;      // e.g., "No"
}
```

#### URL
```typescript
{
  placeholder?: string;
  open_in_new_tab?: boolean;
  validate_ssl?: boolean;
  validation?: {
    required?: boolean;
  }
}
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── fields/
│       ├── pages/
│       │   └── FieldListPage.tsx        (from 01-field-list-page)
│       ├── components/
│       │   ├── CreateFieldModal.tsx     ⭐ Main modal component
│       │   ├── CreateFieldForm.tsx      ⭐ Form component
│       │   ├── FieldTypeSelector.tsx    ⭐ Type selector with icons
│       │   └── config/
│       │       ├── TextFieldConfig.tsx     ⭐ Text/Email config
│       │       ├── NumberFieldConfig.tsx   ⭐ Number config
│       │       ├── SelectFieldConfig.tsx   ⭐ Select/Multi/Radio config
│       │       ├── TextareaFieldConfig.tsx ⭐ Textarea config
│       │       ├── DateFieldConfig.tsx     ⭐ Date/DateTime config
│       │       ├── CheckboxFieldConfig.tsx ⭐ Checkbox config
│       │       └── UrlFieldConfig.tsx      ⭐ URL config
│       ├── hooks/
│       │   └── useCreateField.ts        ⭐ TanStack Query mutation
│       ├── schemas/
│       │   └── fieldSchema.ts           ⭐ Zod validation schemas
│       └── types/
│           └── field.types.ts           ⭐ TypeScript types
├── lib/
│   └── api/
│       └── fields.api.ts                ⭐ API calls
└── components/
    └── ui/
        └── Modal.tsx                     (from 09-ui-components)
```

### Component Implementation

#### CreateFieldModal.tsx
```typescript
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CreateFieldForm } from './CreateFieldForm';
import { Button } from '@/components/ui/Button';

interface CreateFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateFieldModal = ({ isOpen, onClose, onSuccess }: CreateFieldModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Field"
      size="lg"
    >
      <CreateFieldForm
        onSuccess={() => {
          onSuccess?.();
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
};
```

#### CreateFieldForm.tsx
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateField } from '../hooks/useCreateField';
import { createFieldSchema, type CreateFieldFormData } from '../schemas/fieldSchema';
import { FieldTypeSelector } from './FieldTypeSelector';
import { DynamicFieldConfig } from './DynamicFieldConfig';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface CreateFieldFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateFieldForm = ({ onSuccess, onCancel }: CreateFieldFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateFieldFormData>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: {
      config: {},
    },
  });

  const selectedType = watch('type');
  const { mutate: createField, isPending, isError, error } = useCreateField();

  const onSubmit = (data: CreateFieldFormData) => {
    createField(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Field Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Field Information
        </h3>

        {/* Field Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="email_address"
            {...register('name')}
            error={errors.name?.message}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use snake_case format (e.g., email_address, phone_number)
          </p>
        </div>

        {/* Display Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Label <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Email Address"
            {...register('label')}
            error={errors.label?.message}
          />
        </div>

        {/* Field Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Type <span className="text-red-500">*</span>
          </label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FieldTypeSelector
                value={field.value}
                onChange={field.onChange}
                error={errors.type?.message}
              />
            )}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Input
            placeholder="Contact Info"
            {...register('category')}
            error={errors.category?.message}
          />
          <p className="text-xs text-gray-500 mt-1">
            e.g., Contact Info, Business, Personal, System
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            placeholder="Detailed description of this field..."
            rows={3}
            {...register('description')}
            error={errors.description?.message}
          />
        </div>
      </div>

      {/* Dynamic Configuration Section */}
      {selectedType && (
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Field Configuration
          </h3>

          <DynamicFieldConfig
            fieldType={selectedType}
            control={control}
            errors={errors.config}
          />
        </div>
      )}

      {/* Error Display */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error?.message || 'Failed to create field. Please try again.'}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          loading={isPending}
        >
          {isPending ? 'Creating...' : 'Create Field'}
        </Button>
      </div>
    </form>
  );
};
```

#### FieldTypeSelector.tsx
```typescript
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FieldType {
  value: string;
  label: string;
  icon: string;
  description: string;
}

const FIELD_TYPES: FieldType[] = [
  { value: 'text', label: 'Text', icon: '📝', description: 'Single line text' },
  { value: 'email', label: 'Email', icon: '📧', description: 'Email address validation' },
  { value: 'phone', label: 'Phone', icon: '📱', description: 'Phone number' },
  { value: 'number', label: 'Number', icon: '🔢', description: 'Numeric values' },
  { value: 'date', label: 'Date', icon: '📅', description: 'Date picker' },
  { value: 'datetime', label: 'Date & Time', icon: '🕐', description: 'Date and time picker' },
  { value: 'textarea', label: 'Textarea', icon: '📄', description: 'Multi-line text' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️', description: 'Boolean (yes/no)' },
  { value: 'select', label: 'Select', icon: '🔽', description: 'Single choice dropdown' },
  { value: 'multiselect', label: 'Multiselect', icon: '✅', description: 'Multiple choices' },
  { value: 'radio', label: 'Radio', icon: '🔘', description: 'Radio button group' },
  { value: 'url', label: 'URL', icon: '🔗', description: 'Web URL' },
];

interface FieldTypeSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export const FieldTypeSelector = ({ value, onChange, error }: FieldTypeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedType = FIELD_TYPES.find((t) => t.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-2 text-left bg-white border rounded-lg flex items-center justify-between',
          'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
          error ? 'border-red-500' : 'border-gray-300'
        )}
      >
        <span className={selectedType ? 'text-gray-900' : 'text-gray-400'}>
          {selectedType ? (
            <span className="flex items-center gap-2">
              <span>{selectedType.icon}</span>
              <span>{selectedType.label}</span>
              <span className="text-sm text-gray-500">- {selectedType.description}</span>
            </span>
          ) : (
            'Select field type...'
          )}
        </span>
        <ChevronDown className={cn('w-5 h-5 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {FIELD_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  onChange(type.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3',
                  'border-b border-gray-100 last:border-b-0',
                  value === type.value && 'bg-blue-50'
                )}
              >
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-500">{type.description}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};
```

#### DynamicFieldConfig.tsx
```typescript
import { Control, FieldErrors } from 'react-hook-form';
import { CreateFieldFormData } from '../schemas/fieldSchema';
import { TextFieldConfig } from './config/TextFieldConfig';
import { NumberFieldConfig } from './config/NumberFieldConfig';
import { SelectFieldConfig } from './config/SelectFieldConfig';
import { TextareaFieldConfig } from './config/TextareaFieldConfig';
import { DateFieldConfig } from './config/DateFieldConfig';
import { CheckboxFieldConfig } from './config/CheckboxFieldConfig';
import { UrlFieldConfig } from './config/UrlFieldConfig';

interface DynamicFieldConfigProps {
  fieldType: string;
  control: Control<CreateFieldFormData>;
  errors?: FieldErrors;
}

export const DynamicFieldConfig = ({ fieldType, control, errors }: DynamicFieldConfigProps) => {
  switch (fieldType) {
    case 'text':
    case 'email':
    case 'phone':
      return <TextFieldConfig control={control} errors={errors} fieldType={fieldType} />;

    case 'number':
      return <NumberFieldConfig control={control} errors={errors} />;

    case 'select':
    case 'multiselect':
    case 'radio':
      return <SelectFieldConfig control={control} errors={errors} fieldType={fieldType} />;

    case 'textarea':
      return <TextareaFieldConfig control={control} errors={errors} />;

    case 'date':
    case 'datetime':
      return <DateFieldConfig control={control} errors={errors} fieldType={fieldType} />;

    case 'checkbox':
      return <CheckboxFieldConfig control={control} errors={errors} />;

    case 'url':
      return <UrlFieldConfig control={control} errors={errors} />;

    default:
      return null;
  }
};
```

#### config/TextFieldConfig.tsx
```typescript
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { CreateFieldFormData } from '../../schemas/fieldSchema';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

interface TextFieldConfigProps {
  control: Control<CreateFieldFormData>;
  errors?: FieldErrors;
  fieldType: 'text' | 'email' | 'phone';
}

export const TextFieldConfig = ({ control, errors }: TextFieldConfigProps) => {
  return (
    <div className="space-y-4">
      {/* Placeholder */}
      <Controller
        name="config.placeholder"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder
            </label>
            <Input
              placeholder="e.g., user@example.com"
              {...field}
              error={errors?.placeholder?.message as string}
            />
          </div>
        )}
      />

      {/* Validation Options */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Validation
        </label>

        <Controller
          name="config.validation.required"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={field.value}
                onChange={field.onChange}
              />
              <span className="text-sm text-gray-700">Required field</span>
            </div>
          )}
        />

        <Controller
          name="config.validation.unique"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={field.value}
                onChange={field.onChange}
              />
              <span className="text-sm text-gray-700">Must be unique</span>
            </div>
          )}
        />
      </div>

      {/* Min/Max Length */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="config.min_length"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Length
              </label>
              <Input
                type="number"
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </div>
          )}
        />

        <Controller
          name="config.max_length"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Length
              </label>
              <Input
                type="number"
                placeholder="255"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 255)}
              />
            </div>
          )}
        />
      </div>

      {/* Regex Pattern (Advanced) */}
      <Controller
        name="config.pattern"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regex Pattern <span className="text-xs text-gray-500">(Advanced)</span>
            </label>
            <Input
              placeholder="^[A-Za-z0-9]+$"
              {...field}
              error={errors?.pattern?.message as string}
            />
            <p className="text-xs text-gray-500 mt-1">
              Custom validation pattern (leave empty for default validation)
            </p>
          </div>
        )}
      />
    </div>
  );
};
```

#### config/SelectFieldConfig.tsx
```typescript
import { useState } from 'react';
import { Control, Controller, FieldErrors, useFieldArray } from 'react-hook-form';
import { CreateFieldFormData } from '../../schemas/fieldSchema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Trash2, Plus } from 'lucide-react';

interface SelectFieldConfigProps {
  control: Control<CreateFieldFormData>;
  errors?: FieldErrors;
  fieldType: 'select' | 'multiselect' | 'radio';
}

export const SelectFieldConfig = ({ control, errors, fieldType }: SelectFieldConfigProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'config.options',
  });

  return (
    <div className="space-y-4">
      {/* Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options <span className="text-red-500">*</span>
        </label>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Controller
                name={`config.options.${index}.value`}
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder="value"
                    {...field}
                    className="flex-1"
                  />
                )}
              />
              <Controller
                name={`config.options.${index}.label`}
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder="Label"
                    {...field}
                    className="flex-1"
                  />
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ value: '', label: '' })}
          className="mt-2"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Option
        </Button>
      </div>

      {/* Max Selections (Multiselect only) */}
      {fieldType === 'multiselect' && (
        <Controller
          name="config.max_selections"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Selections
              </label>
              <Input
                type="number"
                placeholder="Unlimited"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for unlimited selections
              </p>
            </div>
          )}
        />
      )}

      {/* Validation */}
      <Controller
        name="config.validation.required"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={field.value}
              onChange={field.onChange}
            />
            <span className="text-sm text-gray-700">Required field</span>
          </div>
        )}
      />
    </div>
  );
};
```

#### fieldSchema.ts
```typescript
import { z } from 'zod';

// Base validation config
const baseValidationSchema = z.object({
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
}).optional();

// Text field config
const textConfigSchema = z.object({
  placeholder: z.string().optional(),
  min_length: z.number().min(0).optional(),
  max_length: z.number().min(1).optional(),
  pattern: z.string().optional(),
  validation: baseValidationSchema,
}).optional();

// Number field config
const numberConfigSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
  precision: z.number().min(0).max(10).optional(),
  validation: baseValidationSchema,
}).optional();

// Select field config
const selectConfigSchema = z.object({
  options: z.array(
    z.object({
      value: z.string().min(1, 'Option value is required'),
      label: z.string().min(1, 'Option label is required'),
    })
  ).min(1, 'At least one option is required'),
  default: z.string().optional(),
  max_selections: z.number().positive().optional(),
  validation: baseValidationSchema,
}).optional();

// Textarea field config
const textareaConfigSchema = z.object({
  rows: z.number().min(1).max(20).optional(),
  max_length: z.number().min(1).optional(),
  placeholder: z.string().optional(),
  validation: baseValidationSchema,
}).optional();

// Date field config
const dateConfigSchema = z.object({
  format: z.string().optional(),
  min_date: z.string().optional(),
  max_date: z.string().optional(),
  timezone: z.string().optional(),
  validation: baseValidationSchema,
}).optional();

// Checkbox field config
const checkboxConfigSchema = z.object({
  default_value: z.boolean().optional(),
  label_on: z.string().optional(),
  label_off: z.string().optional(),
}).optional();

// URL field config
const urlConfigSchema = z.object({
  placeholder: z.string().optional(),
  open_in_new_tab: z.boolean().optional(),
  validate_ssl: z.boolean().optional(),
  validation: baseValidationSchema,
}).optional();

// Main form schema
export const createFieldSchema = z.object({
  name: z
    .string()
    .min(1, 'Field name is required')
    .max(255, 'Field name must be less than 255 characters')
    .regex(/^[a-z0-9_]+$/, 'Use snake_case format (lowercase, numbers, underscores only)'),

  label: z
    .string()
    .min(1, 'Display label is required')
    .max(255, 'Display label must be less than 255 characters'),

  type: z.enum([
    'text',
    'email',
    'phone',
    'number',
    'date',
    'datetime',
    'textarea',
    'checkbox',
    'select',
    'multiselect',
    'radio',
    'url',
  ], {
    errorMap: () => ({ message: 'Please select a field type' }),
  }),

  description: z.string().max(1000).optional(),

  category: z.string().max(100).optional(),

  config: z.union([
    textConfigSchema,
    numberConfigSchema,
    selectConfigSchema,
    textareaConfigSchema,
    dateConfigSchema,
    checkboxConfigSchema,
    urlConfigSchema,
  ]).optional(),
});

export type CreateFieldFormData = z.infer<typeof createFieldSchema>;
```

#### useCreateField.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFieldAPI } from '@/lib/api/fields.api';
import { CreateFieldFormData } from '../schemas/fieldSchema';

export const useCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFieldFormData) => {
      const response = await createFieldAPI(data);
      return response;
    },
    onSuccess: () => {
      // Invalidate fields list to refetch
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
    onError: (error: any) => {
      console.error('Failed to create field:', error);
    },
  });
};
```

#### fields.api.ts
```typescript
import axios from 'axios';
import { getAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface CreateFieldRequest {
  name: string;
  label: string;
  type: string;
  description?: string;
  category?: string;
  config?: Record<string, any>;
}

export interface FieldResponse {
  id: string;
  name: string;
  label: string;
  type: string;
  description: string | null;
  category: string | null;
  is_global: boolean;
  is_system_field: boolean;
  is_custom: boolean;
  config: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const createFieldAPI = async (data: CreateFieldRequest): Promise<FieldResponse> => {
  const token = getAuthToken();

  const { data: response } = await axios.post<FieldResponse>(
    `${API_BASE_URL}/api/fields`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  return response;
};

export const listFieldsAPI = async (): Promise<FieldResponse[]> => {
  const token = getAuthToken();

  const { data } = await axios.get<FieldResponse[]>(
    `${API_BASE_URL}/api/fields`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  return data;
};
```

#### field.types.ts
```typescript
export interface Field {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  category?: string;
  is_global: boolean;
  is_system_field: boolean;
  is_custom: boolean;
  config: FieldConfig;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'datetime'
  | 'textarea'
  | 'checkbox'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'url';

export interface FieldConfig {
  placeholder?: string;
  min_length?: number;
  max_length?: number;
  pattern?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
  default?: string;
  max_selections?: number;
  default_value?: boolean;
  label_on?: string;
  label_off?: string;
  format?: string;
  min_date?: string;
  max_date?: string;
  timezone?: string;
  open_in_new_tab?: boolean;
  validate_ssl?: boolean;
  validation?: {
    required?: boolean;
    unique?: boolean;
  };
}

export interface CreateFieldData {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  category?: string;
  config?: FieldConfig;
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@tanstack/react-query` - API state management
- `axios` - HTTP client
- `lucide-react` - Icons

### UI Components (Required from 09-ui-components)
- `Modal` component (React Aria)
- `Button` component (React Aria)
- `Input` component (React Aria)
- `Textarea` component (React Aria)
- `Checkbox` component (React Aria)

---

## Acceptance Criteria

- [ ] Create Field modal açılıyor ve kapanıyor
- [ ] Tüm 12 field tipi seçilebiliyor (icon + açıklama ile)
- [ ] Field name snake_case validation çalışıyor
- [ ] Field type seçimi zorunlu
- [ ] Dinamik config alanları field type'a göre değişiyor
- [ ] Text/Email: placeholder, min/max length, pattern, required, unique
- [ ] Number: min, max, step, precision, required
- [ ] Select/Multiselect/Radio: options array (add/remove), max_selections
- [ ] Textarea: rows, max_length, placeholder, required
- [ ] Date/DateTime: format, min/max date, timezone
- [ ] Checkbox: default value, label on/off
- [ ] URL: placeholder, open in new tab, validate SSL, required
- [ ] Options array'de en az 1 option zorunlu (select/multiselect/radio)
- [ ] Form validation çalışıyor (Zod)
- [ ] Başarılı create sonrası field list yenileniyor
- [ ] Başarılı create sonrası modal kapanıyor
- [ ] Error mesajları gösteriliyor (401, 422)
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Boş form submit → validation errors
- [ ] Field name büyük harf ile → snake_case error
- [ ] Field type seçilmeden submit → error
- [ ] Text field: config alanları çalışıyor
- [ ] Number field: min/max/step validation
- [ ] Select field: options ekle/sil çalışıyor
- [ ] Select field: options boş → error
- [ ] Textarea field: rows ayarlanabiliyor
- [ ] Date field: format, timezone ayarları
- [ ] Checkbox field: default value çalışıyor
- [ ] URL field: validation options çalışıyor
- [ ] Multiselect: max_selections ayarlanabiliyor
- [ ] Doğru data ile submit → success
- [ ] Backend'den gelen field ID (fld_xxx) kontrol edilir
- [ ] Create sonrası field list refresh oluyor
- [ ] Network error → error mesajı
- [ ] 401 error → authentication error mesajı
- [ ] 422 error → validation error mesajı
- [ ] Modal overlay click ile kapanıyor
- [ ] Cancel button çalışıyor

### Field Type Specific Tests
**Text/Email/Phone:**
- [ ] Placeholder gösteriliyor
- [ ] Min/Max length çalışıyor
- [ ] Regex pattern validation
- [ ] Required checkbox çalışıyor
- [ ] Unique checkbox çalışıyor

**Number:**
- [ ] Min/Max değer kontrolü
- [ ] Step artışı çalışıyor
- [ ] Precision (decimal places) çalışıyor

**Select/Multiselect/Radio:**
- [ ] Option ekle/çıkar çalışıyor
- [ ] En az 1 option zorunlu
- [ ] Value/Label alanları dolu olmalı
- [ ] Multiselect max_selections çalışıyor

**Textarea:**
- [ ] Rows sayısı ayarlanabiliyor
- [ ] Max length çalışıyor
- [ ] Placeholder gösteriliyor

**Date/DateTime:**
- [ ] Format seçilebiliyor
- [ ] Min/Max date ayarlanabiliyor
- [ ] Timezone (datetime için) çalışıyor

**Checkbox:**
- [ ] Default value true/false
- [ ] Label on/off özelleştirilebilir

**URL:**
- [ ] Placeholder gösteriliyor
- [ ] Open in new tab checkbox
- [ ] Validate SSL checkbox
- [ ] Required checkbox

---

## Code Examples

### Complete Form Flow
```typescript
// 1. User clicks "Create Field" button
// 2. Modal opens with CreateFieldForm
// 3. User fills basic info (name, label, type, category, description)
// 4. User selects field type (e.g., "email")
// 5. Dynamic config fields appear (placeholder, required, min/max length)
// 6. User fills config options
// 7. User clicks "Create Field"
// 8. Form validation (Zod)
// 9. API call with JWT token
// 10. Backend creates field with auto-generated ID (fld_xxx)
// 11. Success → modal closes, field list refreshes
// 12. Error → error message shown, modal stays open
```

### Error Handling
```typescript
// API Client (fields.api.ts)
export const createFieldAPI = async (data: CreateFieldRequest) => {
  try {
    const token = getAuthToken();

    const { data: response } = await axios.post(
      `${API_BASE_URL}/api/fields`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (error.response?.status === 422) {
      const detail = error.response.data.detail;
      if (Array.isArray(detail)) {
        throw new Error(detail.map(e => e.msg).join(', '));
      }
      throw new Error('Invalid field data. Please check your input.');
    }
    throw new Error('Failed to create field. Please try again.');
  }
};
```

### Dynamic Config Example
```typescript
// When user selects "email" type
{
  name: "customer_email",
  label: "Customer Email",
  type: "email",
  category: "Contact Info",
  description: "Primary contact email",
  config: {
    placeholder: "customer@example.com",
    min_length: 5,
    max_length: 255,
    pattern: "^[^@]+@[^@]+\\.[^@]+$",
    validation: {
      required: true,
      unique: true
    }
  }
}

// When user selects "select" type
{
  name: "priority_level",
  label: "Priority Level",
  type: "select",
  category: "Business",
  description: "Task priority level",
  config: {
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" }
    ],
    default: "medium",
    validation: {
      required: true
    }
  }
}

// When user selects "number" type
{
  name: "product_price",
  label: "Product Price",
  type: "number",
  category: "Business",
  description: "Product selling price",
  config: {
    min: 0,
    max: 999999,
    step: 0.01,
    precision: 2,
    validation: {
      required: true
    }
  }
}
```

---

## Resources

### Backend Documentation
- [POST /api/fields](../../backend-docs/api/02-fields/01-create-field.md) - Detailed endpoint documentation
- [Fields Overview](../../backend-docs/api/02-fields/README.md) - Fields system overview
- [Frontend Developer Guide](../../backend-docs/api/00-FRONTEND-GUIDE.md) - Complete frontend guide

### Frontend Libraries
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Lucide Icons](https://lucide.dev/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Create Field Form task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/03-fields-library/02-create-field-form.md

Requirements:
1. Create src/features/fields/components/CreateFieldModal.tsx - Modal wrapper component
2. Create src/features/fields/components/CreateFieldForm.tsx - Main form with React Hook Form + Zod
3. Create src/features/fields/components/FieldTypeSelector.tsx - Custom dropdown with 12 field types (icons + descriptions)
4. Create src/features/fields/components/DynamicFieldConfig.tsx - Router for type-specific config components
5. Create src/features/fields/components/config/TextFieldConfig.tsx - Text/Email/Phone config (placeholder, min/max length, pattern, required, unique)
6. Create src/features/fields/components/config/NumberFieldConfig.tsx - Number config (min, max, step, precision, required)
7. Create src/features/fields/components/config/SelectFieldConfig.tsx - Select/Multiselect/Radio config (options array, max_selections)
8. Create src/features/fields/components/config/TextareaFieldConfig.tsx - Textarea config (rows, max_length, placeholder, required)
9. Create src/features/fields/components/config/DateFieldConfig.tsx - Date/DateTime config (format, min/max date, timezone)
10. Create src/features/fields/components/config/CheckboxFieldConfig.tsx - Checkbox config (default value, labels)
11. Create src/features/fields/components/config/UrlFieldConfig.tsx - URL config (placeholder, open in new tab, validate SSL, required)
12. Create src/features/fields/schemas/fieldSchema.ts - Zod validation schema for all field types
13. Create src/features/fields/hooks/useCreateField.ts - TanStack Query mutation hook
14. Create src/lib/api/fields.api.ts - API functions (createFieldAPI, listFieldsAPI)
15. Update src/features/fields/types/field.types.ts - TypeScript type definitions

CRITICAL REQUIREMENTS:
- Support 12 field types: text, email, phone, number, date, datetime, textarea, checkbox, select, multiselect, radio, url
- Field name must be snake_case (validated with Zod)
- Dynamic configuration changes based on selected field type
- Options array for select/multiselect/radio (minimum 1 option required)
- JWT token required in Authorization header
- Backend auto-generates field ID (fld_xxxxxxxx)
- Handle 401 (auth error) and 422 (validation error)
- Invalidate 'fields' query after successful creation
- Modal closes on success
- Mobile responsive with Tailwind CSS 4
- Icons from lucide-react

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 03-edit-field-form.md
