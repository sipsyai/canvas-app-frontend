# Task: Object Silme (DELETE Object)

**Priority:** 🟡 Medium
**Estimated Time:** 1 gün
**Dependencies:** 01-object-list-page, 09-ui-components (Dialog)

---

## Objective

Kullanıcıların object'leri güvenli bir şekilde silebilmesi için confirmation dialog ile birlikte delete fonksiyonalitesi geliştirmek.

⚠️ **UYARI:** Bu, uygulamadaki **EN TEHLİKELİ** operasyondur! CASCADE silme ile birlikte tüm bağlı veriler kalıcı olarak silinir.

---

## Backend API

### Endpoint
```
DELETE /api/objects/{object_id}
```

### Request Format
**Path Parameter:**
```typescript
interface DeleteObjectParams {
  object_id: string; // Object ID (örn: "obj_contact")
}
```

**Headers:**
```typescript
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### Response
**204 No Content** - Response body yok, silme başarılı

### Error Responses
- `404 Not Found` - Object bulunamadı
- `401 Unauthorized` - Token geçersiz
- `403 Forbidden` - Yetkisiz erişim

**Backend Documentation:**
→ [DELETE /api/objects/{object_id}](../../backend-docs/api/03-objects/05-delete-object.md)

---

## 🔴 CASCADE DELETE UYARISI

### Silinen Veriler
Object silindiğinde aşağıdaki veriler **KALICI** olarak silinir:

1. **Object'in Kendisi**
   - Object metadata
   - Object ayarları

2. **Tüm Object Fields (Sütunlar)**
   - Object'e bağlı tüm field tanımları
   - Field konfigürasyonları

3. **Tüm Records (Kayıtlar)**
   - Object'in tüm data kayıtları
   - JSONB data içerikleri
   - Tüm field değerleri

4. **Tüm İlişkiler (Relationships)**
   - Bu object'i source olarak kullanan ilişkiler
   - Bu object'i target olarak kullanan ilişkiler
   - İlişki konfigürasyonları

5. **Tüm Relationship Records**
   - İlişkili kayıt bağlantıları
   - Cross-reference data

### SQL CASCADE Örneği
```sql
-- Object silindiğinde:
DELETE FROM objects WHERE id = 'obj_contact';

-- CASCADE ile otomatik silinir:
-- ✗ object_fields (field_id = 'obj_contact')
-- ✗ records (object_id = 'obj_contact')
-- ✗ relationships (source_object_id = 'obj_contact' OR target_object_id = 'obj_contact')
-- ✗ relationship_records (ilişkili tüm bağlantılar)
```

### Örnek Senaryo
```
Object: "Contact" (1,543 records)
├─ Fields: 8 adet (Name, Email, Phone, etc.)
├─ Relationships: 3 adet
│  ├─ Contact → Company (1:many)
│  ├─ Contact → Deal (many:many)
│  └─ Contact → Activity (1:many)
└─ Relationship Records: 4,231 adet

