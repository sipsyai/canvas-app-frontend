# Task: Primary Field Selection

**Priority:** 🟡 Medium
**Estimated Time:** 1 gün
**Dependencies:** 01-add-field-to-object

---

## Objective

Bir object'in hangi field'ının primary field (birincil alan) olacağını seçebilme özelliği. Primary field, kayıtların (records) başlığını belirler. Backend, primary field değiştiğinde tüm kayıtların `primary_value`'sunu otomatik günceller.

---

## Backend API

### Endpoint
```
PATCH /api/object-fields/{object_field_id}
```

### Request Format
```json
{
  "is_primary_field": true
}
```

### Response
```json
{
  "object_field_id": "uuid-here",
  "object_id": "uuid-here",
  "field_name": "company_name",
  "field_type": "text",
  "is_primary_field": true,
  "is_required": true,
  "display_order": 1,
  "created_at": "2024-01-18T10:00:00Z",
  "updated_at": "2024-01-18T10:30:00Z"
}
```

**Response Fields:**
- `is_primary_field` - True olursa bu field artık primary field'dır
- Backend otomatik olarak eski primary field'ı `false`'a çeker (sadece 1 tane olabilir)
- Backend tüm kayıtların `primary_value` alanını bu field'dan günceller

### Error Responses
- `404 Not Found` - Field bulunamadı
- `422 Unprocessable Entity` - Validation hatası
- `401 Unauthorized` - Token geçersiz

**Backend Documentation:**
→ [PATCH /api/object-fields/{object_field_id}](../../backend-docs/api/05-object-fields/04-update-field.md)

---

## Primary Field Nedir?

### Açıklama
- **Primary Field:** Kayıtları tanımlayan ana alan (örn: müşteri adı, ürün adı)
- **Primary Value:** Her kaydın primary field'daki değeri (otomatik hesaplanır)
- **Kullanım:** Record listelerinde başlık olarak görünür

### Örnekler

**Companies Object:**
```
Primary Field: company_name (Text)
Record 1 Primary Value: "Acme Corp"
Record 2 Primary Value: "Tech Inc"
```

**Products Object:**
```
Primary Field: product_name (Text)
Record 1 Primary Value: "iPhone 15 Pro"
Record 2 Primary Value: "MacBook Air M3"
```

**Contacts Object:**
```
Primary Field: full_name (Text)
Record 1 Primary Value: "Ahmet Yılmaz"
Record 2 Primary Value: "Ayşe Demir"
```

### Kurallar
1. ✅ Her object'in **sadece 1 tane** primary field'ı olabilir
2. ✅ Primary field seçildiğinde eski primary field otomatik unset olur
3. ✅ Backend tüm records'ların `primary_value`'sunu otomatik günceller
4. ⚠️ Primary field seçilmemişse kayıtlar "Untitled Record" olarak görünür

---

## UI/UX Design

### Field List with Radio Selection
```
┌──────────────────────────────────────────────────────────┐
│  Object Fields                                           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ○  ID (Auto Number)              Required       │   │
│  │      Auto-increment ID                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ●  Company Name (Text)           Required ⭐    │   │  <- Primary
│  │      Primary field for this object              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ○  Email (Text)                  Optional       │   │
│  │      Company email address                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ○  Phone (Text)                  Optional       │   │
│  │      Contact phone number                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ⚠️  Tip: Primary field is used as the record title     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Primary Field Preview
```
┌──────────────────────────────────────────────────────────┐
│  Primary Field Preview                                   │
│                                                          │
│  Current Primary Field: Company Name (Text)              │
│                                                          │
│  Record titles will look like:                           │
│  ┌────────────────────────────────────────────────┐     │
│  │  📄 Acme Corp                                  │     │
│  │  📄 Tech Inc                                   │     │
│  │  📄 Global Solutions Ltd                       │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ⚠️  Changing primary field will update all record      │
│      titles automatically                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Warning States

