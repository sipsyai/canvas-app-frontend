# Task: Edit Object Form

**Priority:** 🟡 Medium
**Estimated Time:** 1 gün
**Dependencies:** 02-create-object-form

---

## Objective

Mevcut object'ları düzenlemek için form komponenti oluşturmak. Create object form ile aynı field'lar ancak mevcut verilerle doldurulmuş olacak.

---

## Backend API

### Endpoint
```
PATCH /api/objects/{object_id}
```

### Request Format
**Content-Type:** `application/json`

```typescript
interface UpdateObjectRequest {
  name?: string;           // Object adı (snake_case) - Create'den farklı olarak güncellenebilir
  label?: string;          // Görünen ad
  plural_name?: string;    // Çoğul isim
  description?: string;    // Object açıklaması
  icon?: string;          // Icon (emoji veya class)
  color?: string;         // Renk kodu (#hex)
  category?: string;      // Kategori
}
```

**IMPORTANT:** Tüm field'lar opsiyonel (partial update). Sadece gönderilen field'lar güncellenir.

### Response
```json
{
  "id": "obj_contact",
  "name": "contact",
  "label": "Contact (Updated)",
  "plural_name": "Contacts",
  "description": "Updated description",
  "icon": "📞",
  "color": "#3B82F6",
  "category": "sales",
  "is_custom": true,
  "is_global": false,
  "views": {},
  "permissions": {},
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T11:30:00Z"
}
```

