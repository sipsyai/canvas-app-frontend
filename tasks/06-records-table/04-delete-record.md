# Task: Delete Record

**Priority:** 🟡 Medium
**Estimated Time:** 0.5 gün
**Dependencies:** 01-records-table-view, 09-ui-components (Dialog)

---

## Objective

Record silme işlemi için confirmation dialog ve optimistic update ile kullanıcı dostu bir delete flow oluşturmak.

---

## Backend API

### Endpoint
```
DELETE /api/records/{record_id}
```

### Request Format
```typescript
// Path parameter
interface DeleteRecordRequest {
  record_id: string; // Record ID (e.g., "rec_a1b2c3d4")
}
```

### Response
**204 No Content** - Response body yok

### Error Responses
- `404 Not Found` - Record bulunamadı
- `401 Unauthorized` - Token geçersiz

### CASCADE Davranışı
Record silindiğinde şunlar da silinir:
1. **relationship_records:** Bu record'un tüm ilişki bağlantıları (CASCADE)

**UYARI:** Object silmekten daha az kritik (CASCADE ile sadece relationship bağlantıları silinir, field verileri silinmez).

**Backend Documentation:**
→ [DELETE /api/records/{record_id}](../../backend-docs/api/04-records/05-delete-record.md)

---

## UI/UX Design

### Confirmation Dialog
```
┌─────────────────────────────────────────┐
│  ⚠️  Delete Record                      │
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to delete this  │
│  record?                                │
│                                         │
│  Record: "John Doe"                     │
│                                         │
│  ⚠️ This action cannot be undone.       │
│                                         │
│  The following will be deleted:         │
│  • All relationship connections        │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │   Cancel    │  │   Delete    │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

### Bulk Delete Dialog
```
┌─────────────────────────────────────────┐
│  ⚠️  Delete Multiple Records            │
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to delete        │
│  3 selected records?                    │
│                                         │
│  Selected records:                      │
│  • "John Doe"                           │
│  • "Jane Smith"                         │
│  • "Bob Johnson"                        │
│                                         │
│  ⚠️ This action cannot be undone.       │
│                                         │
│  All relationship connections for       │
│  these records will be deleted.         │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │   Cancel    │  │ Delete All  │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

### Table Row Actions
```
┌──────────────────────────────────────────────┐
│ Name         │ Email            │ Actions   │
├──────────────┼──────────────────┼───────────┤
│ John Doe     │ john@example.com │ [•••]     │ ← Dropdown menu
│                                              │
│  ┌─────────────────────┐                    │
│  │ ✏️  Edit            │                    │
│  │ 🔗 Relationships    │                    │
│  │ ─────────────────   │                    │
│  │ 🗑️  Delete         │ ← Kırmızı renk     │
│  └─────────────────────┘                    │
└──────────────────────────────────────────────┘
```

### Bulk Selection Toolbar
```
┌──────────────────────────────────────────────┐
│  3 records selected                          │
│                                              │
│  [Delete Selected]  [Clear Selection]       │
└──────────────────────────────────────────────┘
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── records/
│       ├── components/
│       │   ├── RecordsTable.tsx           📝 Update (add delete action)
│       │   ├── DeleteRecordDialog.tsx     ⭐ New component
│       │   └── BulkDeleteDialog.tsx       ⭐ New component
│       └── hooks/
│           ├── useDeleteRecord.ts         ⭐ Delete mutation hook
│           └── useBulkDeleteRecords.ts    ⭐ Bulk delete hook
├── lib/
│   └── api/
│       └── records.api.ts                 📝 Update (add deleteRecord)
└── components/
    └── ui/
        └── Dialog.tsx                     ⭐ Reusable dialog component
```

### Component Implementation

