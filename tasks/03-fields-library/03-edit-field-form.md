# Task: Edit Field Form

**Priority:** 🟡 Medium
**Estimated Time:** 1 gün
**Dependencies:** 02-create-field-form

---

## Objective

Mevcut bir field'ı düzenlemek için form oluşturmak. **CRITICAL:** Field'ın `name` ve `type` değerleri oluşturulduktan sonra değiştirilemez (backend kısıtlaması). Sadece `label`, `category`, `description` ve `config` güncellenebilir.

---

## Backend API

### Endpoint
```
PATCH /api/fields/{field_id}
```

### Request Format (JSON)
**IMPORTANT:** Partial update! Sadece değiştirmek istediğiniz field'ları gönderin.

```typescript
interface FieldUpdateRequest {
  label?: string;           // Görünen ad (1-255 karakter)
  category?: string;        // Kategori (Contact Info, Personal, etc.)
  description?: string;     // Field açıklaması
  config?: FieldConfig;     // Field konfigürasyonu
}

// NOT: name ve type gönderilemez/değiştirilemez!
```

### Response
```json
{
  "id": "fld_a1b2c3d4",
  "name": "email",           // ❌ DEĞİŞTİRİLEMEZ (immutable)
  "label": "Email Address (Updated)",
  "type": "email",           // ❌ DEĞİŞTİRİLEMEZ (immutable)
  "description": "Updated description",
  "category": "Contact Info",
  "is_global": false,
  "is_system_field": false,
  "is_custom": true,
  "config": {
    "validation": {
      "required": false,
      "regex": "^[^@]+@[^@]+\\.[^@]+$"
    },
    "placeholder": "new@example.com"
  },
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T11:30:00Z"
}
```

### Error Responses
- `404 Not Found` - Field bulunamadı
- `401 Unauthorized` - Token geçersiz
- `422 Unprocessable Entity` - Validation hatası

**Backend Documentation:**
→ [PATCH /api/fields/{field_id}](../../backend-docs/api/02-fields/04-update-field.md)

---

## UI/UX Design

### Form Layout
```
┌─────────────────────────────────────────┐
│  Edit Field                             │
│  ─────────────────────────────────────  │
│                                         │
│  Field Name (Immutable)        🔒       │
│  ┌─────────────────────────────────┐   │
│  │ email                           │   │ ← Disabled, grayed out
│  └─────────────────────────────────┘   │
│                                         │
│  Field Type (Immutable)        🔒       │
│  ┌─────────────────────────────────┐   │
│  │ Email                           │   │ ← Disabled, grayed out
│  └─────────────────────────────────┘   │
│                                         │
│  Label *                                │
│  ┌─────────────────────────────────┐   │
│  │ Email Address                   │   │ ← Editable
│  └─────────────────────────────────┘   │
│                                         │
│  Category                               │
│  ┌─────────────────────────────────┐   │
│  │ Contact Info         ▼          │   │ ← Editable
│  └─────────────────────────────────┘   │
│                                         │
│  Description                            │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │ ← Editable
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Configuration                          │
│  ┌─────────────────────────────────┐   │
│  │ {                               │   │
│  │   "validation": {...}           │   │ ← Editable JSON
│  │ }                               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ Cancel ]  [ Save Changes ]          │
└─────────────────────────────────────────┘
```

### Form Fields

1. **Field Name (Disabled) 🔒**
   - Type: text
   - Disabled: true
   - CSS: `opacity-50 cursor-not-allowed bg-gray-100`
   - Tooltip: "Field name cannot be changed after creation"

2. **Field Type (Disabled) 🔒**
   - Type: select/text
   - Disabled: true
   - CSS: `opacity-50 cursor-not-allowed bg-gray-100`
   - Tooltip: "Field type cannot be changed after creation"

