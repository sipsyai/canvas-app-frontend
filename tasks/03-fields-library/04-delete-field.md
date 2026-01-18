# Task: Field Silme (Delete Field)

**Priority:** 🟡 Medium
**Estimated Time:** 0.5 gün
**Dependencies:** 01-field-list-page, 09-ui-components (Dialog)

---

## Objective

Kullanıcıların field'ları silebilmesi için delete dialog ve confirmation sistemi oluşturmak. **CASCADE delete** ile field'a bağlı tüm object-field ilişkileri ve record data'ları silinir. Sistem field'ları silinemez.

---

## Backend API

### Endpoint
```
DELETE /api/fields/{field_id}
```

### Request Format
Sadece path parameter gerekli.

```typescript
interface DeleteFieldParams {
  field_id: string; // Örn: fld_a1b2c3d4
}
```

### Response
```
204 No Content
```

**Success:** Response body yok, sadece 204 status code döner.

### Error Responses
- `404 Not Found` - Field bulunamadı
- `401 Unauthorized` - Authentication gerekli
- `403 Forbidden` - Sistem field'ı silinemez (TODO: Backend'de implement edilecek)

**Backend Documentation:**
→ [DELETE /api/fields/{field_id}](../../backend-docs/api/02-fields/05-delete-field.md)

---

## CASCADE Delete Davranışı

### ⚠️ KRİTİK: Silme Etkileri

Field silindiğinde **CASCADE** ile şunlar da silinir:

1. **ObjectField Bağlantıları**
   - `object_fields` tablosundaki tüm bağlantılar
   - Field'ın kullanıldığı TÜM object'lerden kaldırılır

2. **Record Data (JSONB)**
   - `records` tablosundaki JSONB data'dan field key'i kaldırılır
   - Bu field'a ait TÜM record değerleri kaybolur

### Örnek Senaryo
```
Field: fld_email (Email Address)
- 3 object'te kullanılıyor (Contact, Company, Lead)
- 150 record'da data var

Silme Sonrası:
✗ object_fields tablosundan 3 kayıt silinir
✗ 150 record'daki email data'sı kaybolur
✗ Bu işlem GERİ ALINAMAZ!
```

---

## UI/UX Design

### Delete Button (Field List)
```
┌─────────────────────────────────────────────────┐
│ Fields Library                                  │
│                                                 │
│  Search: [........................]  [+ New]    │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Email Address                     [Edit]  │ │
│  │ Type: Email                       [🗑️]   │ │
│  │ Used in 3 objects                         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Phone Number          🔒 System   [Edit]  │ │
│  │ Type: Phone           (Cannot delete)     │ │
│  │ Used in 2 objects                         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Delete Confirmation Dialog
```
┌─────────────────────────────────────────────────┐
│  ⚠️  Delete Field?                       [X]    │
│                                                 │
│  Field: Email Address                           │
│  Type: Email                                    │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ⚠️ WARNING: This action cannot be       │   │
│  │ undone!                                 │   │
│  │                                         │   │
│  │ This will permanently delete:           │   │
│  │ • 3 object-field relationships          │   │
│  │ • 150 record values                     │   │
│  │                                         │   │
│  │ Objects using this field:               │   │
│  │ • Contact                               │   │
│  │ • Company                               │   │
│  │ • Lead                                  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Type field name to confirm: [............]     │
│                                                 │
│  [Cancel]                   [Delete Field]      │
│                                 (Red/Danger)    │
└─────────────────────────────────────────────────┘
```

### System Field Error Dialog
```
┌─────────────────────────────────────────────────┐
│  ⛔ Cannot Delete System Field           [X]    │
│                                                 │
│  Field: Created At                              │
│  Type: DateTime                                 │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ This is a system field and cannot be    │   │
│  │ deleted.                                │   │
│  │                                         │   │
│  │ System fields are required for core     │   │
│  │ application functionality.              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [OK]                                           │
└─────────────────────────────────────────────────┘
```

### States
- **Idle** - Delete button görünür, tıklanabilir
- **Dialog Open** - Confirmation dialog açık
- **Loading** - API call yapılıyor, button disabled + spinner
- **Success** - Field silindi, toast göster, listeyi güncelle
- **Error** - Hata mesajı göster (toast/dialog)
- **System Field** - Delete button disabled veya error dialog

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── fields/
│       ├── components/
│       │   ├── FieldListItem.tsx              ⭐ Delete button ekle
│       │   ├── DeleteFieldDialog.tsx          ⭐ NEW - Confirmation dialog
│       │   └── DeleteFieldButton.tsx          ⭐ NEW - Delete trigger button
│       ├── hooks/
│       │   ├── useDeleteField.ts              ⭐ NEW - Delete mutation hook
│       │   └── useFieldUsage.ts               ⭐ NEW - Field usage count hook
│       └── utils/
│           └── fieldValidation.ts             ⭐ System field check
├── lib/
│   └── api/
│       └── fields.api.ts                      ⭐ deleteField() ekle
└── components/
    └── ui/
        └── Dialog.tsx                         ⭐ Reusable dialog component
```

