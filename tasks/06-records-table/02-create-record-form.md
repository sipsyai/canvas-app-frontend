# Task: Create Record Form

**Priority:** 🟡 Medium
**Estimated Time:** 2.5 gün
**Dependencies:** 01-records-table-view

---

## Objective

Dinamik form generation ile record oluşturma formu geliştirmek. Form field'ları object-fields tanımlarına göre runtime'da oluşturulur ve 12 farklı field type'ı desteklenir.

---

## Backend API

### Endpoint
```
POST /api/records
```

### Request Format
**Content-Type:** `application/json`

```typescript
interface RecordCreateRequest {
  object_id: string;     // örn: "obj_contact"
  data: {                // JSONB - Field ID'leri key olarak
    fld_name: "Ali Yılmaz",
    fld_email: "ali@example.com",
    fld_phone: "+90 555 1234567",
    fld_company: "Acme Corp"
  }
}
```

**CRITICAL:**
- Data object'inde key'ler field NAME değil FIELD ID olmalı!
- ✅ `"fld_a1b2c3d4": "Ali Yılmaz"` (Doğru)
- ❌ `"name": "Ali Yılmaz"` (Yanlış)

### Response
```json
{
  "id": "rec_a1b2c3d4",
  "object_id": "obj_contact",
  "data": {
    "fld_name": "Ali Yılmaz",
    "fld_email": "ali@example.com",
    "fld_phone": "+90 555 1234567",
    "fld_company": "Acme Corp"
  },
  "primary_value": "Ali Yılmaz",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "updated_by": "550e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

**Response Fields:**
- `id` - Auto-generated record ID (rec_xxxxxxxx)
- `data` - JSONB field values
- `primary_value` - Backend otomatik hesaplar (ilk text field)
- `created_at`, `updated_at` - Timestamps
- `created_by`, `updated_by` - User UUID

### Error Responses
- `400 Bad Request` - Invalid data format
- `404 Not Found` - Object bulunamadı
- `422 Unprocessable Entity` - Validation hatası

**Backend Documentation:**
→ [POST /api/records](../../backend-docs/api/04-records/01-create-record.md)

---

## Dynamic Form Generation

### Field Types (12 Types)

Form field component'leri object-field type'ına göre seçilir:

| Field Type | Component | Açıklama |
|------------|-----------|----------|
| **text** | `<Input type="text" />` | Tek satır metin |
| **email** | `<Input type="email" />` | Email validation |
| **phone** | `<Input type="tel" />` | Telefon formatı |
| **url** | `<Input type="url" />` | URL validation |
| **number** | `<Input type="number" step />` | Sayı (min/max/step) |
| **textarea** | `<Textarea rows={4} />` | Çok satır metin |
| **date** | `<DatePicker mode="single" />` | Tarih seçici |
| **datetime** | `<DatePicker showTime />` | Tarih + saat |
| **checkbox** | `<Checkbox />` | Boolean (true/false) |
| **select** | `<Select options={...} />` | Dropdown (single) |
| **multiselect** | `<MultiSelect options={...} />` | Çoklu seçim |
| **radio** | `<RadioGroup options={...} />` | Radio buttons |

### Validation Rules

Object-field validation kuralları Zod schema'ya dönüştürülür:

```typescript
// Object-field validation rules
{
  "is_required": true,
  "is_unique": true,
  "field_overrides": {
    "validation": {
      "minLength": 3,
      "maxLength": 255,
      "regex": "^[A-Za-z ]+$",
      "min": 0,
      "max": 100
    }
  }
}

// ↓ Converts to Zod schema

z.string()
  .min(3, "En az 3 karakter gerekli")
  .max(255, "En fazla 255 karakter")
  .regex(/^[A-Za-z ]+$/, "Sadece harf ve boşluk")
```

### Default Values

Object-field'dan gelen default value form'da kullanılır:

```typescript
{
  "field_id": "fld_status",
  "field_overrides": {
    "default_value": "active"
  }
}

// ↓ Form default values