**Response Fields:**
- `id` - Object ID (değişmez)
- `name` - Object adı (güncellenebilir - create'den farklı)
- `label` - Görünen ad
- `plural_name` - Çoğul isim
- `description` - Object açıklaması
- `icon` - Icon
- `color` - Renk kodu
- `category` - Kategori
- `updated_at` - Son güncelleme zamanı (otomatik güncellenir)

### Error Responses
- `404 Not Found` - Object bulunamadı
- `422 Unprocessable Entity` - Validation hatası
- `401 Unauthorized` - JWT token geçersiz/eksik

**Backend Documentation:**
→ [PATCH /api/objects/{object_id}](../../backend-docs/api/03-objects/04-update-object.md)

---

## UI/UX Design

### Modal/Drawer Layout
```
┌────────────────────────────────────────┐
│  Edit Object: Contact            [X]   │
├────────────────────────────────────────┤
│                                        │
│  Icon & Color                          │
│  ┌────────┐  ┌──────────────────────┐ │
│  │   📞   │  │ Color: #3B82F6   [▼]│ │
│  └────────┘  └──────────────────────┘ │
│  [Change Icon]                         │
│                                        │
│  Object Name *                         │
│  [contact________________]             │
│  (snake_case, unique)                  │
│                                        │
│  Label *                               │
│  [Contact________________]             │
│                                        │
│  Plural Name *                         │
│  [Contacts_______________]             │
│                                        │
│  Category                              │
│  [Sales____________[▼]  ]              │
│                                        │
│  Description                           │
│  ┌──────────────────────────────────┐ │
│  │ Customer contact information     │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📊 Live Preview                  │ │
│  │ ┌─────┐                          │ │
│  │ │ 📞 │ Contact                   │ │
│  │ └─────┘                          │ │
│  │ 3 Contacts                       │ │
│  └──────────────────────────────────┘ │
│                                        │
│         [Cancel]  [Update Object]      │
│                                        │
└────────────────────────────────────────┘
```

### Form Fields

1. **Icon Picker**
   - Current icon display (büyük)
   - "Change Icon" button → emoji picker modal
   - Preset icons: 👤, 🏢, 💼, 📞, 📧, 📅, 📝, etc.
   - Search functionality

2. **Color Picker**
   - Current color display (swatch)
   - Dropdown color picker
   - Preset colors (Tailwind palette)
   - Custom hex input

3. **Object Name Input**
   - Type: text
   - Validation: snake_case, unique, 1-255 chars
   - **IMPORTANT:** Create'den farklı olarak güncellenebilir
   - Helper text: "Changing name will affect API endpoints"
   - Confirmation modal if changed

4. **Label Input**
   - Type: text
   - Validation: 1-255 characters
   - Auto-suggestion from name

5. **Plural Name Input**
   - Type: text
   - Validation: 1-255 characters
   - Auto-suggestion from label

6. **Category Dropdown**
   - Options: Sales, Marketing, Support, HR, Custom
   - Filterable

7. **Description Textarea**
   - Type: textarea
   - Rows: 4
   - Optional
   - Max length: 500 chars

8. **Live Preview Panel**
   - Real-time preview of changes
   - Shows icon, label, plural_name
   - Mock record count

### States
- **Loading** - Fetching object data, form disabled
- **Idle** - Form editable, update button active
- **Updating** - API call in progress, form disabled
- **Success** - Show toast, close modal, invalidate queries
- **Error** - Show error message (toast/inline)

### Interactions
- **Auto-save Draft** - Optional: Save to localStorage every 2s
- **Unsaved Changes Warning** - Warn before closing if form dirty
- **Optimistic Update** - UI updates immediately, rollback on error
- **Confirmation for Name Change** - Modal warning if object name changed

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── objects/
│       ├── components/
│       │   ├── EditObjectForm.tsx        ⭐ Main form component
│       │   ├── ObjectIconPicker.tsx      ⭐ Icon picker modal
│       │   ├── ObjectColorPicker.tsx     ⭐ Color picker dropdown
│       │   └── ObjectPreview.tsx         ⭐ Live preview component
│       ├── hooks/
│       │   ├── useEditObject.ts          ⭐ TanStack Query mutation
│       │   ├── useObjectById.ts          ⭐ Fetch single object
│       │   └── useObjectForm.ts          ⭐ Shared form logic
│       └── types/
│           └── object.types.ts           ⭐ TypeScript types
├── lib/
│   └── api/
│       └── objects.api.ts                ⭐ API calls (updateObject)
└── components/
    └── ui/
        ├── Modal.tsx                      ⭐ Modal wrapper
        └── ColorPicker.tsx                ⭐ Reusable color picker
```

### Component Implementation

#### EditObjectForm.tsx
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditObject } from '../hooks/useEditObject';
import { useObjectById } from '../hooks/useObjectById';
import { ObjectIconPicker } from './ObjectIconPicker';
import { ObjectColorPicker } from './ObjectColorPicker';
import { ObjectPreview } from './ObjectPreview';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

const editObjectSchema = z.object({
  name: z.string()
    .min(1, 'Object name is required')
    .max(255, 'Object name must be less than 255 characters')
    .regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers, and underscores only'),
  label: z.string()
    .min(1, 'Label is required')
    .max(255, 'Label must be less than 255 characters'),
  plural_name: z.string()
    .min(1, 'Plural name is required')
    .max(255, 'Plural name must be less than 255 characters'),
  description: z.string().max(500, 'Description too long').optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  category: z.string().optional(),
});

type EditObjectFormData = z.infer<typeof editObjectSchema>;

interface EditObjectFormProps {
  objectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditObjectForm = ({ objectId, onSuccess, onCancel }: EditObjectFormProps) => {
  const { data: object, isLoading, error } = useObjectById(objectId);
  const { mutate: updateObject, isPending } = useEditObject();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue
  } = useForm<EditObjectFormData>({
    resolver: zodResolver(editObjectSchema),
    values: object ? {
      name: object.name,
      label: object.label,
      plural_name: object.plural_name,
      description: object.description || '',
      icon: object.icon || '📦',
      color: object.color || '#3B82F6',
      category: object.category || '',
    } : undefined,
  });

  const watchedValues = watch();
  const originalName = object?.name;

  const onSubmit = (data: EditObjectFormData) => {
    // Warn if name changed (affects API endpoints)
    if (data.name !== originalName) {
      const confirmed = window.confirm(
        'Changing the object name will affect API endpoints. Are you sure?'
      );
      if (!confirmed) return;
    }

    updateObject(
      { objectId, data },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  // Unsaved changes warning
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600">Loading object...</span>
      </div>
    );
  }

  if (error || !object) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Object not found or failed to load.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-900">
          Edit Object: {object.label}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Icon & Color */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icon
          </label>
          <ObjectIconPicker
            value={watchedValues.icon}
            onChange={(icon) => setValue('icon', icon, { shouldDirty: true })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <ObjectColorPicker
            value={watchedValues.color}
            onChange={(color) => setValue('color', color, { shouldDirty: true })}
          />
        </div>
      </div>

      {/* Object Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Object Name *
        </label>
        <Input
          {...register('name')}
          placeholder="contact"
          error={errors.name?.message}
        />
        <p className="mt-1 text-xs text-gray-500">
          Use lowercase letters, numbers, and underscores only (snake_case)
        </p>
        {watchedValues.name !== originalName && (
          <p className="mt-1 text-xs text-amber-600 font-medium">
            ⚠️ Changing name will affect API endpoints
          </p>
        )}
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label *
        </label>
        <Input
          {...register('label')}
          placeholder="Contact"
          error={errors.label?.message}
        />
      </div>

      {/* Plural Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plural Name *
        </label>
        <Input
          {...register('plural_name')}
          placeholder="Contacts"
          error={errors.plural_name?.message}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <Select {...register('category')}>
          <option value="">Select category</option>
          <option value="sales">Sales</option>
          <option value="marketing">Marketing</option>
          <option value="support">Support</option>
          <option value="hr">HR</option>
          <option value="custom">Custom</option>
        </Select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          {...register('description')}
          placeholder="Describe this object..."
          rows={4}
          error={errors.description?.message}
        />
        <p className="mt-1 text-xs text-gray-500">
          {watchedValues.description?.length || 0} / 500 characters
        </p>
      </div>

      {/* Live Preview */}
      <ObjectPreview
        icon={watchedValues.icon}
        label={watchedValues.label}
        pluralName={watchedValues.plural_name}
        color={watchedValues.color}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
          disabled={isPending || !isDirty}
          loading={isPending}
        >
          {isPending ? 'Updating...' : 'Update Object'}
        </Button>
      </div>
    </form>
  );
};
```

#### useEditObject.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateObjectAPI } from '@/lib/api/objects.api';
import { UpdateObjectRequest, ObjectResponse } from '../types/object.types';
import { toast } from '@/components/ui/Toast';

interface UpdateObjectParams {
  objectId: string;
  data: UpdateObjectRequest;
}

export const useEditObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ objectId, data }: UpdateObjectParams) => {
      return await updateObjectAPI(objectId, data);
    },

    // Optimistic update
    onMutate: async ({ objectId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['objects', objectId] });
      await queryClient.cancelQueries({ queryKey: ['objects'] });

      // Snapshot previous values
      const previousObject = queryClient.getQueryData<ObjectResponse>(['objects', objectId]);
      const previousObjects = queryClient.getQueryData(['objects']);

      // Optimistically update object
      if (previousObject) {
        queryClient.setQueryData<ObjectResponse>(['objects', objectId], {
          ...previousObject,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }

      // Return context for rollback
      return { previousObject, previousObjects };
    },

    onSuccess: (updatedObject, { objectId }) => {
      // Update cache with server response
      queryClient.setQueryData(['objects', objectId], updatedObject);

      // Invalidate list to refresh
      queryClient.invalidateQueries({ queryKey: ['objects'] });

      toast.success('Object updated successfully');
    },

    onError: (error: any, { objectId }, context) => {
      // Rollback optimistic update
      if (context?.previousObject) {
        queryClient.setQueryData(['objects', objectId], context.previousObject);
      }
      if (context?.previousObjects) {
        queryClient.setQueryData(['objects'], context.previousObjects);
      }

      const errorMessage = error.response?.data?.detail || 'Failed to update object';
      toast.error(errorMessage);
    },
  });
};
```

#### useObjectById.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getObjectByIdAPI } from '@/lib/api/objects.api';

export const useObjectById = (objectId: string) => {
  return useQuery({
    queryKey: ['objects', objectId],
    queryFn: () => getObjectByIdAPI(objectId),
    enabled: !!objectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

#### objects.api.ts (Update)
```typescript
import { apiClient } from './client';
import { ObjectResponse, UpdateObjectRequest } from '@/features/objects/types/object.types';