### Component Implementation

#### DeleteFieldButton.tsx
```typescript
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteFieldDialog } from './DeleteFieldDialog';
import type { Field } from '@/features/fields/types/field.types';

interface DeleteFieldButtonProps {
  field: Field;
}

export const DeleteFieldButton = ({ field }: DeleteFieldButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sistem field'ları silinemez
  if (field.is_system_field) {
    return (
      <button
        disabled
        className="p-2 text-gray-300 cursor-not-allowed"
        title="System fields cannot be deleted"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
        title="Delete field"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <DeleteFieldDialog
        field={field}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};
```

#### DeleteFieldDialog.tsx
```typescript
import { useState } from 'react';
import { useDeleteField } from '../hooks/useDeleteField';
import { useFieldUsage } from '../hooks/useFieldUsage';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertTriangle } from 'lucide-react';
import type { Field } from '@/features/fields/types/field.types';

interface DeleteFieldDialogProps {
  field: Field;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteFieldDialog = ({
  field,
  isOpen,
  onClose,
}: DeleteFieldDialogProps) => {
  const [confirmText, setConfirmText] = useState('');
  const { mutate: deleteField, isPending } = useDeleteField();
  const { data: usage, isLoading: usageLoading } = useFieldUsage(field.id, isOpen);

  const handleDelete = () => {
    deleteField(field.id, {
      onSuccess: () => {
        onClose();
        setConfirmText('');
      },
    });
  };

  const isConfirmed = confirmText === field.name;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="⚠️ Delete Field?">
      <div className="space-y-4">
        {/* Field Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="font-medium text-gray-900">{field.name}</div>
          <div className="text-sm text-gray-600">Type: {field.type}</div>
        </div>

        {/* Warning Box */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-red-900">
                WARNING: This action cannot be undone!
              </p>
              <p className="text-red-800">This will permanently delete:</p>

              {usageLoading ? (
                <div className="text-red-700">Loading usage data...</div>
              ) : (
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>{usage?.object_count || 0} object-field relationships</li>
                  <li>{usage?.record_count || 0} record values</li>
                </ul>
              )}

              {usage?.objects && usage.objects.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-red-800 mb-1">
                    Objects using this field:
                  </p>
                  <ul className="list-disc list-inside text-red-700 space-y-0.5">
                    {usage.objects.map((obj) => (
                      <li key={obj.id}>{obj.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type field name to confirm:{' '}
            <span className="text-red-600 font-semibold">{field.name}</span>
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Type "${field.name}" to confirm`}
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={!isConfirmed || isPending}
            loading={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete Field'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
```

#### useDeleteField.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteFieldAPI } from '@/lib/api/fields.api';
import { toast } from '@/components/ui/Toast';

export const useDeleteField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      await deleteFieldAPI(fieldId);
    },
    onMutate: async (fieldId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['fields'] });

      // Snapshot previous value
      const previousFields = queryClient.getQueryData(['fields']);

      // Optimistically update (remove from cache)
      queryClient.setQueryData(['fields'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          results: old.results.filter((f: any) => f.id !== fieldId),
        };
      });

      return { previousFields };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['fields'] });

      toast.success('Field deleted successfully');
    },
    onError: (error: any, fieldId, context) => {
      // Rollback on error
      if (context?.previousFields) {
        queryClient.setQueryData(['fields'], context.previousFields);
      }

      const errorMessage = error.response?.status === 404
        ? 'Field not found'
        : error.response?.status === 403
        ? 'Cannot delete system field'
        : 'Failed to delete field';

      toast.error(errorMessage);
    },
  });
};
```

#### useFieldUsage.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getFieldUsageAPI } from '@/lib/api/fields.api';

interface FieldUsage {
  object_count: number;
  record_count: number;
  objects: Array<{ id: string; name: string }>;
}

export const useFieldUsage = (fieldId: string, enabled: boolean = true) => {
  return useQuery<FieldUsage>({
    queryKey: ['field-usage', fieldId],
    queryFn: () => getFieldUsageAPI(fieldId),
    enabled, // Only fetch when dialog is open
    staleTime: 0, // Always fetch fresh data
  });
};
```

#### fields.api.ts (Add delete function)
```typescript
import axios from 'axios';
import { getAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
});

