# Task: Edit Record Form

**Priority:** 🟡 Medium
**Estimated Time:** 2 gün
**Dependencies:** 02-create-record-form

---

## Objective

Mevcut record'ları düzenlemek için inline ve modal editing modları ile form oluşturmak. Backend'in MERGE davranışını kullanarak sadece değiştirilen field'ları göndermek.

---

## Backend API

### Endpoint
```
PATCH /api/records/{record_id}
```

### Request Format
```typescript
interface UpdateRecordRequest {
  data: Record<string, any>; // Sadece değiştirilen field'lar!
}
```

**CRITICAL: PARTIAL UPDATE**
- Backend JSONB data'yı MERGE eder (replace etmez!)
- Sadece gönderilen field'lar güncellenir
- Diğer field'lar korunur
- Frontend sadece değiştirilen field'ları göndermelidir

### Response
```json
{
  "id": "rec_a1b2c3d4",
  "object_id": "obj_contact",
  "data": {
    "fld_name": "Ali Yılmaz",              // Değişmedi (gönderilmedi)
    "fld_email": "newemail@example.com",   // Güncellendi
    "fld_phone": "+90 555 9876543",        // Güncellendi
    "fld_company": "Acme Corp"             // Değişmedi (gönderilmedi)
  },
  "primary_value": "Ali Yılmaz",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "updated_by": "550e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T11:30:00Z"
}
```

### Error Responses
- `404 Not Found` - Record bulunamadı
- `403 Forbidden` - Record başka tenant'a ait
- `422 Unprocessable Entity` - Validation hatası

**Backend Documentation:**
→ [PATCH /api/records/{record_id}](../../backend-docs/api/04-records/04-update-record.md)

---

## Backend MERGE Davranışı

### Python Backend Logic
```python
# Backend service (app/services/record_service.py)
async def update_record(record_id: str, record_in: RecordUpdate):
    record = await get_by_id(record_id)

    # MERGE data (don't replace!)
    if record_in.data:
        record.data = {**record.data, **record_in.data}

    # Auto-update primary_value and updated_at
    record.primary_value = extract_primary_value(record.data)
    record.updated_by = current_user.id
    record.updated_at = datetime.now()

    await db.commit()
    return record
```

### Merge Örneği
```python
# Mevcut data
current_data = {
    "fld_name": "Ali Yılmaz",
    "fld_email": "old@example.com",
    "fld_company": "Acme Corp"
}

# Frontend'den gelen update (sadece email değişti)
update_data = {
    "fld_email": "new@example.com"
}

# Backend merge sonucu
merged_data = {**current_data, **update_data}
# {
#   "fld_name": "Ali Yılmaz",       // Korundu
#   "fld_email": "new@example.com", // Güncellendi
#   "fld_company": "Acme Corp"      // Korundu
# }
```

**Frontend Görevi:**
- Form'da hangi field'ların değiştiğini takip et (dirty state)
- Sadece değiştirilen field'ları API'ye gönder
- Tüm data objesini gönderme!

---

## UI/UX Design

### 1. Inline Edit Mode (Table Cell)
```
┌─────────────────────────────────────────────┐
│ Name          │ Email           │ Actions   │
├───────────────┼─────────────────┼───────────┤
│ Ali Yılmaz    │ ali@example.com │ [Edit]    │  ← Normal state
├───────────────┼─────────────────┼───────────┤
│ Ayşe Kaya     │ [ayse@...     ] │ [✓] [✗]   │  ← Edit state
│               │ ▼ Input active  │            │
└─────────────────────────────────────────────┘

Davranış:
1. Cell'e tıkla → Input açılır
2. Değeri değiştir
3. [✓] Save / [✗] Cancel
4. Enter → Save, Esc → Cancel
5. Auto-save option (debounced)
```

### 2. Modal Edit Mode (Full Form)
```
┌───────────────────────────────────────────────┐
│  Edit Contact                            [✗]  │
├───────────────────────────────────────────────┤
│                                               │
│  Name                                         │
│  [Ali Yılmaz            ]                     │
│                                               │
│  Email                                        │
│  [ali@example.com       ]                     │
│                                               │
│  Phone                                        │
│  [+90 555 1234567       ]                     │
│                                               │
│  Company                                      │
│  [Acme Corp             ]                     │
│                                               │
│  ⚠️ Unsaved changes                          │
│  [Cancel]  [Save Changes]                     │
│                                               │
└───────────────────────────────────────────────┘
```