3. **Label (Editable) ***
   - Type: text
   - Required: true
   - Placeholder: "Email Address"
   - Validation: 1-255 characters
   - Error messages: "Label is required", "Label must be 1-255 characters"

4. **Category (Editable)**
   - Type: select
   - Options: Contact Info, Personal, Address, Custom
   - Placeholder: "Select category"

5. **Description (Editable)**
   - Type: textarea
   - Placeholder: "Describe what this field is used for..."
   - Rows: 3

6. **Config (Editable)**
   - Type: JSON editor (CodeMirror veya Monaco Editor)
   - Validation: Valid JSON
   - Placeholder: `{ "validation": { "required": true } }`

7. **Action Buttons**
   - Cancel button → Reset form / navigate back
   - Save Changes button → Submit update (primary color #3B82F6)

### States

- **Loading (Fetching)** - Field data yüklenirken skeleton loader
- **Idle** - Form dolu, kullanıcı düzenleyebilir
- **Submitting** - API call yapılıyor, button disabled + spinner
- **Success** - Toast mesajı + navigate back
- **Error** - Error mesajı göster (toast/alert)

### Visual Indicators

- **Immutable Fields:** Gri background + lock icon + tooltip
- **Dirty State:** Form değişti → "You have unsaved changes" uyarısı
- **Validation Errors:** Red border + error message
- **Success Toast:** "Field updated successfully"

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── fields/
│       ├── pages/
│       │   └── EditFieldPage.tsx         ⭐ Main page component
│       ├── components/
│       │   └── EditFieldForm.tsx         ⭐ Form component
│       ├── hooks/
│       │   ├── useField.ts               ⭐ Fetch single field (GET)
│       │   └── useEditField.ts           ⭐ Update field (PATCH)
│       └── types/
│           └── field.types.ts            ⭐ TypeScript types
├── lib/
│   └── api/
│       └── fields.api.ts                 ⭐ API calls
└── utils/
    └── validation.ts                     ⭐ Zod schemas
```

### Component Implementation

#### EditFieldPage.tsx
```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { useField } from '../hooks/useField';
import { EditFieldForm } from '../components/EditFieldForm';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';

export const EditFieldPage = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const navigate = useNavigate();
  const { data: field, isLoading, isError, error } = useField(fieldId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
        <p className="ml-4 text-gray-600">Loading field...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <Alert variant="error">
          {error?.message || 'Failed to load field'}
        </Alert>
        <button
          onClick={() => navigate('/fields')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to fields
        </button>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <Alert variant="warning">Field not found</Alert>
        <button
          onClick={() => navigate('/fields')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to fields
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/fields')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to fields
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Field</h1>
        <p className="text-gray-600 mt-2">
          Update field details. Note: Name and type cannot be changed.
        </p>
      </div>

      <EditFieldForm field={field} />
    </div>
  );
};
```

#### EditFieldForm.tsx
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useEditField } from '../hooks/useEditField';
import { Field } from '../types/field.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { JsonEditor } from '@/components/ui/JsonEditor';
import { Tooltip } from '@/components/ui/Tooltip';
import { LockIcon } from '@/components/icons/LockIcon';

const editFieldSchema = z.object({
  label: z.string().min(1, 'Label is required').max(255, 'Label must be 1-255 characters'),
  category: z.string().optional(),
  description: z.string().optional(),
  config: z.record(z.any()).optional(), // JSON object
});

type EditFieldFormData = z.infer<typeof editFieldSchema>;

interface EditFieldFormProps {
  field: Field;
}

export const EditFieldForm = ({ field }: EditFieldFormProps) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isDirty }, setValue, watch } = useForm<EditFieldFormData>({
    resolver: zodResolver(editFieldSchema),
    defaultValues: {
      label: field.label,
      category: field.category || '',
      description: field.description || '',
      config: field.config || {},
    },
  });

  const { mutate: updateField, isPending } = useEditField();

  const onSubmit = (data: EditFieldFormData) => {
    // Partial update: only send changed fields
    const updateData: Partial<EditFieldFormData> = {};
    if (data.label !== field.label) updateData.label = data.label;
    if (data.category !== field.category) updateData.category = data.category;
    if (data.description !== field.description) updateData.description = data.description;
    if (JSON.stringify(data.config) !== JSON.stringify(field.config)) {
      updateData.config = data.config;
    }

    if (Object.keys(updateData).length === 0) {
      // No changes
      navigate('/fields');
      return;
    }

    updateField({
      fieldId: field.id,
      data: updateData,
    }, {
      onSuccess: () => {
        navigate('/fields');
      },
    });
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirm) return;
    }
    navigate('/fields');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* Immutable Field: Name */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          Field Name (Immutable)
          <Tooltip content="Field name cannot be changed after creation">
            <LockIcon className="w-4 h-4 ml-2 text-gray-400" />
          </Tooltip>
        </label>
        <Input
          type="text"
          value={field.name}
          disabled
          className="opacity-50 cursor-not-allowed bg-gray-100"
        />
      </div>

      {/* Immutable Field: Type */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          Field Type (Immutable)
          <Tooltip content="Field type cannot be changed after creation">
            <LockIcon className="w-4 h-4 ml-2 text-gray-400" />
          </Tooltip>
        </label>
        <Input
          type="text"
          value={field.type}
          disabled
          className="opacity-50 cursor-not-allowed bg-gray-100"
        />
      </div>

      {/* Editable Field: Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="Email Address"
          {...register('label')}
          error={errors.label?.message}
        />
      </div>

      {/* Editable Field: Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <Select {...register('category')}>
          <option value="">Select category</option>
          <option value="Contact Info">Contact Info</option>
          <option value="Personal">Personal</option>
          <option value="Address">Address</option>
          <option value="Custom">Custom</option>
        </Select>
      </div>

      {/* Editable Field: Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          placeholder="Describe what this field is used for..."
          rows={3}
          {...register('description')}
        />
      </div>

      {/* Editable Field: Config (JSON Editor) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Configuration (JSON)
        </label>
        <JsonEditor
          value={watch('config')}
          onChange={(value) => setValue('config', value, { shouldDirty: true })}
          placeholder='{ "validation": { "required": true } }'
        />
      </div>

      {/* Unsaved Changes Warning */}
      {isDirty && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          You have unsaved changes
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !isDirty}
          loading={isPending}
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
```

#### useField.ts (Fetch single field)
```typescript
import { useQuery } from '@tanstack/react-query';
import { getFieldAPI } from '@/lib/api/fields.api';
import { Field } from '../types/field.types';

export const useField = (fieldId: string) => {
  return useQuery<Field>({
    queryKey: ['field', fieldId],
    queryFn: () => getFieldAPI(fieldId),
    enabled: !!fieldId, // Only fetch if fieldId exists
    staleTime: 30000, // 30 seconds
  });
};
```

#### useEditField.ts (Update field)
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateFieldAPI } from '@/lib/api/fields.api';
import { FieldUpdateRequest, Field } from '../types/field.types';
import { toast } from 'sonner';

interface UpdateFieldParams {
  fieldId: string;
  data: Partial<FieldUpdateRequest>;
}

export const useEditField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fieldId, data }: UpdateFieldParams) => {
      return await updateFieldAPI(fieldId, data);
    },
    onMutate: async ({ fieldId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['field', fieldId] });

      // Snapshot previous value
      const previousField = queryClient.getQueryData<Field>(['field', fieldId]);

      // Optimistically update
      queryClient.setQueryData<Field>(['field', fieldId], (old) => {
        if (!old) return old;
        return {
          ...old,
          ...data,
          updated_at: new Date().toISOString(),
        };
      });

      return { previousField };
    },
    onError: (error: any, { fieldId }, context) => {
      // Rollback on error
      if (context?.previousField) {
        queryClient.setQueryData(['field', fieldId], context.previousField);
      }
      toast.error(error?.message || 'Failed to update field');
    },
    onSuccess: (updatedField) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      queryClient.invalidateQueries({ queryKey: ['field', updatedField.id] });
      toast.success('Field updated successfully');
    },
  });
};
```

#### fields.api.ts (Add update function)
```typescript
import { apiClient } from './client';
import { Field, FieldUpdateRequest } from '@/features/fields/types/field.types';