// Delete field
export const deleteFieldAPI = async (fieldId: string): Promise<void> => {
  await axios.delete(
    `${API_BASE_URL}/api/fields/${fieldId}`,
    {
      headers: getAuthHeaders(),
    }
  );
};

// Get field usage statistics
export const getFieldUsageAPI = async (fieldId: string) => {
  // TODO: Backend endpoint için ticket oluştur
  // Şimdilik object-fields count ile çalış
  const { data } = await axios.get(
    `${API_BASE_URL}/api/object-fields?field_id=${fieldId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return {
    object_count: data.results.length,
    record_count: 0, // TODO: Backend'den gelecek
    objects: data.results.map((of: any) => ({
      id: of.object_id,
      name: of.object_name || 'Unknown',
    })),
  };
};
```

#### Button.tsx (Add danger variant)
```typescript
interface ButtonProps {
  variant?: 'primary' | 'outline' | 'danger';
  // ... other props
}

export const Button = ({ variant = 'primary', ...props }: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'border-2 border-gray-300 hover:bg-gray-50 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${variantClasses[variant]}`}
      {...props}
    />
  );
};
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - Mutations & optimistic updates
- `axios` - HTTP client
- `lucide-react` - Icons (Trash2, AlertTriangle)

### UI Components (To Be Built)
- `Dialog` component (React Aria)
- `Button` component with danger variant
- `Input` component
- `Toast` notification system

---

## Acceptance Criteria

- [ ] Delete button her field'da görünüyor (sistem field'lar hariç)
- [ ] Sistem field'ları (is_system_field=true) silinemez
- [ ] Delete button tıklanınca confirmation dialog açılıyor
- [ ] Dialog'da field bilgileri gösteriliyor
- [ ] Dialog'da field usage count gösteriliyor
- [ ] Dialog'da field kullanan object'ler listeleniyor
- [ ] Confirmation için field name yazılması gerekiyor
- [ ] Doğru field name yazılmadan delete button disabled
- [ ] Delete button danger styling (red)
- [ ] API call başarılı olunca 204 döner
- [ ] Başarılı silme sonrası success toast gösteriliyor
- [ ] Başarılı silme sonrası field listeden kaldırılıyor (optimistic update)
- [ ] Hata durumunda error toast gösteriliyor
- [ ] Hata durumunda optimistic update rollback yapılıyor
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Dialog kapatıldığında confirmation input temizleniyor

---

## Testing Checklist

### Manual Testing
- [ ] Normal field silme → success
- [ ] Sistem field silmeye çalışma → disabled/error
- [ ] Yanlış field name yazma → button disabled
- [ ] Doğru field name → button enabled
- [ ] API call sırasında cancel → dialog kapanır
- [ ] Network error → error toast + rollback
- [ ] 404 error → "Field not found" mesajı
- [ ] 403 error → "Cannot delete system field" mesajı
- [ ] Success → toast + field listeden kaybolur
- [ ] Field usage count doğru gösteriliyor
- [ ] Object listesi doğru gösteriliyor
- [ ] Optimistic update çalışıyor
- [ ] Rollback çalışıyor (error durumunda)

### Test Scenarios