### Form States
- **Idle** - Form pre-populated, tüm field'lar dolu
- **Editing** - Kullanıcı field değiştiriyor (dirty state)
- **Saving** - API call yapılıyor (optimistic update)
- **Success** - Update başarılı, modal kapan / cell update
- **Error** - Hata mesajı, form açık kal

### Unsaved Changes Warning
```typescript
// Browser'ın native dialog'u
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = 'You have unsaved changes. Leave anyway?';
  }
});
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── records/
│       ├── components/
│       │   ├── EditRecordModal.tsx       ⭐ Modal edit form
│       │   ├── EditRecordForm.tsx        ⭐ Reusable form component
│       │   ├── InlineEditCell.tsx        ⭐ Inline edit cell
│       │   └── UnsavedChangesDialog.tsx  ⭐ Unsaved warning
│       ├── hooks/
│       │   ├── useEditRecord.ts          ⭐ Edit mutation (PARTIAL UPDATE)
│       │   ├── useFormDirtyTracking.ts   ⭐ Track changed fields
│       │   └── useAutoSave.ts            ⭐ Debounced auto-save
│       └── utils/
│           └── form-diff.ts              ⭐ Detect changed fields
├── lib/
│   └── api/
│       └── records.api.ts                ⭐ updateRecord API call
└── components/
    └── ui/
        └── Dialog.tsx                     ⭐ Dialog component (React Aria)
```

---

## Component Implementation

### 1. EditRecordModal.tsx
```typescript
import { Dialog } from '@/components/ui/Dialog';
import { EditRecordForm } from './EditRecordForm';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import type { Record } from '../types/records.types';

interface EditRecordModalProps {
  record: Record;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedRecord: Record) => void;
}

export const EditRecordModal = ({ record, isOpen, onClose, onSuccess }: EditRecordModalProps) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Browser warning for unsaved changes
  useUnsavedChangesWarning(hasUnsavedChanges);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Leave anyway?');
      if (!confirmed) return;
    }
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Record"
      size="large"
    >
      <EditRecordForm
        record={record}
        onSuccess={(updated) => {
          setHasUnsavedChanges(false);
          onSuccess?.(updated);
          onClose();
        }}
        onDirtyChange={setHasUnsavedChanges}
      />
    </Dialog>
  );
};
```

### 2. EditRecordForm.tsx
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditRecord } from '../hooks/useEditRecord';
import { getChangedFields } from '../utils/form-diff';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Record, FieldDefinition } from '../types/records.types';

interface EditRecordFormProps {
  record: Record;
  fields: FieldDefinition[]; // Field definitions from object schema
  onSuccess?: (updatedRecord: Record) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  autoSave?: boolean; // Enable auto-save mode
}