DELETE işlemi sonrası:
✗ 1,543 contact kaydı SİLİNDİ
✗ 8 field tanımı SİLİNDİ
✗ 3 relationship SİLİNDİ
✗ 4,231 ilişki bağlantısı SİLİNDİ
✗ TOPLAM: ~6,000 data kaybı!
```

---

## UI/UX Design

### Delete Button (Object List Page)
```
┌─────────────────────────────────────────────┐
│ Objects                          [+ Create] │
├─────────────────────────────────────────────┤
│                                             │
│ Contact                    👁️  ✏️  🗑️       │
│ 1,543 records                      ↑        │
│                                 Delete      │
└─────────────────────────────────────────────┘
```

### Confirmation Dialog (Aşama 1: İstatistikler)
```
┌──────────────────────────────────────────────────────┐
│  ⚠️  Tehlikeli İşlem: Object Silme                   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  "Contact" object'ini silmek üzeresiniz.             │
│  Bu işlem GERİ ALINAMAZ!                             │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  📊 Silinecek Veriler:                        │   │
│  │                                               │   │
│  │  Records (Kayıtlar):        1,543 adet       │   │
│  │  Fields (Sütunlar):         8 adet           │   │
│  │  Relationships (İlişkiler): 3 adet           │   │
│  │  Related Records:           4,231 adet       │   │
│  │                                               │   │
│  │  ⚠️  TOPLAM: ~6,000 veri silinecek!          │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  Devam etmek için object adını yazın:                │
│  ┌─────────────────────────────────────────────┐    │
│  │ Contact                                      │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  [ İptal ]              [ Object'i Sil 🔴 ]         │
│                          (disabled)                  │
└──────────────────────────────────────────────────────┘
```

### Confirmation Dialog (Aşama 2: İsim Doğrulandı)
```
┌──────────────────────────────────────────────────────┐
│  ⚠️  Tehlikeli İşlem: Object Silme                   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  "Contact" object'ini silmek üzeresiniz.             │
│  Bu işlem GERİ ALINAMAZ!                             │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  📊 Silinecek Veriler:                        │   │
│  │                                               │   │
│  │  Records (Kayıtlar):        1,543 adet       │   │
│  │  Fields (Sütunlar):         8 adet           │   │
│  │  Relationships (İlişkiler): 3 adet           │   │
│  │  Related Records:           4,231 adet       │   │
│  │                                               │   │
│  │  ⚠️  TOPLAM: ~6,000 veri silinecek!          │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  Devam etmek için object adını yazın:                │
│  ┌─────────────────────────────────────────────┐    │
│  │ Contact ✓                                    │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  [ İptal ]              [ Object'i Sil 🔴 ]         │
│                          (enabled - RED)             │
└──────────────────────────────────────────────────────┘
```

### States
- **Idle** - Delete button normal state
- **Dialog Open** - İstatistikler gösteriliyor
- **Name Typing** - Kullanıcı object adı yazıyor
- **Name Matched** - Danger button enabled (RED)
- **Deleting** - API call yapılıyor (loading spinner)
- **Success** - Toast + redirect to objects list
- **Error** - Error toast göster

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── objects/
│       ├── components/
│       │   └── DeleteObjectDialog.tsx   ⭐ Confirmation dialog
│       └── hooks/
│           └── useDeleteObject.ts       ⭐ Delete mutation hook
└── lib/
    └── api/
        └── objects.api.ts               ⭐ deleteObject API call
```

### Component Implementation

#### DeleteObjectDialog.tsx
```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDeleteObject } from '../hooks/useDeleteObject';
import { AlertTriangle } from 'lucide-react';

interface ObjectStats {
  record_count: number;
  field_count: number;
  relationship_count: number;
  related_record_count: number;
}

interface DeleteObjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  objectId: string;
  objectName: string;
  stats: ObjectStats;
}

export const DeleteObjectDialog = ({
  isOpen,
  onClose,
  objectId,
  objectName,
  stats
}: DeleteObjectDialogProps) => {
  const [confirmationText, setConfirmationText] = useState('');
  const { mutate: deleteObject, isPending } = useDeleteObject();

  const isConfirmed = confirmationText === objectName;
  const totalDataLoss =
    stats.record_count +
    stats.field_count +
    stats.relationship_count +
    stats.related_record_count;

  const handleDelete = () => {
    deleteObject({ objectId, objectName }, {
      onSuccess: () => {
        onClose();
        setConfirmationText('');
      },
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setConfirmationText('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            Tehlikeli İşlem: Object Silme
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-900 font-medium">
              "<span className="font-bold">{objectName}</span>" object'ini silmek üzeresiniz.
            </p>
            <p className="text-sm text-red-900 font-bold mt-2">
              Bu işlem GERİ ALINAMAZ!
            </p>
          </div>

          {/* Statistics */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📊 Silinecek Veriler:
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Records (Kayıtlar):</span>
                <span className="font-semibold text-gray-900">
                  {stats.record_count.toLocaleString()} adet
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Fields (Sütunlar):</span>
                <span className="font-semibold text-gray-900">
                  {stats.field_count.toLocaleString()} adet
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Relationships (İlişkiler):</span>
                <span className="font-semibold text-gray-900">
                  {stats.relationship_count.toLocaleString()} adet
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Related Records:</span>
                <span className="font-semibold text-gray-900">
                  {stats.related_record_count.toLocaleString()} adet
                </span>
              </div>

              <div className="border-t border-gray-300 pt-2 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-red-700 font-bold">⚠️ TOPLAM:</span>
                  <span className="text-red-700 font-bold text-lg">
                    ~{totalDataLoss.toLocaleString()} veri silinecek!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Devam etmek için object adını yazın:
            </label>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={objectName}
              className={isConfirmed ? 'border-green-500' : ''}
              disabled={isPending}
            />
            {isConfirmed && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                ✓ Object adı doğrulandı
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isPending}
            loading={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? 'Siliniyor...' : 'Object\'i Sil 🔴'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

#### useDeleteObject.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deleteObjectAPI } from '@/lib/api/objects.api';
import { toast } from 'sonner';

interface DeleteObjectParams {
  objectId: string;
  objectName: string;
}

export const useDeleteObject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ objectId }: DeleteObjectParams) => {
      await deleteObjectAPI(objectId);
    },
    onSuccess: (_, { objectName }) => {
      // Invalidate objects list cache
      queryClient.invalidateQueries({ queryKey: ['objects'] });

      // Show success toast
      toast.success('Object silindi', {
        description: `"${objectName}" object'i ve tüm bağlı verileri kalıcı olarak silindi.`,
      });

      // Redirect to objects list
      navigate('/objects');
    },
    onError: (error: any, { objectName }) => {
      console.error('Delete object failed:', error);

      // Show error toast
      toast.error('Object silinemedi', {
        description: error.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    },
  });
};
```

#### objects.api.ts (Add to existing file)
```typescript
import { apiClient } from './client';