#### DeleteRecordDialog.tsx
```typescript
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useDeleteRecord } from '../hooks/useDeleteRecord';
import type { Record } from '../types/record.types';

interface DeleteRecordDialogProps {
  record: Record | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteRecordDialog = ({
  record,
  open,
  onOpenChange
}: DeleteRecordDialogProps) => {
  const { mutate: deleteRecord, isPending } = useDeleteRecord();

  if (!record) return null;

  const handleDelete = () => {
    deleteRecord(record.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const primaryValue = record.data.primary_value || 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title className="flex items-center gap-2 text-red-600">
            <span className="text-2xl">⚠️</span>
            Delete Record
          </Dialog.Title>
        </Dialog.Header>

        <div className="space-y-4 py-4">
          <p className="text-gray-700">
            Are you sure you want to delete this record?
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">Record:</p>
            <p className="font-semibold text-gray-900">{primaryValue}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ This action cannot be undone.
            </p>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• All relationship connections will be deleted</li>
            </ul>
          </div>
        </div>

        <Dialog.Footer>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={isPending}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
```

#### BulkDeleteDialog.tsx
```typescript
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useBulkDeleteRecords } from '../hooks/useBulkDeleteRecords';
import type { Record } from '../types/record.types';

interface BulkDeleteDialogProps {
  records: Record[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const BulkDeleteDialog = ({
  records,
  open,
  onOpenChange,
  onSuccess
}: BulkDeleteDialogProps) => {
  const { mutate: bulkDelete, isPending } = useBulkDeleteRecords();

  const handleDelete = () => {
    const recordIds = records.map(r => r.id);

    bulkDelete(recordIds, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title className="flex items-center gap-2 text-red-600">
            <span className="text-2xl">⚠️</span>
            Delete Multiple Records
          </Dialog.Title>
        </Dialog.Header>

        <div className="space-y-4 py-4">
          <p className="text-gray-700">
            Are you sure you want to delete{' '}
            <strong>{records.length}</strong> selected records?
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-2">Selected records:</p>
            <ul className="space-y-1">
              {records.map((record) => (
                <li key={record.id} className="text-sm text-gray-900">
                  • {record.data.primary_value || 'Unknown'}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ This action cannot be undone.
            </p>
            <p className="mt-2 text-sm text-yellow-700">
              All relationship connections for these records will be deleted.
            </p>
          </div>
        </div>

        <Dialog.Footer>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={isPending}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete All'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
```

#### useDeleteRecord.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRecord } from '@/lib/api/records.api';
import { toast } from 'sonner';
import type { Record } from '../types/record.types';

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      await deleteRecord(recordId);
      return recordId;
    },

    // Optimistic update: Remove row immediately
    onMutate: async (recordId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['records'] });

      // Snapshot previous value
      const previousRecords = queryClient.getQueryData<Record[]>(['records']);

      // Optimistically update cache
      queryClient.setQueryData<Record[]>(['records'], (old) => {
        return old?.filter((record) => record.id !== recordId) || [];
      });

      return { previousRecords };
    },

    onSuccess: () => {
      toast.success('Record deleted successfully');
    },

    onError: (error: any, recordId, context) => {
      // Rollback on error: Restore the row
      if (context?.previousRecords) {
        queryClient.setQueryData(['records'], context.previousRecords);
      }

      const errorMessage = error?.response?.data?.detail || 'Failed to delete record';
      toast.error(errorMessage);
    },

    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
};
```

#### useBulkDeleteRecords.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRecord } from '@/lib/api/records.api';
import { toast } from 'sonner';
import type { Record } from '../types/record.types';

export const useBulkDeleteRecords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordIds: string[]) => {
      // Delete records in parallel
      const deletePromises = recordIds.map((id) => deleteRecord(id));
      await Promise.all(deletePromises);
      return recordIds;
    },

    // Optimistic update
    onMutate: async (recordIds) => {
      await queryClient.cancelQueries({ queryKey: ['records'] });

      const previousRecords = queryClient.getQueryData<Record[]>(['records']);

      queryClient.setQueryData<Record[]>(['records'], (old) => {
        return old?.filter((record) => !recordIds.includes(record.id)) || [];
      });

      return { previousRecords };
    },

    onSuccess: (recordIds) => {
      toast.success(`${recordIds.length} records deleted successfully`);
    },

    onError: (error: any, recordIds, context) => {
      if (context?.previousRecords) {
        queryClient.setQueryData(['records'], context.previousRecords);
      }

      const errorMessage = error?.response?.data?.detail || 'Failed to delete records';
      toast.error(errorMessage);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
};
```