export const EditRecordForm = ({
  record,
  fields,
  onSuccess,
  onDirtyChange,
  autoSave = false
}: EditRecordFormProps) => {
  const { register, handleSubmit, formState, watch, reset } = useForm({
    defaultValues: record.data, // Pre-populate with existing data
    resolver: zodResolver(generateSchema(fields)),
  });

  const { mutate: updateRecord, isPending } = useEditRecord();

  // Track dirty state
  const formValues = watch();
  const isDirty = formState.isDirty;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Auto-save with debounce (optional)
  const debouncedSave = useMemo(
    () => debounce((values: any) => {
      const changedFields = getChangedFields(record.data, values);
      if (Object.keys(changedFields).length > 0) {
        updateRecord({ recordId: record.id, data: changedFields });
      }
    }, 2000),
    [record.id, record.data, updateRecord]
  );

  useEffect(() => {
    if (autoSave && isDirty) {
      debouncedSave(formValues);
    }
  }, [formValues, autoSave, isDirty, debouncedSave]);

  const onSubmit = (values: any) => {
    // CRITICAL: Only send changed fields!
    const changedFields = getChangedFields(record.data, values);

    if (Object.keys(changedFields).length === 0) {
      console.log('No changes detected');
      return;
    }

    console.log('Changed fields:', changedFields);

    updateRecord({
      recordId: record.id,
      data: changedFields, // Only changed fields!
    }, {
      onSuccess: (updatedRecord) => {
        reset(updatedRecord.data); // Update form with new data
        onSuccess?.(updatedRecord);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.name}
            {field.required && <span className="text-red-500">*</span>}
          </label>

          {/* Render field based on type */}
          {renderField(field, register, formState.errors)}
        </div>
      ))}

      {isDirty && !autoSave && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span>You have unsaved changes</span>
        </div>
      )}

      {autoSave && isDirty && (
        <div className="text-sm text-gray-600">
          Auto-saving...
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset(record.data)}
          disabled={!isDirty || isPending}
        >
          Reset
        </Button>

        <Button
          type="submit"
          disabled={!isDirty || isPending}
          loading={isPending}
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
```

### 3. InlineEditCell.tsx
```typescript
import { useState, useRef, useEffect } from 'react';
import { useEditRecord } from '../hooks/useEditRecord';
import { Input } from '@/components/ui/Input';

interface InlineEditCellProps {
  recordId: string;
  fieldId: string;
  value: string;
  onSave?: (newValue: string) => void;
}

export const InlineEditCell = ({ recordId, fieldId, value, onSave }: InlineEditCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateRecord, isPending } = useEditRecord();

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    // Only send changed field
    updateRecord({
      recordId,
      data: { [fieldId]: editValue },
    }, {
      onSuccess: () => {
        setIsEditing(false);
        onSave?.(editValue);
      },
      onError: () => {
        setEditValue(value); // Revert on error
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded min-h-[40px] flex items-center"
      >
        {value || <span className="text-gray-400">Click to edit</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        disabled={isPending}
        className="flex-1"
      />

      <button
        onClick={handleSave}
        disabled={isPending}
        className="text-green-600 hover:text-green-700 px-2"
        title="Save"
      >
        ✓
      </button>

      <button
        onClick={handleCancel}
        disabled={isPending}
        className="text-red-600 hover:text-red-700 px-2"
        title="Cancel"
      >
        ✗
      </button>
    </div>
  );
};
```

### 4. useEditRecord.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRecordAPI } from '@/lib/api/records.api';
import type { Record } from '../types/records.types';

interface UpdateRecordParams {
  recordId: string;
  data: Record<string, any>; // Only changed fields!
}

export const useEditRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, data }: UpdateRecordParams) => {
      console.log('Updating record with partial data:', data);
      return updateRecordAPI(recordId, data);
    },

    // Optimistic update
    onMutate: async ({ recordId, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['records'] });
      await queryClient.cancelQueries({ queryKey: ['record', recordId] });

      // Snapshot previous values
      const previousRecords = queryClient.getQueryData(['records']);
      const previousRecord = queryClient.getQueryData(['record', recordId]);

      // Optimistically update cache
      queryClient.setQueryData(['record', recordId], (old: Record | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: { ...old.data, ...data }, // Merge changes
          updated_at: new Date().toISOString(),
        };
      });

      queryClient.setQueryData(['records'], (old: Record[] | undefined) => {
        if (!old) return old;
        return old.map((record) =>
          record.id === recordId
            ? { ...record, data: { ...record.data, ...data } }
            : record
        );
      });

      return { previousRecords, previousRecord };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousRecords) {
        queryClient.setQueryData(['records'], context.previousRecords);
      }
      if (context?.previousRecord) {
        queryClient.setQueryData(['record', variables.recordId], context.previousRecord);
      }
      console.error('Update failed:', error);
    },

    onSuccess: (updatedRecord) => {
      // Update cache with server response
      queryClient.setQueryData(['record', updatedRecord.id], updatedRecord);
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
};
```

### 5. useFormDirtyTracking.ts
```typescript
import { useEffect, useState } from 'react';
import { useFormState, UseFormWatch } from 'react-hook-form';

/**
 * Track which specific fields have changed
 */
export const useFormDirtyTracking = <T extends Record<string, any>>(
  watch: UseFormWatch<T>,
  initialValues: T
) => {
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const formValues = watch();

  useEffect(() => {
    const changed = new Set<string>();

    Object.keys(formValues).forEach((key) => {
      if (formValues[key] !== initialValues[key]) {
        changed.add(key);
      }
    });

    setDirtyFields(changed);
  }, [formValues, initialValues]);

  return dirtyFields;
};
```

### 6. useAutoSave.ts
```typescript
import { useEffect, useRef } from 'react';
import { debounce } from '@/utils/debounce';

interface UseAutoSaveOptions {
  onSave: (values: any) => void;
  delay?: number; // Debounce delay in ms (default: 2000)
  enabled?: boolean;
}

/**
 * Auto-save form with debouncing
 */
export const useAutoSave = (
  values: any,
  { onSave, delay = 2000, enabled = true }: UseAutoSaveOptions
) => {
  const debouncedSave = useRef(
    debounce((vals: any) => {
      console.log('Auto-saving...', vals);
      onSave(vals);
    }, delay)
  ).current;

  useEffect(() => {
    if (enabled && values) {
      debouncedSave(values);
    }

    return () => {
      debouncedSave.cancel?.();
    };
  }, [values, enabled, debouncedSave]);
};
```

### 7. form-diff.ts
```typescript
/**
 * Get only the fields that have changed
 */
export const getChangedFields = <T extends Record<string, any>>(
  original: T,
  updated: T
): Partial<T> => {
  const changes: Partial<T> = {};

  Object.keys(updated).forEach((key) => {
    if (updated[key] !== original[key]) {
      changes[key as keyof T] = updated[key];
    }
  });

  return changes;
};

/**
 * Deep comparison for nested objects
 */
export const getChangedFieldsDeep = <T extends Record<string, any>>(
  original: T,
  updated: T
): Partial<T> => {
  const changes: Partial<T> = {};

  Object.keys(updated).forEach((key) => {
    const originalValue = original[key];
    const updatedValue = updated[key];

    // Deep comparison for objects
    if (
      typeof originalValue === 'object' &&
      typeof updatedValue === 'object' &&
      !Array.isArray(originalValue) &&
      !Array.isArray(updatedValue)
    ) {
      const nestedChanges = getChangedFieldsDeep(originalValue, updatedValue);
      if (Object.keys(nestedChanges).length > 0) {
        changes[key as keyof T] = nestedChanges as any;
      }
    } else if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
      changes[key as keyof T] = updatedValue;
    }
  });

  return changes;
};
```

### 8. records.api.ts (Update function)
```typescript
import axios from 'axios';
import { getAuthToken } from '@/utils/storage';
import type { Record, UpdateRecordData } from '../features/records/types/records.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Update record (PARTIAL UPDATE)
 * Only send changed fields!
 */
export const updateRecordAPI = async (
  recordId: string,
  data: Record<string, any> // Only changed fields
): Promise<Record> => {
  const token = getAuthToken();

  const { data: response } = await axios.patch<Record>(
    `${API_BASE_URL}/api/records/${recordId}`,
    { data }, // { data: { fld_email: "new@example.com" } }
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response;
};
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@tanstack/react-query` - API state management (optimistic updates)
- `axios` - HTTP client

### New Utilities (To Be Created)
- `getChangedFields` - Detect changed fields
- `useFormDirtyTracking` - Track dirty state
- `useAutoSave` - Debounced auto-save
- `useUnsavedChangesWarning` - Browser warning

---

## Acceptance Criteria

- [ ] Modal edit form çalışıyor (tüm field'lar pre-populated)
- [ ] Inline edit mode çalışıyor (cell tıkla → edit)
- [ ] Sadece değiştirilen field'lar API'ye gönderiliyor (PARTIAL UPDATE)
- [ ] Backend merge doğru çalışıyor (diğer field'lar korunuyor)
- [ ] Optimistic update çalışıyor (UI hemen güncelleniyor)
- [ ] Hata durumunda rollback çalışıyor
- [ ] Unsaved changes warning çalışıyor
- [ ] Auto-save mode çalışıyor (debounced)
- [ ] Enter → Save, Esc → Cancel (inline edit)
- [ ] Reset button çalışıyor (değişiklikleri geri al)
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Form validation çalışıyor (required fields)
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing

#### Modal Edit
- [ ] Modal açılıyor, field'lar pre-populated
- [ ] Field değiştir → isDirty = true
- [ ] Save → Sadece değiştirilen field'lar gönderiliyor
- [ ] Backend response'da tüm field'lar mevcut
- [ ] Reset button → Form orijinal değerlere dönüyor
- [ ] Modal kapat (unsaved) → Warning gösteriliyor

#### Inline Edit
- [ ] Cell tıkla → Input açılıyor
- [ ] Enter → Save
- [ ] Esc → Cancel
- [ ] Click outside → Save (blur)
- [ ] Loading state görünüyor

#### Auto-save
- [ ] Auto-save enabled → 2 saniye sonra save
- [ ] Sürekli yazarken her tuşta save olmuyor (debounce)
- [ ] Network error → Error handling

#### Partial Update
- [ ] Network tab → Sadece değiştirilen field'lar gönderiliyor
- [ ] Backend response → Tüm field'lar merge edilmiş
- [ ] Diğer field'lar korunuyor

#### Optimistic Update
- [ ] Save → UI hemen güncelleniyor
- [ ] Network yavaşsa bile UI responsive
- [ ] Error → Rollback çalışıyor

---

## Code Examples

### Partial Update Flow
```typescript
// 1. User opens edit form
const record = {
  id: 'rec_123',
  data: {
    fld_name: 'Ali Yılmaz',
    fld_email: 'old@example.com',
    fld_phone: '+90 555 1111111',
    fld_company: 'Acme Corp'
  }
};

// 2. User changes only email
const formValues = {
  fld_name: 'Ali Yılmaz',        // Unchanged
  fld_email: 'new@example.com',  // Changed
  fld_phone: '+90 555 1111111',  // Unchanged
  fld_company: 'Acme Corp'       // Unchanged
};

// 3. Detect changed fields
const changedFields = getChangedFields(record.data, formValues);
// { fld_email: 'new@example.com' }

// 4. Send only changed fields to API
updateRecord({
  recordId: 'rec_123',
  data: { fld_email: 'new@example.com' } // Only this!
});

// 5. Backend merges data
// result.data = {...current_data, ...update_data}
// {
//   fld_name: 'Ali Yılmaz',       // Korundu
//   fld_email: 'new@example.com', // Güncellendi
//   fld_phone: '+90 555 1111111', // Korundu
//   fld_company: 'Acme Corp'      // Korundu
// }
```

### Field Silme
```typescript
// Field'ı null yapma
updateRecord({
  recordId: 'rec_123',
  data: { fld_phone: null }
});

// Backend response
{
  data: {
    fld_name: 'Ali Yılmaz',
    fld_email: 'ali@example.com',
    fld_phone: null // Null olarak ayarlandı
  }
}
```

### Optimistic Update
```typescript
// TanStack Query optimistic update
onMutate: async ({ recordId, data }) => {
  // 1. Cancel outgoing queries
  await queryClient.cancelQueries(['records']);

  // 2. Snapshot previous value
  const previous = queryClient.getQueryData(['record', recordId]);

  // 3. Optimistically update UI
  queryClient.setQueryData(['record', recordId], (old) => ({
    ...old,
    data: { ...old.data, ...data }, // Merge immediately
  }));

  return { previous };
},

onError: (error, variables, context) => {
  // 4. Rollback on error
  queryClient.setQueryData(['record', variables.recordId], context.previous);
},

onSuccess: (response) => {
  // 5. Update with server response
  queryClient.setQueryData(['record', response.id], response);
}
```

---

## Resources

### Backend Documentation
- [PATCH /api/records/{record_id}](../../backend-docs/api/04-records/04-update-record.md) - Detailed endpoint documentation
- [Frontend Developer Guide](../../backend-docs/api/00-FRONTEND-GUIDE.md) - Complete frontend guide

### Frontend Libraries
- [React Hook Form Docs](https://react-hook-form.com/) - Form management
- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates) - Optimistic updates
- [React Aria Dialog](https://react-spectrum.adobe.com/react-aria/Dialog.html) - Accessible dialogs

### Related Tasks
- [02-create-record-form.md](02-create-record-form.md) - Create form (reuse logic)
- [01-records-list.md](01-records-list.md) - Records list (integration)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Edit Record Form task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/06-records-table/03-edit-record-form.md

Requirements:
1. Create src/features/records/components/EditRecordModal.tsx - Modal edit form with unsaved changes warning
2. Create src/features/records/components/EditRecordForm.tsx - Reusable edit form (pre-populated, dirty tracking)
3. Create src/features/records/components/InlineEditCell.tsx - Inline edit cell (click → edit → save)
4. Create src/features/records/hooks/useEditRecord.ts - TanStack Query mutation with optimistic updates
5. Create src/features/records/hooks/useFormDirtyTracking.ts - Track which fields changed
6. Create src/features/records/hooks/useAutoSave.ts - Debounced auto-save hook
7. Create src/features/records/utils/form-diff.ts - getChangedFields utility
8. Update src/lib/api/records.api.ts - Add updateRecordAPI function

CRITICAL REQUIREMENTS:
- Backend MERGE behavior: Only send changed fields (PARTIAL UPDATE)!
- Use getChangedFields to detect which fields user modified
- Don't send entire data object, only changed fields
- Backend merges: {…current_data, …update_data}
- Implement optimistic updates (UI updates immediately)
- Rollback on error
- Unsaved changes warning (beforeunload)
- Auto-save option (2s debounce)
- Inline edit: Enter → Save, Esc → Cancel
- Modal edit: Full form with all fields
- Mobile responsive design with Tailwind CSS 4

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 04-delete-record-confirmation.md