{
  fld_status: "active"  // Pre-filled
}
```

---

## UI/UX Design

### Form Layout
```
┌──────────────────────────────────────────┐
│  Create New Contact                      │
│  ────────────────────────────────────    │
│                                          │
│  Name *                                  │
│  [Ali Yılmaz                      ]     │
│                                          │
│  Email *                                 │
│  [ali@example.com                 ]     │
│                                          │
│  Phone                                   │
│  [+90 555 1234567                 ]     │
│                                          │
│  Company                                 │
│  [Acme Corp                       ]     │
│                                          │
│  Status                                  │
│  [Active ▼]                              │
│                                          │
│  Notes                                   │
│  [─────────────────────────────── ]     │
│  [                                ]     │
│  [                                ]     │
│                                          │
│  Created Date                            │
│  [ 2026-01-18        📅 ]               │
│                                          │
│  Active                                  │
│  [✓] Is Active                          │
│                                          │
│  ────────────────────────────────────    │
│                                          │
│  [Cancel]              [Create Record]  │
└──────────────────────────────────────────┘
```

### Field States
- **Empty** - Placeholder gösterilir
- **Filled** - Değer girilmiş
- **Error** - Validation hatası (kırmızı border + error message)
- **Disabled** - Readonly field (gri background)
- **Loading** - Form submit ediliyor (spinner)

### Validation Display
```typescript
// Field-level validation (onChange)
<Input
  error="Email formatı geçersiz"
  errorClassName="text-red-600 text-sm mt-1"
/>

// Form-level validation (onSubmit)
<div className="bg-red-50 border border-red-200 px-4 py-3 rounded">
  <ul className="list-disc list-inside">
    <li>Name is required</li>
    <li>Email must be valid</li>
  </ul>
</div>
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── records/
│       ├── components/
│       │   ├── CreateRecordForm.tsx        ⭐ Main form component
│       │   ├── DynamicFormField.tsx        ⭐ Field type router
│       │   └── RecordFormModal.tsx         ⭐ Modal wrapper
│       ├── hooks/
│       │   ├── useCreateRecord.ts          ⭐ Create mutation
│       │   ├── useDynamicForm.ts           ⭐ Dynamic form logic
│       │   └── useObjectFields.ts          ⭐ Fetch object-fields
│       ├── utils/
│       │   ├── generateZodSchema.ts        ⭐ Validation schema generator
│       │   └── mapFieldTypeToComponent.ts  ⭐ Component mapping
│       └── types/
│           └── record.types.ts             ⭐ TypeScript types
├── lib/
│   └── api/
│       └── records.api.ts                  ⭐ API calls
└── components/
    └── ui/
        ├── DatePicker.tsx                  ⭐ Date/datetime input
        ├── MultiSelect.tsx                 ⭐ Multi-select dropdown
        └── RadioGroup.tsx                  ⭐ Radio button group
```

### Component Implementation

#### CreateRecordForm.tsx
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDynamicForm } from '../hooks/useDynamicForm';
import { useCreateRecord } from '../hooks/useCreateRecord';
import { DynamicFormField } from './DynamicFormField';
import { Button } from '@/components/ui/Button';

interface CreateRecordFormProps {
  objectId: string;
  onSuccess?: (record: Record) => void;
  onCancel?: () => void;
}

export const CreateRecordForm = ({ objectId, onSuccess, onCancel }: CreateRecordFormProps) => {
  const {
    schema,
    defaultValues,
    fields,
    isLoading: isLoadingFields
  } = useDynamicForm(objectId);

  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { mutate: createRecord, isPending } = useCreateRecord();

  const onSubmit = (formData: any) => {
    // Transform form data to API format
    const recordData = {
      object_id: objectId,
      data: formData, // Field IDs already as keys
    };

    createRecord(recordData, {
      onSuccess: (data) => {
        onSuccess?.(data);
      },
    });
  };

  if (isLoadingFields) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field) => (
          <DynamicFormField
            key={field.field_id}
            field={field}
            register={register}
            control={control}
            setValue={setValue}
            watch={watch}
            error={errors[field.field_id]?.message as string}
          />
        ))}
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Lütfen aşağıdaki hataları düzeltin:</p>
          <ul className="list-disc list-inside mt-2">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error.message as string}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t">
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
          {isPending ? 'Creating...' : 'Create Record'}
        </Button>
      </div>
    </form>
  );
};
```