// Get single object by ID
export const getObjectByIdAPI = async (objectId: string): Promise<ObjectResponse> => {
  const { data } = await apiClient.get<ObjectResponse>(`/api/objects/${objectId}`);
  return data;
};

// Update object
export const updateObjectAPI = async (
  objectId: string,
  objectData: UpdateObjectRequest
): Promise<ObjectResponse> => {
  const { data } = await apiClient.patch<ObjectResponse>(
    `/api/objects/${objectId}`,
    objectData
  );
  return data;
};
```

#### ObjectIconPicker.tsx
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const PRESET_ICONS = [
  '👤', '🏢', '💼', '📞', '📧', '📅', '📝', '💰',
  '🎯', '📊', '🔔', '⚙️', '🌟', '🚀', '💡', '📦',
  '🎨', '🔍', '📈', '🏆', '💪', '🎓', '🌍', '⏰',
];

interface ObjectIconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
}

export const ObjectIconPicker = ({ value = '📦', onChange }: ObjectIconPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
          {value}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
        >
          Change Icon
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Icon"
      >
        <div className="grid grid-cols-8 gap-2 p-4">
          {PRESET_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                hover:bg-blue-50 transition-colors
                ${icon === value ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50'}
              `}
              onClick={() => {
                onChange(icon);
                setIsOpen(false);
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
```

#### ObjectColorPicker.tsx
```typescript
import { useState } from 'react';

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

interface ObjectColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export const ObjectColorPicker = ({ value = '#3B82F6', onChange }: ObjectColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between hover:border-gray-400"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
        <span className="text-gray-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="grid grid-cols-4 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`
                  w-10 h-10 rounded border-2 transition-all
                  ${color === value ? 'border-gray-800 scale-110' : 'border-gray-300'}
                `}
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

#### ObjectPreview.tsx
```typescript
interface ObjectPreviewProps {
  icon?: string;
  label?: string;
  pluralName?: string;
  color?: string;
}

export const ObjectPreview = ({
  icon = '📦',
  label = 'Object',
  pluralName = 'Objects',
  color = '#3B82F6'
}: ObjectPreviewProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        📊 Live Preview
      </p>
      <div
        className="bg-white rounded-lg p-4 border-2"
        style={{ borderColor: color }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-500">3 {pluralName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### object.types.ts (Update)
```typescript
export interface UpdateObjectRequest {
  name?: string;
  label?: string;
  plural_name?: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
}

export interface ObjectResponse {
  id: string;
  name: string;
  label: string;
  plural_name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  is_custom: boolean;
  is_global: boolean;
  views: Record<string, any>;
  permissions: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
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

### UI Components (To Be Built/Reused)
- `Modal` component (for icon picker)
- `Button` component
- `Input` component
- `Textarea` component
- `Select` component
- `Toast` component (for success/error messages)

---

## Acceptance Criteria

- [ ] Edit form açılıyor ve mevcut object verileri yükleniyor
- [ ] Tüm field'lar mevcut değerlerle doldurulmuş
- [ ] Icon picker çalışıyor (emoji seçimi)
- [ ] Color picker çalışıyor (preset + hex input)
- [ ] Object name güncellenebilir (create'den farklı)
- [ ] Object name değiştiğinde uyarı gösteriliyor
- [ ] Form validation çalışıyor (Zod)
- [ ] Live preview güncel değerleri gösteriyor
- [ ] Optimistic update çalışıyor (anında UI güncelleniyor)
- [ ] Başarılı update sonrası toast mesajı
- [ ] Hata durumunda rollback (optimistic update geri alınıyor)
- [ ] Unsaved changes warning (form dirty ise)
- [ ] Loading state çalışıyor (fetch + update)
- [ ] Cancel button çalışıyor
- [ ] isDirty kontrolü - Değişiklik yoksa update button disabled
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Boş object ID → error mesajı
- [ ] Geçersiz object ID → 404 error
- [ ] Mevcut object fetch → form dolduruluyor
- [ ] Icon değiştir → preview güncelleniyor
- [ ] Color değiştir → preview güncelleniyor
- [ ] Name değiştir → uyarı gösteriliyor
- [ ] Validation hatası → error mesajları
- [ ] Başarılı update → toast + modal kapanıyor
- [ ] Network error → error toast + rollback
- [ ] Unsaved changes → browser warning
- [ ] Cancel → modal kapanıyor (dirty kontrolü)
- [ ] Loading states → spinner gösteriliyor

### Test Object
```json
{
  "id": "obj_contact",
  "name": "contact",
  "label": "Contact",
  "plural_name": "Contacts",
  "description": "Customer contact information",
  "icon": "👤",
  "color": "#3B82F6",
  "category": "sales"
}
```

---

## Code Examples

### Complete Edit Flow
```typescript
// 1. User clicks "Edit" on object list
// 2. Modal/drawer opens with EditObjectForm
// 3. useObjectById fetches current object data
// 4. Form populated with existing values
// 5. User makes changes (form becomes dirty)
// 6. Live preview updates in real-time
// 7. User clicks "Update Object"
// 8. Optimistic update → UI changes immediately
// 9. API call PATCH /api/objects/{id}
// 10. Success → Invalidate queries, show toast
// 11. Error → Rollback optimistic update, show error
```

### Optimistic Update Pattern
```typescript
// In useEditObject.ts
onMutate: async ({ objectId, data }) => {
  // 1. Cancel outgoing queries
  await queryClient.cancelQueries({ queryKey: ['objects', objectId] });

  // 2. Snapshot current state (for rollback)
  const previousObject = queryClient.getQueryData(['objects', objectId]);

  // 3. Optimistically update cache
  queryClient.setQueryData(['objects', objectId], (old) => ({
    ...old,
    ...data,
    updated_at: new Date().toISOString(),
  }));

  // 4. Return context for rollback
  return { previousObject };
},

onError: (error, variables, context) => {
  // 5. Rollback on error
  if (context?.previousObject) {
    queryClient.setQueryData(['objects', objectId], context.previousObject);
  }
},
```

### Name Change Confirmation
```typescript
const onSubmit = (data: EditObjectFormData) => {
  // Warn if name changed (affects API endpoints)
  if (data.name !== originalName) {
    const confirmed = window.confirm(
      `Changing object name from "${originalName}" to "${data.name}" will affect API endpoints.\n\n` +
      'Are you sure you want to continue?'
    );
    if (!confirmed) return;
  }

  updateObject({ objectId, data });
};
```

### Unsaved Changes Warning
```typescript
React.useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```

---

## Resources

### Backend Documentation
- [PATCH /api/objects/{object_id}](../../backend-docs/api/03-objects/04-update-object.md) - Update endpoint
- [GET /api/objects/{object_id}](../../backend-docs/api/03-objects/03-get-object.md) - Fetch single object
- [Objects Overview](../../backend-docs/api/03-objects/README.md) - Objects system overview

### Frontend Libraries
- [React Hook Form Docs](https://react-hook-form.com/)
- [TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Zod Docs](https://zod.dev/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Edit Object Form task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/04-objects-management/03-edit-object-form.md

Requirements:
1. Create src/features/objects/components/EditObjectForm.tsx - Main edit form with pre-populated fields
2. Create src/features/objects/components/ObjectIconPicker.tsx - Icon picker modal component
3. Create src/features/objects/components/ObjectColorPicker.tsx - Color picker dropdown
4. Create src/features/objects/components/ObjectPreview.tsx - Live preview component
5. Create src/features/objects/hooks/useEditObject.ts - TanStack Query mutation with optimistic updates
6. Create src/features/objects/hooks/useObjectById.ts - Fetch single object by ID
7. Update src/lib/api/objects.api.ts - Add getObjectByIdAPI and updateObjectAPI functions
8. Update src/features/objects/types/object.types.ts - Add UpdateObjectRequest interface

CRITICAL REQUIREMENTS:
- Fetch existing object data using GET /api/objects/{object_id}
- Pre-populate ALL form fields with current values
- Object name CAN be updated (unlike in create form)
- Show warning modal if object name is changed
- Implement optimistic updates with TanStack Query
- Rollback on error (show toast + restore previous state)
- Live preview updates in real-time as user types
- Unsaved changes warning before closing (if form is dirty)
- Only enable "Update" button if form has changes (isDirty)
- Loading state while fetching object data
- Icon picker with preset emojis and search
- Color picker with Tailwind preset colors
- Form validation with Zod (same rules as create)
- Mobile responsive design with Tailwind CSS 4

Follow the exact code examples and component structure provided in the task file.

Test with existing object:
ID: obj_contact
```

---

**Status:** 🟡 Pending
**Next Task:** 04-delete-object-confirmation.md