**No Primary Field Selected:**
```
┌──────────────────────────────────────────────────────────┐
│  ⚠️  No Primary Field Selected                           │
│                                                          │
│  Please select a primary field to identify records.     │
│  Without a primary field, all records will be shown     │
│  as "Untitled Record".                                  │
│                                                          │
│  [Select Primary Field]                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Changing Primary Field Confirmation:**
```
┌──────────────────────────────────────────────────────────┐
│  🔄 Change Primary Field?                                │
│                                                          │
│  Current: Company Name                                   │
│  New: Email                                              │
│                                                          │
│  This will update the title of ALL records in this      │
│  object. Records will now be identified by their        │
│  Email value instead of Company Name.                   │
│                                                          │
│  Example changes:                                        │
│  Before: "Acme Corp"                                    │
│  After:  "contact@acmecorp.com"                         │
│                                                          │
│  [Cancel]  [Confirm Change]                             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Radio Button Behavior
1. **Single Selection** - Sadece 1 field seçilebilir (radio button)
2. **Star Icon (⭐)** - Primary field'da yıldız ikonu göster
3. **Auto Unset** - Yeni primary field seçildiğinde eski otomatik unset
4. **Optimistic Update** - UI hemen güncellenir, backend işlemi arkada
5. **Rollback on Error** - Hata olursa eski primary field'a geri dön

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── object-fields/
│       ├── components/
│       │   ├── FieldList.tsx                    ⭐ Field listesi (radio buttons)
│       │   ├── PrimaryFieldSelector.tsx         ⭐ Primary field seçimi
│       │   ├── PrimaryFieldPreview.tsx          ⭐ Preview component
│       │   └── PrimaryFieldWarning.tsx          ⭐ Warning mesajları
│       ├── hooks/
│       │   ├── usePrimaryField.ts               ⭐ Primary field hook
│       │   └── useUpdateFieldPrimary.ts         ⭐ Update mutation hook
│       └── types/
│           └── object-field.types.ts            (Existing)
├── lib/
│   └── api/
│       └── object-fields.api.ts                 ⭐ API calls
└── utils/
    └── validation.ts                            ⭐ Validation helpers
```

### Component Implementation

#### PrimaryFieldSelector.tsx
```typescript
import { useUpdateFieldPrimary } from '../hooks/useUpdateFieldPrimary';
import { ObjectField } from '../types/object-field.types';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Badge } from '@/components/ui/Badge';

interface PrimaryFieldSelectorProps {
  objectId: string;
  fields: ObjectField[];
  currentPrimaryFieldId?: string;
}