#### DynamicFormField.tsx
```typescript
import { Control, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { DatePicker } from '@/components/ui/DatePicker';
import type { ObjectField } from '../types/record.types';

interface DynamicFormFieldProps {
  field: ObjectField;
  register: UseFormRegister<any>;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  error?: string;
}

export const DynamicFormField = ({
  field,
  register,
  control,
  setValue,
  watch,
  error
}: DynamicFormFieldProps) => {
  const fieldId = field.field_id;
  const fieldType = field.field.type;
  const label = field.field.label;
  const isRequired = field.is_required;
  const isReadonly = field.is_readonly;
  const validation = field.field_overrides?.validation || {};
  const options = field.field_overrides?.options || [];

  // Field label with required indicator
  const fieldLabel = (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  // Text-like inputs
  if (['text', 'email', 'phone', 'url'].includes(fieldType)) {
    return (
      <div>
        {fieldLabel}
        <Input
          type={fieldType}
          placeholder={field.field_overrides?.placeholder || `Enter ${label.toLowerCase()}...`}
          {...register(fieldId)}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  // Number input
  if (fieldType === 'number') {
    return (
      <div>
        {fieldLabel}
        <Input
          type="number"
          step={validation.precision || 1}
          min={validation.min}
          max={validation.max}
          {...register(fieldId, { valueAsNumber: true })}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  // Textarea
  if (fieldType === 'textarea') {
    return (
      <div>
        {fieldLabel}
        <Textarea
          rows={4}
          placeholder={field.field_overrides?.placeholder || `Enter ${label.toLowerCase()}...`}
          {...register(fieldId)}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  // Date picker
  if (fieldType === 'date' || fieldType === 'datetime') {
    return (
      <div>
        {fieldLabel}
        <DatePicker
          mode="single"
          showTime={fieldType === 'datetime'}
          value={watch(fieldId)}
          onChange={(date) => setValue(fieldId, date)}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  // Checkbox
  if (fieldType === 'checkbox') {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          {...register(fieldId)}
          disabled={isReadonly}
        />
        <label className="text-sm text-gray-700">{label}</label>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    );
  }

  // Select dropdown
  if (fieldType === 'select') {
    return (
      <div>
        {fieldLabel}
        <Select
          options={options}
          value={watch(fieldId)}
          onChange={(value) => setValue(fieldId, value)}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  // Multi-select
  if (fieldType === 'multiselect') {
    return (
      <div>
        {fieldLabel}
        <MultiSelect
          options={options}
          value={watch(fieldId) || []}
          onChange={(values) => setValue(fieldId, values)}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  // Radio group
  if (fieldType === 'radio') {
    return (
      <div>
        {fieldLabel}
        <RadioGroup
          options={options}
          value={watch(fieldId)}
          onChange={(value) => setValue(fieldId, value)}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  // Fallback for unsupported types
  return (
    <div>
      {fieldLabel}
      <div className="text-sm text-gray-500">
        Field type "{fieldType}" is not yet supported
      </div>
    </div>
  );
};
```