#### Scenario 1: Delete Custom Field
```typescript
Field: "Email Address" (custom)
- is_system_field: false
- Used in 3 objects
- 150 records with data

Expected:
✓ Delete button görünür
✓ Dialog açılır
✓ Warning mesajı gösterir
✓ 3 objects listeler
✓ 150 record count gösterir
✓ Field name confirmation gerektirir
✓ Delete başarılı → 204
✓ Success toast gösterir
✓ Listeden kaldırılır
```

#### Scenario 2: Try Delete System Field
```typescript
Field: "Created At" (system)
- is_system_field: true

Expected:
✓ Delete button disabled veya
✓ Delete button tıklanınca error dialog
✓ "Cannot delete system field" mesajı
✓ API call yapılmaz
```

#### Scenario 3: Network Error
```typescript
Expected:
✓ Optimistic update (field hemen kaybolur)
✓ API error
✓ Rollback (field geri gelir)
✓ Error toast gösterir
```

---

## Code Examples

### Complete Delete Flow
```typescript
// 1. User clicks delete button
// 2. DeleteFieldDialog opens
// 3. Fetch field usage (objects, record count)
// 4. Show warning with usage info
// 5. User types field name to confirm
// 6. Confirmation validated
// 7. Delete button enabled
// 8. User clicks "Delete Field"
// 9. Optimistic update (remove from cache)
// 10. API call DELETE /api/fields/{field_id}
// 11. Success: 204 response
// 12. Invalidate queries (refetch list)
// 13. Show success toast
// 14. Close dialog
```

### Error Handling
```typescript
// fields.api.ts
export const deleteFieldAPI = async (fieldId: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/fields/${fieldId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Field not found');
    }
    if (error.response?.status === 403) {
      throw new Error('Cannot delete system field');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to delete field');
  }
};
```

### Optimistic Update & Rollback
```typescript
// useDeleteField.ts
onMutate: async (fieldId) => {
  // Cancel queries
  await queryClient.cancelQueries({ queryKey: ['fields'] });

  // Snapshot
  const previousFields = queryClient.getQueryData(['fields']);

  // Optimistic update
  queryClient.setQueryData(['fields'], (old: any) => {
    return {
      ...old,
      results: old.results.filter((f: any) => f.id !== fieldId),
    };
  });

  return { previousFields };
},
onError: (error, fieldId, context) => {
  // Rollback
  if (context?.previousFields) {
    queryClient.setQueryData(['fields'], context.previousFields);
  }
},
```

---

## Resources

### Backend Documentation
- [DELETE /api/fields/{field_id}](../../backend-docs/api/02-fields/05-delete-field.md) - Detailed endpoint documentation
- [GET /api/object-fields](../../backend-docs/api/07-object-fields/02-list-object-fields.md) - Field usage query

### Frontend Libraries
- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [React Aria Dialog](https://react-spectrum.adobe.com/react-aria/Dialog.html)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Delete Field task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/03-fields-library/04-delete-field.md

Requirements:
1. Create src/features/fields/components/DeleteFieldButton.tsx - Delete trigger button (with system field check)
2. Create src/features/fields/components/DeleteFieldDialog.tsx - Confirmation dialog with warning message
3. Create src/features/fields/hooks/useDeleteField.ts - TanStack Query mutation hook with optimistic updates
4. Create src/features/fields/hooks/useFieldUsage.ts - Field usage statistics hook
5. Update src/lib/api/fields.api.ts - Add deleteFieldAPI() and getFieldUsageAPI() functions
6. Update src/components/ui/Button.tsx - Add danger variant (red styling)
7. Create src/components/ui/Dialog.tsx - Reusable dialog component (React Aria)
8. Update FieldListItem.tsx - Add DeleteFieldButton component

CRITICAL REQUIREMENTS:
- CASCADE delete warning - show object count, record count, object names
- System fields (is_system_field=true) CANNOT be deleted
- Confirmation required - user must type field name exactly
- Danger button styling (red) for delete action
- Optimistic updates - remove from cache immediately
- Rollback on error - restore field if delete fails
- Success toast notification
- Error toast with specific messages (404, 403, network)
- Loading state (button disabled + spinner)
- Dialog cleanup on close (reset confirmation input)

API Details:
- DELETE /api/fields/{field_id}
- Response: 204 No Content (success)
- Errors: 404 (not found), 403 (system field), 401 (auth)

Follow the exact code examples and component structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 05-field-detail-page.md