export const PrimaryFieldSelector = ({
  objectId,
  fields,
  currentPrimaryFieldId,
}: PrimaryFieldSelectorProps) => {
  const { mutate: updatePrimary, isPending } = useUpdateFieldPrimary(objectId);

  const handlePrimaryFieldChange = (fieldId: string) => {
    // Show confirmation if changing existing primary field
    if (currentPrimaryFieldId && currentPrimaryFieldId !== fieldId) {
      const confirmed = window.confirm(
        'Changing the primary field will update all record titles. Continue?'
      );
      if (!confirmed) return;
    }

    updatePrimary(fieldId);
  };

  return (
    <div className="space-y-4">
      {/* Warning if no primary field */}
      {!currentPrimaryFieldId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900">No Primary Field Selected</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please select a primary field to identify records.
                Without it, all records will be shown as "Untitled Record".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Field list with radio buttons */}
      <RadioGroup
        value={currentPrimaryFieldId || ''}
        onChange={handlePrimaryFieldChange}
        disabled={isPending}
      >
        {fields.map((field) => (
          <div
            key={field.object_field_id}
            className={`
              border rounded-lg p-4 transition-all
              ${field.is_primary_field ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-blue-300'}
            `}
          >
            <div className="flex items-center gap-3">
              {/* Radio Button */}
              <RadioGroup.Option value={field.object_field_id}>
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {field.is_primary_field && (
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                  )}
                </div>
              </RadioGroup.Option>

              {/* Field Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {field.field_name}
                  </span>
                  <Badge variant="secondary">{field.field_type}</Badge>
                  {field.is_primary_field && (
                    <Badge variant="primary">⭐ Primary Field</Badge>
                  )}
                  {field.is_required && (
                    <Badge variant="warning">Required</Badge>
                  )}
                </div>
                {field.description && (
                  <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                )}
                {field.is_primary_field && (
                  <p className="text-xs text-blue-600 mt-1">
                    Used as the record title
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
```

#### PrimaryFieldPreview.tsx
```typescript
import { ObjectField } from '../types/object-field.types';
import { Card } from '@/components/ui/Card';

interface PrimaryFieldPreviewProps {
  primaryField?: ObjectField;
  sampleValues?: string[];
}

export const PrimaryFieldPreview = ({
  primaryField,
  sampleValues = ['Example Record 1', 'Example Record 2', 'Example Record 3'],
}: PrimaryFieldPreviewProps) => {
  if (!primaryField) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No primary field selected</p>
          <p className="text-xs mt-1">Records will be shown as "Untitled Record"</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Primary Field Preview</h3>
        <p className="text-sm text-gray-600 mb-4">
          Current Primary Field: <span className="font-medium">{primaryField.field_name}</span> ({primaryField.field_type})
        </p>

        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Record titles will look like:
          </p>
          {sampleValues.map((value, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <span className="text-gray-400">📄</span>
              <span className="text-sm text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            ⚠️ Changing primary field will update all record titles automatically
          </p>
        </div>
      </div>
    </Card>
  );
};
```

#### useUpdateFieldPrimary.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateObjectFieldAPI } from '@/lib/api/object-fields.api';
import { ObjectField } from '../types/object-field.types';
import { toast } from '@/components/ui/Toast';

export const useUpdateFieldPrimary = (objectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      // Set is_primary_field: true
      return updateObjectFieldAPI(fieldId, { is_primary_field: true });
    },

    // Optimistic update
    onMutate: async (fieldId: string) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['object-fields', objectId] });

      // Get current fields
      const previousFields = queryClient.getQueryData<ObjectField[]>([
        'object-fields',
        objectId,
      ]);

      // Optimistically update fields
      queryClient.setQueryData<ObjectField[]>(
        ['object-fields', objectId],
        (oldFields) => {
          if (!oldFields) return oldFields;

          return oldFields.map((field) => ({
            ...field,
            is_primary_field: field.object_field_id === fieldId,
          }));
        }
      );

      // Return previous state for rollback
      return { previousFields };
    },

    onSuccess: () => {
      toast.success('Primary field updated successfully');
    },

    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousFields) {
        queryClient.setQueryData(
          ['object-fields', objectId],
          context.previousFields
        );
      }

      toast.error(
        error.response?.data?.detail || 'Failed to update primary field'
      );
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['object-fields', objectId] });
    },
  });
};
```

#### usePrimaryField.ts
```typescript
import { useMemo } from 'react';
import { ObjectField } from '../types/object-field.types';

interface UsePrimaryFieldOptions {
  fields: ObjectField[];
}

export const usePrimaryField = ({ fields }: UsePrimaryFieldOptions) => {
  const primaryField = useMemo(() => {
    return fields.find((field) => field.is_primary_field);
  }, [fields]);

  const hasPrimaryField = !!primaryField;

  const getPrimaryValue = (record: Record<string, any>): string => {
    if (!primaryField) {
      return 'Untitled Record';
    }

    const value = record[primaryField.field_name];

    // Handle different field types
    if (value === null || value === undefined || value === '') {
      return 'Untitled Record';
    }

    return String(value);
  };

  return {
    primaryField,
    hasPrimaryField,
    getPrimaryValue,
  };
};
```

#### object-fields.api.ts (Update existing)
```typescript
import axios from 'axios';
import { getAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ... existing code ...

export const updateObjectFieldAPI = async (
  fieldId: string,
  updates: {
    field_name?: string;
    description?: string;
    is_required?: boolean;
    is_primary_field?: boolean;
    display_order?: number;
  }
) => {
  const token = getAuthToken();

  const { data } = await axios.patch(
    `${API_BASE_URL}/api/object-fields/${fieldId}`,
    updates,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return data;
};
```

#### object-field.types.ts (Update existing)
```typescript
export interface ObjectField {
  object_field_id: string;
  object_id: string;
  field_name: string;
  field_type: FieldType;
  is_primary_field: boolean;      // ⭐ Primary field flag
  is_required: boolean;
  display_order: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'checkbox'
  | 'select'
  | 'auto_number';
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - API state management
- `axios` - HTTP client
- `react-hook-form` - Form management (if needed)
- `zod` - Schema validation (if needed)

### UI Components (To Be Built)
- `RadioGroup` component (React Aria)
- `Badge` component
- `Card` component
- `Toast` component (notifications)

---

## Acceptance Criteria

- [ ] Field listesinde radio button ile primary field seçilebiliyor
- [ ] Sadece 1 field aynı anda primary olabiliyor
- [ ] Primary field değiştiğinde eski otomatik unset oluyor
- [ ] Primary field'da ⭐ yıldız ikonu görünüyor
- [ ] Primary field preview component doğru çalışıyor
- [ ] Primary field yoksa warning mesajı gösteriliyor
- [ ] Primary field değiştiğinde confirmation dialog gösteriliyor
- [ ] Optimistic update çalışıyor (UI hemen güncelleniyor)
- [ ] Hata durumunda rollback yapılıyor
- [ ] Toast notifications gösteriliyor (success/error)
- [ ] Loading state çalışıyor (radio buttons disabled)
- [ ] Backend'de primary_value otomatik güncelleniyor

---

## Testing Checklist

### Manual Testing
- [ ] Hiç primary field yok → warning mesajı görünüyor
- [ ] İlk kez primary field seçme → başarılı
- [ ] Primary field değiştirme → confirmation dialog + başarılı
- [ ] Confirmation dialog'da Cancel → değişiklik yapılmıyor
- [ ] Confirmation dialog'da Confirm → primary field değişiyor
- [ ] Optimistic update çalışıyor → UI hemen güncelleniyor
- [ ] Backend hatası → rollback yapılıyor + error toast
- [ ] Loading state → radio buttons disabled
- [ ] Primary field preview → doğru field name gösteriyor
- [ ] Record listesinde primary_value görünüyor

### Test Scenario
```
1. Object oluştur (Companies)
2. Field ekle: company_name (Text)
3. Field ekle: email (Text)
4. Primary field seç: company_name → ⭐ görünmeli
5. Primary field değiştir: email → confirmation + ⭐ email'e geçmeli
6. Record ekle: primary_value company_name yerine email olmalı
7. Primary field değiştir: company_name → primary_value güncellenmeli
```

---

## Code Examples

### Complete Primary Field Flow
```typescript
// 1. User selects a field as primary (radio button)
// 2. Show confirmation if changing existing primary field
// 3. Optimistic update → UI shows new primary field immediately
// 4. API call → PATCH /api/object-fields/{field_id}
// 5. Backend sets is_primary_field: true
// 6. Backend auto-unsets old primary field
// 7. Backend updates all records' primary_value
// 8. Success → show toast notification
// 9. Error → rollback + show error toast
```

### Validation Logic
```typescript
// validation.ts
export const validatePrimaryFieldChange = (
  currentPrimaryField?: ObjectField,
  newPrimaryField?: ObjectField
): { valid: boolean; message?: string } => {
  if (!newPrimaryField) {
    return {
      valid: false,
      message: 'Please select a field',
    };
  }

  // Warn if changing existing primary field
  if (currentPrimaryField && currentPrimaryField.object_field_id !== newPrimaryField.object_field_id) {
    return {
      valid: true,
      message: 'This will update all record titles. Continue?',
    };
  }

  return { valid: true };
};
```

### Error Handling
```typescript
// useUpdateFieldPrimary.ts
export const useUpdateFieldPrimary = (objectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      try {
        return await updateObjectFieldAPI(fieldId, { is_primary_field: true });
      } catch (error: any) {
        if (error.response?.status === 404) {
          throw new Error('Field not found');
        }
        if (error.response?.status === 422) {
          throw new Error('Invalid field update');
        }
        throw new Error('Failed to update primary field');
      }
    },

    onError: (error: Error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousFields) {
        queryClient.setQueryData(['object-fields', objectId], context.previousFields);
      }

      // Show error toast
      toast.error(error.message);
    },
  });
};
```

---

## Resources

### Backend Documentation
- [PATCH /api/object-fields/{object_field_id}](../../backend-docs/api/05-object-fields/04-update-field.md) - Update field endpoint
- [Object Fields Overview](../../backend-docs/api/05-object-fields/README.md) - Complete fields guide
- [Primary Value Auto-Calculation](../../backend-docs/api/06-records/01-primary-value.md) - How primary_value works

### Frontend Libraries
- [TanStack Query Docs](https://tanstack.com/query/latest) - Optimistic updates
- [React Aria RadioGroup](https://react-spectrum.adobe.com/react-aria/RadioGroup.html) - Radio buttons

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Primary Field Selection feature exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/05-object-fields/04-primary-field-selection.md

Requirements:
1. Create src/features/object-fields/components/PrimaryFieldSelector.tsx - Radio button selector for primary field
2. Create src/features/object-fields/components/PrimaryFieldPreview.tsx - Preview component showing how records will look
3. Create src/features/object-fields/components/PrimaryFieldWarning.tsx - Warning component when no primary field
4. Create src/features/object-fields/hooks/useUpdateFieldPrimary.ts - Mutation hook with optimistic updates
5. Create src/features/object-fields/hooks/usePrimaryField.ts - Hook to get primary field info
6. Update src/lib/api/object-fields.api.ts - Add updateObjectFieldAPI function
7. Update src/features/object-fields/types/object-field.types.ts - Add is_primary_field to ObjectField interface

CRITICAL REQUIREMENTS:
- Only ONE primary field per object (radio button, not checkbox!)
- Show confirmation dialog when changing existing primary field
- Implement optimistic updates with rollback on error
- Show ⭐ star icon on primary field
- Show warning if no primary field selected
- Display preview of how record titles will look
- Use PATCH /api/object-fields/{field_id} with { is_primary_field: true }
- Backend auto-unsets old primary field and updates all records' primary_value
- Handle loading state (disable radio buttons during update)
- Show toast notifications (success/error)

Follow the exact code examples and file structure provided in the task file.
Test with multiple fields and verify only one can be primary at a time.
```

---

**Status:** 🟡 Pending
**Next Task:** 05-field-validation-rules.md