// ... existing code ...

/**
 * Delete object (CASCADE: removes all records, fields, relationships!)
 *
 * ⚠️ WARNING: This is a DESTRUCTIVE operation! All data is permanently deleted.
 */
export const deleteObjectAPI = async (objectId: string): Promise<void> => {
  await apiClient.delete(`/api/objects/${objectId}`);
  // 204 No Content - no response body
};

/**
 * Get object deletion statistics (for confirmation dialog)
 */
export const getObjectStatsAPI = async (objectId: string): Promise<ObjectStats> => {
  const { data } = await apiClient.get(`/api/objects/${objectId}/stats`);
  return data;
};

interface ObjectStats {
  record_count: number;
  field_count: number;
  relationship_count: number;
  related_record_count: number;
}
```

### Integration with Object List Page

#### ObjectListPage.tsx (Add delete functionality)
```typescript
import { useState } from 'react';
import { DeleteObjectDialog } from '../components/DeleteObjectDialog';
import { useObjectStats } from '../hooks/useObjectStats';
import { Trash2 } from 'lucide-react';

export const ObjectListPage = () => {
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    objectId: string | null;
    objectName: string | null;
  }>({
    isOpen: false,
    objectId: null,
    objectName: null,
  });

  // Fetch stats when dialog opens
  const { data: stats, isLoading: statsLoading } = useObjectStats(
    deleteDialogState.objectId || '',
    { enabled: deleteDialogState.isOpen }
  );

  const handleDeleteClick = (objectId: string, objectName: string) => {
    setDeleteDialogState({
      isOpen: true,
      objectId,
      objectName,
    });
  };

  const handleCloseDialog = () => {
    setDeleteDialogState({
      isOpen: false,
      objectId: null,
      objectName: null,
    });
  };

  return (
    <div>
      {/* Object list */}
      <div className="space-y-2">
        {objects.map((object) => (
          <div key={object.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">{object.display_name}</h3>
              <p className="text-sm text-gray-600">{object.record_count} records</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                👁️ View
              </Button>
              <Button variant="ghost" size="sm">
                ✏️ Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(object.id, object.display_name)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      {deleteDialogState.isOpen && stats && (
        <DeleteObjectDialog
          isOpen={deleteDialogState.isOpen}
          onClose={handleCloseDialog}
          objectId={deleteDialogState.objectId!}
          objectName={deleteDialogState.objectName!}
          stats={stats}
        />
      )}
    </div>
  );
};
```

#### useObjectStats.ts (New hook for fetching stats)
```typescript
import { useQuery } from '@tanstack/react-query';
import { getObjectStatsAPI } from '@/lib/api/objects.api';

export const useObjectStats = (objectId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['object-stats', objectId],
    queryFn: () => getObjectStatsAPI(objectId),
    enabled: options?.enabled && !!objectId,
  });
};
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - Data fetching & cache management
- `react-router-dom` - Navigation
- `sonner` - Toast notifications
- `lucide-react` - Icons

### UI Components (To Be Built)
- `Dialog` component (React Aria / Radix UI)
- `Button` component (destructive variant)
- `Input` component

---

## Acceptance Criteria

- [ ] Delete button object listesinde gösteriliyor
- [ ] Delete button tıklandığında confirmation dialog açılıyor
- [ ] Dialog'da object istatistikleri gösteriliyor:
  - [ ] Record count
  - [ ] Field count
  - [ ] Relationship count
  - [ ] Related record count
  - [ ] Total data loss count
- [ ] Confirmation input object adı ile eşleşene kadar disabled
- [ ] Object adı doğru yazıldığında danger button enabled
- [ ] Delete button RED renk (destructive variant)
- [ ] DELETE API call başarılı
- [ ] Success toast gösteriliyor
- [ ] Objects listesine redirect yapılıyor
- [ ] Cache invalidate ediliyor (liste güncelleniyor)
- [ ] Error durumunda error toast gösteriliyor
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Dialog ESC veya backdrop click ile kapatılabiliyor
- [ ] Delete sırasında dialog kapatılamıyor

---

## Testing Checklist

### Manual Testing
- [ ] Delete button tıklandığında dialog açılıyor
- [ ] İstatistikler doğru gösteriliyor
- [ ] Yanlış object adı yazıldığında button disabled
- [ ] Doğru object adı yazıldığında button enabled
- [ ] DELETE API call başarılı → success toast + redirect
- [ ] DELETE API call başarısız → error toast
- [ ] Loading state çalışıyor
- [ ] ESC tuşu ile dialog kapanıyor
- [ ] Backdrop click ile dialog kapanıyor
- [ ] Delete sırasında dialog kapanmıyor
- [ ] Cache invalidate çalışıyor (liste güncelleniyor)

### Edge Cases
- [ ] Object ID yanlışsa 404 error
- [ ] Token geçersizse 401 error
- [ ] Object zaten silinmişse 404 error
- [ ] Network hatası → error toast
- [ ] Çok fazla data varsa (~100k records) → performans?

### Test Data
```typescript
// Test için object oluştur:
{
  "object_name": "test_object",
  "display_name": "Test Object",
  "description": "Test için object"
}

// Test için 10 record ekle
// Test için 3 field ekle
// Test için 1 relationship ekle

// Sonra delete et ve cascade davranışını kontrol et
```

---

## Security Considerations

### 1. Authorization
- Sadece object owner'ı veya admin silebilir
- Backend'de permission check yapılmalı

### 2. Rate Limiting
- Kötü niyetli kullanıcı tüm object'leri silemesin
- Backend'de rate limit olmalı

### 3. Audit Log
- Object silme işlemi loglanmalı:
  - Kim sildi?
  - Ne zaman silindi?
  - Kaç data silindi?

### 4. Backup
- Production'da delete öncesi backup alınmalı
- Soft delete alternatifi düşünülebilir (is_deleted flag)

---

## Code Examples

### Complete Delete Flow
```typescript
// 1. User clicks delete button
// 2. Fetch object stats (records, fields, relationships)
// 3. Show confirmation dialog with stats
// 4. User types object name to confirm
// 5. Delete button enabled (RED)
// 6. User clicks delete button
// 7. DELETE API call
// 8. 204 No Content response
// 9. Show success toast
// 10. Invalidate cache
// 11. Redirect to /objects
// 12. Object removed from list
```

### Error Handling
```typescript
// useDeleteObject.ts
export const useDeleteObject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ objectId }: DeleteObjectParams) => {
      await deleteObjectAPI(objectId);
    },
    onSuccess: (_, { objectName }) => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      toast.success('Object silindi', {
        description: `"${objectName}" ve tüm bağlı verileri silindi.`,
      });
      navigate('/objects');
    },
    onError: (error: any, { objectName }) => {
      console.error('Delete failed:', error);

      let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';

      if (error.response?.status === 404) {
        errorMessage = 'Object bulunamadı.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bu object\'i silme yetkiniz yok.';
      }

      toast.error('Object silinemedi', {
        description: errorMessage,
      });
    },
  });
};
```

### TypeScript Types
```typescript
// types/objects.types.ts

export interface Object {
  id: string;
  object_name: string;
  display_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ObjectStats {
  record_count: number;
  field_count: number;
  relationship_count: number;
  related_record_count: number;
}

export interface DeleteObjectParams {
  objectId: string;
  objectName: string;
}
```

---

## Resources

### Backend Documentation
- [DELETE /api/objects/{object_id}](../../backend-docs/api/03-objects/05-delete-object.md) - Delete endpoint documentation
- [CASCADE Delete Behavior](../../backend-docs/api/03-objects/README.md) - Object lifecycle
- [Frontend Developer Guide](../../backend-docs/api/00-FRONTEND-GUIDE.md) - Complete frontend guide

### UI/UX References
- GitHub Repository Delete (confirmation with repo name)
- Vercel Project Delete (confirmation with project name)
- Railway Service Delete (confirmation with service name)

### Frontend Libraries
- [Sonner Docs](https://sonner.emilkowal.ski/) - Toast notifications
- [TanStack Query Docs](https://tanstack.com/query/latest) - useMutation, cache invalidation
- [Lucide React Icons](https://lucide.dev/) - AlertTriangle, Trash2 icons

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Delete Object task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/04-objects-management/04-delete-object.md

Requirements:
1. Create src/features/objects/components/DeleteObjectDialog.tsx - Confirmation dialog with severe warnings
2. Create src/features/objects/hooks/useDeleteObject.ts - TanStack Query mutation hook for delete
3. Create src/features/objects/hooks/useObjectStats.ts - Hook to fetch object statistics
4. Update src/lib/api/objects.api.ts - Add deleteObjectAPI and getObjectStatsAPI functions
5. Update src/features/objects/pages/ObjectListPage.tsx - Add delete button and dialog integration

CRITICAL REQUIREMENTS:
- ⚠️ This is the MOST DESTRUCTIVE operation in the app!
- Show CASCADE delete warning prominently
- Display object statistics (record count, field count, relationship count, related record count)
- Require user to type object name to confirm (like GitHub repo deletion)
- Danger button (RED) disabled until name typed correctly
- Use DELETE /api/objects/{object_id} endpoint
- Handle 204 No Content response
- Show success toast and redirect to /objects
- Invalidate cache after successful deletion
- Use sonner for toast notifications
- Use lucide-react for icons (AlertTriangle, Trash2)

Follow the exact code examples and UI mockups provided in the task file. Emphasize the severity of CASCADE deletion!
```

---

**Status:** 🟡 Pending
**Next Task:** 05-object-detail-page.md (if needed)