// GET /api/fields/{field_id}
export const getFieldAPI = async (fieldId: string): Promise<Field> => {
  const { data } = await apiClient.get<Field>(`/api/fields/${fieldId}`);
  return data;
};

// PATCH /api/fields/{field_id}
export const updateFieldAPI = async (
  fieldId: string,
  fieldData: Partial<FieldUpdateRequest>
): Promise<Field> => {
  const { data } = await apiClient.patch<Field>(
    `/api/fields/${fieldId}`,
    fieldData // Partial update: only send changed fields
  );
  return data;
};
```

#### field.types.ts (Add update type)
```typescript
export interface Field {
  id: string;
  name: string;           // Immutable after creation
  label: string;
  type: string;           // Immutable after creation
  description?: string;
  category?: string;
  is_global: boolean;
  is_system_field: boolean;
  is_custom: boolean;
  config?: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FieldUpdateRequest {
  label?: string;
  category?: string;
  description?: string;
  config?: Record<string, any>;
  // NOTE: name and type are NOT included (immutable)
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@tanstack/react-query` - API state management + optimistic updates
- `axios` - HTTP client
- `react-router-dom` - Navigation
- `sonner` - Toast notifications

### UI Components (To Be Built)
- `Button` component (React Aria)
- `Input` component (React Aria)
- `Select` component (React Aria)
- `Textarea` component (React Aria)
- `JsonEditor` component (CodeMirror or Monaco Editor)
- `Tooltip` component (React Aria)
- `Spinner` component
- `Alert` component

---

## Acceptance Criteria

- [ ] Edit field sayfası `/fields/:fieldId/edit` route'unda çalışıyor
- [ ] Field data loading state gösteriliyor (skeleton/spinner)
- [ ] Field bulunamadığında 404 mesajı gösteriliyor
- [ ] `name` ve `type` field'ları disabled ve gri gösteriliyor
- [ ] Lock icon ve tooltip ile immutable field'lar açıklanıyor
- [ ] `label`, `category`, `description`, `config` editable
- [ ] Form validation çalışıyor (Zod)
- [ ] Partial update: Sadece değişen field'lar backend'e gönderiliyor
- [ ] Optimistic update çalışıyor (TanStack Query)
- [ ] Başarılı update sonrası success toast + navigate to list
- [ ] Hatalı update sonrası error toast + rollback
- [ ] "You have unsaved changes" uyarısı çalışıyor
- [ ] Cancel button ile form reset/navigate back
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Edit sayfasına git → Field data yükleniyor
- [ ] `name` ve `type` field'ları disabled
- [ ] Label değiştir → Form dirty state
- [ ] Cancel → Unsaved changes uyarısı
- [ ] Boş label submit → validation error
- [ ] Valid form submit → success toast
- [ ] Network error → error toast + rollback
- [ ] 404 field → error mesajı
- [ ] Loading state görünüyor
- [ ] Optimistic update çalışıyor

### Test Scenario
1. Fetch field: `GET /api/fields/fld_a1b2c3d4`
2. Edit label: "Email" → "Email Address (Updated)"
3. Submit → `PATCH /api/fields/fld_a1b2c3d4`
4. Verify optimistic update
5. Verify success toast
6. Verify redirect to list

---

## Code Examples

### Complete Edit Flow
```typescript
// 1. User navigates to /fields/fld_a1b2c3d4/edit
// 2. Fetch field data (GET /api/fields/fld_a1b2c3d4)
// 3. Populate form with existing data
// 4. User edits label, description, config
// 5. Submit form → useEditField mutation
// 6. Optimistic update (immediately show changes)
// 7. API call (PATCH /api/fields/fld_a1b2c3d4)
// 8. Success → invalidate cache, show toast
// 9. Error → rollback optimistic update, show error
// 10. Navigate back to /fields
```

### Partial Update Logic
```typescript
// Only send changed fields
const onSubmit = (data: EditFieldFormData) => {
  const updateData: Partial<FieldUpdateRequest> = {};

  if (data.label !== field.label) updateData.label = data.label;
  if (data.category !== field.category) updateData.category = data.category;
  if (data.description !== field.description) updateData.description = data.description;

  // Compare config (deep comparison)
  if (JSON.stringify(data.config) !== JSON.stringify(field.config)) {
    updateData.config = data.config;
  }

  // Skip if no changes
  if (Object.keys(updateData).length === 0) {
    navigate('/fields');
    return;
  }

  updateField({ fieldId: field.id, data: updateData });
};
```

### Optimistic Update Pattern
```typescript
export const useEditField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, data }) => updateFieldAPI(fieldId, data),
    onMutate: async ({ fieldId, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['field', fieldId] });

      // Snapshot previous value
      const previousField = queryClient.getQueryData(['field', fieldId]);

      // Optimistically update
      queryClient.setQueryData(['field', fieldId], (old) => ({
        ...old,
        ...data,
        updated_at: new Date().toISOString(),
      }));

      return { previousField };
    },
    onError: (error, { fieldId }, context) => {
      // Rollback on error
      queryClient.setQueryData(['field', fieldId], context.previousField);
      toast.error('Failed to update field');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      toast.success('Field updated successfully');
    },
  });
};
```

### Error Handling
```typescript
// API Client (fields.api.ts)
export const updateFieldAPI = async (fieldId: string, data: Partial<FieldUpdateRequest>) => {
  try {
    const { data: updatedField } = await apiClient.patch(`/api/fields/${fieldId}`, data);
    return updatedField;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Field not found');
    }
    if (error.response?.status === 422) {
      throw new Error('Invalid field data');
    }
    throw new Error('Failed to update field');
  }
};
```

---

## Resources

### Backend Documentation
- [PATCH /api/fields/{field_id}](../../backend-docs/api/02-fields/04-update-field.md) - Detailed endpoint documentation
- [Fields API Overview](../../backend-docs/api/02-fields/README.md) - Fields system overview

### Frontend Libraries
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Sonner Toast](https://sonner.emilkowal.ski/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Edit Field Form task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/03-fields-library/03-edit-field-form.md

Requirements:
1. Create src/features/fields/pages/EditFieldPage.tsx - Main page with loading/error states
2. Create src/features/fields/components/EditFieldForm.tsx - Form component with disabled name/type fields
3. Create src/features/fields/hooks/useField.ts - TanStack Query hook to fetch single field (GET)
4. Create src/features/fields/hooks/useEditField.ts - TanStack Query mutation hook with optimistic updates (PATCH)
5. Update src/lib/api/fields.api.ts - Add getFieldAPI() and updateFieldAPI() functions
6. Update src/features/fields/types/field.types.ts - Add FieldUpdateRequest type

CRITICAL REQUIREMENTS:
- Field 'name' and 'type' are IMMUTABLE (cannot be changed after creation)
- Show name and type fields as disabled with lock icon and tooltip
- Only send changed fields in PATCH request (partial update)
- Implement optimistic updates with TanStack Query
- Show "You have unsaved changes" warning if form is dirty
- Loading state while fetching field data
- Error state if field not found (404)
- Success toast after update + navigate back to /fields
- Error toast + rollback on failed update
- Mobile responsive design with Tailwind CSS 4

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 04-delete-field-confirmation.md