#### records.api.ts (Update)
```typescript
import { apiClient } from './client';

// ... existing functions ...

export const deleteRecord = async (recordId: string): Promise<void> => {
  // 204 No Content response
  await apiClient.delete(`/api/records/${recordId}`);
};
```

#### RecordsTable.tsx (Update)
```typescript
import { useState } from 'react';
import { DeleteRecordDialog } from './DeleteRecordDialog';
import { BulkDeleteDialog } from './BulkDeleteDialog';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Record } from '../types/record.types';

export const RecordsTable = ({ records }: { records: Record[] }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<Record[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleDeleteClick = (record: Record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setBulkDeleteOpen(true);
  };

  const handleSelectRecord = (record: Record, checked: boolean) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, record]);
    } else {
      setSelectedRecords(selectedRecords.filter((r) => r.id !== record.id));
    }
  };

  const clearSelection = () => {
    setSelectedRecords([]);
  };

  return (
    <>
      {/* Bulk selection toolbar */}
      {selectedRecords.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <p className="text-sm text-blue-800">
            {selectedRecords.length} records selected
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteClick}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr>
            <th>
              <Checkbox
                checked={selectedRecords.length === records.length}
                onChange={(checked) => {
                  if (checked) {
                    setSelectedRecords(records);
                  } else {
                    setSelectedRecords([]);
                  }
                }}
              />
            </th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>
                <Checkbox
                  checked={selectedRecords.some((r) => r.id === record.id)}
                  onChange={(checked) => handleSelectRecord(record, checked)}
                />
              </td>
              <td>{record.data.primary_value}</td>
              <td>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteClick(record)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete dialogs */}
      <DeleteRecordDialog
        record={recordToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />

      <BulkDeleteDialog
        records={selectedRecords}
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onSuccess={clearSelection}
      />
    </>
  );
};
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - Mutation + optimistic updates
- `sonner` - Toast notifications
- `react-hook-form` - Form handling (dialog)

### UI Components (To Be Built)
- `Dialog` component (React Aria) - ⭐ Critical
- `Button` component (React Aria)
- `Checkbox` component (React Aria)

---

## Acceptance Criteria

### Single Delete
- [ ] Delete button görünüyor (dropdown menüde)
- [ ] Tıklayınca confirmation dialog açılıyor
- [ ] Dialog'da record primary_value gösteriliyor
- [ ] Dialog'da warning mesajı var (irreversible)
- [ ] Dialog'da CASCADE bilgisi var (relationship connections)
- [ ] Cancel butonu dialog'u kapatıyor
- [ ] Delete butonu API call yapıyor
- [ ] Optimistic update çalışıyor (row hemen kalkıyor)
- [ ] Başarılı delete sonrası success toast
- [ ] Hata durumunda row geri geliyor + error toast
- [ ] Loading state çalışıyor (button disabled)

### Bulk Delete
- [ ] Table'da checkbox'lar görünüyor
- [ ] Seçim yapınca toolbar görünüyor (X records selected)
- [ ] "Delete Selected" butonu çalışıyor
- [ ] Bulk delete dialog açılıyor
- [ ] Dialog'da seçili record'ların primary_value listesi var
- [ ] Bulk delete API call'ları parallel yapılıyor
- [ ] Optimistic update çalışıyor (tüm rowlar hemen kalkıyor)
- [ ] Başarılı delete sonrası success toast (X records deleted)
- [ ] Hata durumunda rowlar geri geliyor + error toast
- [ ] Clear Selection butonu çalışıyor

---

## Testing Checklist

### Manual Testing
- [ ] Single delete → confirmation dialog → success
- [ ] Single delete → cancel → dialog kapanıyor
- [ ] Single delete → API error → row restored + error toast
- [ ] Bulk select (3 records) → delete → success
- [ ] Bulk delete → cancel → dialog kapanıyor
- [ ] Bulk delete → API error → rows restored
- [ ] Optimistic update animation smooth görünüyor
- [ ] Toast notifications doğru mesajları gösteriyor
- [ ] Loading states çalışıyor
- [ ] 404 error handling (record already deleted)

### Edge Cases
- [ ] Empty table → bulk toolbar görünmüyor
- [ ] Delete during delete (multiple clicks) → disabled
- [ ] Network error → row restored
- [ ] Record already deleted (404) → graceful error
- [ ] Select all → deselect → seçim temizleniyor

---

## Code Examples

### Optimistic Update Flow
```typescript
// 1. User clicks delete
// 2. Show confirmation dialog
// 3. User confirms → mutation starts
// 4. onMutate: Remove row from cache immediately (optimistic)
// 5. API call: DELETE /api/records/{id}
// 6. onSuccess: Show success toast, invalidate cache
// 7. onError: Restore row from snapshot, show error toast
// 8. onSettled: Refetch to ensure consistency
```

### Error Recovery
```typescript
// useDeleteRecord.ts
onError: (error, recordId, context) => {
  // Restore row from snapshot
  if (context?.previousRecords) {
    queryClient.setQueryData(['records'], context.previousRecords);
  }

  // Show user-friendly error
  const errorMessage = error?.response?.data?.detail || 'Failed to delete record';
  toast.error(errorMessage);
},
```

### Bulk Delete Parallel Execution
```typescript
// useBulkDeleteRecords.ts
mutationFn: async (recordIds: string[]) => {
  // Delete all records in parallel (faster than sequential)
  const deletePromises = recordIds.map((id) => deleteRecord(id));
  await Promise.all(deletePromises);
  return recordIds;
},
```

---

## Resources

### Backend Documentation
- [DELETE /api/records/{record_id}](../../backend-docs/api/04-records/05-delete-record.md) - Delete record endpoint
- [Records Overview](../../backend-docs/api/04-records/README.md) - Records system overview

### Related Frontend Tasks
- [01-records-table-view.md](./01-records-table-view.md) - Table component
- [09-ui-components.md](../09-ui-components.md) - Dialog component

### Frontend Libraries
- [TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Sonner Toast](https://sonner.emilkowal.ski/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Delete Record task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/06-records-table/04-delete-record.md

Requirements:
1. Create src/features/records/components/DeleteRecordDialog.tsx - Confirmation dialog with warning message and record primary_value
2. Create src/features/records/components/BulkDeleteDialog.tsx - Bulk delete dialog with selected records list
3. Create src/features/records/hooks/useDeleteRecord.ts - Delete mutation hook with optimistic update
4. Create src/features/records/hooks/useBulkDeleteRecords.ts - Bulk delete mutation hook (parallel execution)
5. Update src/lib/api/records.api.ts - Add deleteRecord function (DELETE /api/records/{record_id})
6. Update src/features/records/components/RecordsTable.tsx - Add delete button, checkbox selection, bulk toolbar

CRITICAL REQUIREMENTS:
- Show confirmation dialog before delete (irreversible action)
- Display record primary_value in dialog
- Show warning message: "This action cannot be undone"
- Show CASCADE info: "All relationship connections will be deleted"
- Implement optimistic updates (remove row immediately)
- Show success toast: "Record deleted successfully"
- Error handling: restore row if API fails
- Bulk delete: parallel API calls (Promise.all)
- Loading states for buttons (disabled + spinner)

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 05-import-export.md