#### useDynamicForm.ts
```typescript
import { useMemo } from 'react';
import { z } from 'zod';
import { useObjectFields } from './useObjectFields';
import { generateZodSchema } from '../utils/generateZodSchema';

export const useDynamicForm = (objectId: string) => {
  const { data: objectFields, isLoading } = useObjectFields(objectId);

  // Sort fields by display_order
  const sortedFields = useMemo(() => {
    if (!objectFields) return [];
    return [...objectFields]
      .filter((f) => f.is_visible)
      .sort((a, b) => a.display_order - b.display_order);
  }, [objectFields]);

  // Generate Zod schema dynamically
  const schema = useMemo(() => {
    if (!sortedFields.length) return z.object({});

    const schemaFields: Record<string, z.ZodTypeAny> = {};

    sortedFields.forEach((field) => {
      const fieldId = field.field_id;
      const fieldType = field.field.type;
      const validation = field.field_overrides?.validation || {};
      const isRequired = field.is_required;

      schemaFields[fieldId] = generateZodSchema(
        fieldType,
        validation,
        isRequired,
        field.field.label
      );
    });

    return z.object(schemaFields);
  }, [sortedFields]);

  // Generate default values
  const defaultValues = useMemo(() => {
    if (!sortedFields.length) return {};

    const defaults: Record<string, any> = {};

    sortedFields.forEach((field) => {
      const fieldId = field.field_id;
      const defaultValue = field.field_overrides?.default_value;

      if (defaultValue !== undefined && defaultValue !== null) {
        defaults[fieldId] = defaultValue;
      }
    });

    return defaults;
  }, [sortedFields]);

  return {
    schema,
    defaultValues,
    fields: sortedFields,
    isLoading,
  };
};
```

#### useCreateRecord.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRecordAPI } from '@/lib/api/records.api';
import { toast } from 'sonner';

export const useCreateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecordAPI,
    onSuccess: (data) => {
      // Invalidate records list to refetch
      queryClient.invalidateQueries({
        queryKey: ['records', data.object_id],
      });

      toast.success('Record created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to create record';
      toast.error(message);
      console.error('Create record error:', error);
    },
  });
};
```

#### generateZodSchema.ts
```typescript
import { z } from 'zod';

export const generateZodSchema = (
  fieldType: string,
  validation: Record<string, any>,
  isRequired: boolean,
  label: string
): z.ZodTypeAny => {
  let schema: z.ZodTypeAny;

  // Base schemas by type
  switch (fieldType) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
    case 'textarea':
      schema = z.string();

      // Email validation
      if (fieldType === 'email') {
        schema = (schema as z.ZodString).email('Geçerli bir email adresi girin');
      }

      // URL validation
      if (fieldType === 'url') {
        schema = (schema as z.ZodString).url('Geçerli bir URL girin');
      }

      // Length validation
      if (validation.minLength) {
        schema = (schema as z.ZodString).min(
          validation.minLength,
          `En az ${validation.minLength} karakter gerekli`
        );
      }
      if (validation.maxLength) {
        schema = (schema as z.ZodString).max(
          validation.maxLength,
          `En fazla ${validation.maxLength} karakter olabilir`
        );
      }

      // Regex validation
      if (validation.regex) {
        schema = (schema as z.ZodString).regex(
          new RegExp(validation.regex),
          validation.regexMessage || 'Geçersiz format'
        );
      }
      break;

    case 'number':
      schema = z.number({
        invalid_type_error: 'Geçerli bir sayı girin',
      });

      if (validation.min !== undefined) {
        schema = (schema as z.ZodNumber).min(
          validation.min,
          `En az ${validation.min} olmalı`
        );
      }
      if (validation.max !== undefined) {
        schema = (schema as z.ZodNumber).max(
          validation.max,
          `En fazla ${validation.max} olabilir`
        );
      }
      break;

    case 'date':
    case 'datetime':
      schema = z.string().or(z.date());
      break;

    case 'checkbox':
      schema = z.boolean();
      break;

    case 'select':
    case 'radio':
      schema = z.string();
      if (validation.options?.length) {
        schema = z.enum(
          validation.options.map((opt: any) => opt.value),
          {
            errorMap: () => ({ message: 'Geçerli bir seçenek seçin' }),
          }
        );
      }
      break;

    case 'multiselect':
      schema = z.array(z.string()).default([]);
      if (validation.minItems) {
        schema = (schema as z.ZodArray<any>).min(
          validation.minItems,
          `En az ${validation.minItems} seçenek seçin`
        );
      }
      break;

    default:
      schema = z.any();
  }

  // Make field optional if not required
  if (!isRequired) {
    schema = schema.optional();
  } else {
    // Required message
    if (fieldType === 'text' || fieldType === 'email' || fieldType === 'textarea') {
      schema = (schema as z.ZodString).min(1, `${label} gereklidir`);
    }
  }

  return schema;
};
```

#### records.api.ts
```typescript
import { apiClient } from './client';

interface RecordCreateRequest {
  object_id: string;
  data: Record<string, any>;
}

interface RecordResponse {
  id: string;
  object_id: string;
  data: Record<string, any>;
  primary_value: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  tenant_id: string;
}

export const createRecordAPI = async (
  record: RecordCreateRequest
): Promise<RecordResponse> => {
  const { data } = await apiClient.post<RecordResponse>('/api/records', record);
  return data;
};

export const getRecordsAPI = async (
  objectId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<{ items: RecordResponse[]; total: number }> => {
  const { data } = await apiClient.get('/api/records', {
    params: { object_id: objectId, page, page_size: pageSize },
  });
  return data;
};
```

#### record.types.ts
```typescript
export interface Field {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  category?: string;
  config?: Record<string, any>;
}

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'textarea'
  | 'date'
  | 'datetime'
  | 'checkbox'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'lookup';

export interface ObjectField {
  id: string;
  object_id: string;
  field_id: string;
  field: Field;
  display_order: number;
  is_required: boolean;
  is_visible: boolean;
  is_readonly: boolean;
  field_overrides?: {
    placeholder?: string;
    default_value?: any;
    validation?: Record<string, any>;
    options?: Array<{ value: string; label: string; color?: string }>;
  };
}

export interface Record {
  id: string;
  object_id: string;
  data: Record<string, any>;
  primary_value: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  tenant_id: string;
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `zod` - Dynamic schema validation
- `@tanstack/react-query` - API state management
- `sonner` - Toast notifications

### UI Components (To Be Built)
- `Input` component (React Aria) ✅
- `Textarea` component (React Aria)
- `Checkbox` component (React Aria) ✅
- `Select` component (React Aria)
- `MultiSelect` component (custom)
- `RadioGroup` component (React Aria)
- `DatePicker` component (React Aria Calendar)
- `Button` component (React Aria) ✅

---

## Acceptance Criteria

- [ ] Form field'ları object-fields'dan dinamik oluşturuluyor
- [ ] 12 field type'ının hepsi doğru component'e map ediliyor
- [ ] Validation kuralları Zod schema'ya dönüşüyor
- [ ] Required field'lar (`*`) işaretleniyor
- [ ] Default value'lar form'da pre-fill ediliyor
- [ ] Readonly field'lar disabled görünüyor
- [ ] Field display_order'a göre sıralanıyor
- [ ] Form submit sonrası record oluşturuluyor
- [ ] Success toast gösteriliyor
- [ ] Record list invalidate ediliyor (yeni record gösteriliyor)
- [ ] Validation error'ları field altında gösteriliyor
- [ ] API error'ları toast olarak gösteriliyor
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Boş form submit → required field validation
- [ ] Email field → geçersiz email formatı error
- [ ] Number field → min/max validation
- [ ] Text field → minLength/maxLength validation
- [ ] Regex validation → pattern uyumsuzluğu error
- [ ] Select field → option seçimi çalışıyor
- [ ] Multiselect field → çoklu seçim çalışıyor
- [ ] Date picker → tarih seçimi çalışıyor
- [ ] Checkbox field → toggle çalışıyor
- [ ] Default value → form açılınca dolu geliyor
- [ ] Readonly field → disabled görünüyor
- [ ] Display order → field'lar sıralı
- [ ] Successful submit → record oluşuyor + toast
- [ ] API error → error toast gösteriliyor
- [ ] Cancel button → form kapanıyor

### Field Type Testing Matrix
| Field Type | Test Case | Expected |
|------------|-----------|----------|
| text | Empty submit (required) | Error: "Field is required" |
| email | "invalid-email" | Error: "Invalid email" |
| phone | "+90 555 1234567" | Success |
| number | "abc" | Error: "Must be a number" |
| date | Select 2026-01-18 | Success, formatted ISO |
| checkbox | Toggle on/off | true/false value |
| select | Select option 2 | option2 value |
| multiselect | Select 3 options | Array of 3 values |

---

## Code Examples

### Complete Dynamic Form Flow
```typescript
// 1. Component mounts
// 2. useObjectFields fetches object-fields from API
// 3. useDynamicForm generates Zod schema + default values
// 4. React Hook Form initializes with schema
// 5. DynamicFormField renders correct input per field type
// 6. User fills form → Zod validates on submit
// 7. API call transforms form data to { object_id, data: {...} }
// 8. Success → invalidate query + toast + close modal
```

### Zod Schema Generation Example
```typescript
// Input: Object fields
[
  {
    field_id: "fld_name",
    field: { type: "text", label: "Name" },
    is_required: true,
    field_overrides: {
      validation: { minLength: 3, maxLength: 100 }
    }
  },
  {
    field_id: "fld_email",
    field: { type: "email", label: "Email" },
    is_required: true
  }
]

// Output: Zod Schema
z.object({
  fld_name: z.string()
    .min(3, "En az 3 karakter gerekli")
    .max(100, "En fazla 100 karakter")
    .min(1, "Name gereklidir"),
  fld_email: z.string()
    .email("Geçerli bir email adresi girin")
    .min(1, "Email gereklidir")
})
```

### Modal Usage Example
```typescript
// RecordFormModal.tsx
import { Dialog } from '@/components/ui/Dialog';
import { CreateRecordForm } from './CreateRecordForm';

export const RecordFormModal = ({ objectId, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Title>Create New Record</Dialog.Title>
      <Dialog.Content>
        <CreateRecordForm
          objectId={objectId}
          onSuccess={() => onClose()}
          onCancel={onClose}
        />
      </Dialog.Content>
    </Dialog>
  );
};
```

---

## Resources

### Backend Documentation
- [POST /api/records](../../backend-docs/api/04-records/01-create-record.md) - Create record endpoint
- [GET /api/object-fields](../../backend-docs/api/07-object-fields/02-list-object-fields.md) - Object-fields API
- [Field Types](../../backend-docs/api/02-fields/README.md) - 12 field types reference

### Frontend Libraries
- [React Hook Form Docs](https://react-hook-form.com/) - Form management
- [Zod Docs](https://zod.dev/) - Schema validation
- [TanStack Query Docs](https://tanstack.com/query/latest) - Data fetching
- [React Aria Docs](https://react-spectrum.adobe.com/react-aria/) - Accessible components

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Create Record Form task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/06-records-table/02-create-record-form.md

Requirements:
1. Create src/features/records/components/CreateRecordForm.tsx - Main dynamic form component with React Hook Form
2. Create src/features/records/components/DynamicFormField.tsx - Field type router component (12 types)
3. Create src/features/records/hooks/useDynamicForm.ts - Dynamic Zod schema + default values generator
4. Create src/features/records/hooks/useCreateRecord.ts - TanStack Query mutation for record creation
5. Create src/features/records/hooks/useObjectFields.ts - Fetch object-fields for given object_id
6. Create src/features/records/utils/generateZodSchema.ts - Convert object-field validation to Zod schema
7. Create src/features/records/types/record.types.ts - TypeScript type definitions
8. Create src/lib/api/records.api.ts - Records API functions (createRecordAPI, getRecordsAPI)
9. Create UI components if missing: Textarea, Select, MultiSelect, RadioGroup, DatePicker

CRITICAL REQUIREMENTS:
- Form fields are generated DYNAMICALLY from object-fields API response
- Support all 12 field types: text, email, phone, url, number, textarea, date, datetime, checkbox, select, multiselect, radio
- Convert object-field validation rules to Zod schema at runtime
- Use field IDs as keys in data object (NOT field names!)
- Handle required, min/max, regex, pattern validation
- Apply default values from object-field config
- Sort fields by display_order
- Show validation errors inline (field-level) and summary (form-level)
- Success toast + invalidate queries after create
- Mobile responsive with Tailwind CSS 4

Field Type Component Mapping:
- text/email/phone/url → Input component
- number → Input type="number" with step
- textarea → Textarea component
- date/datetime → DatePicker component
- checkbox → Checkbox component
- select → Select component
- multiselect → MultiSelect component
- radio → RadioGroup component

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 03-edit-record-form.md
