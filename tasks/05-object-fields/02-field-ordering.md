# Task: Field Ordering (Drag & Drop)

**Priority:** 🟡 Medium
**Estimated Time:** 1.5 gün
**Dependencies:** 01-add-field-to-object

---

## Objective

Object içindeki field'ların sırasını drag & drop ile değiştirme sistemi oluşturmak. Smooth drag deneyimi, optimistic updates ve keyboard accessibility sağlamak.

---

## Backend API

### Endpoint
```
PATCH /api/object-fields/{object_field_id}
```

### Request Format
```json
{
  "display_order": 5,
  "is_required": false,
  "is_visible": true
}
```

**Request Fields:**
- `display_order` - Görüntüleme sırası (0, 1, 2, 3...) - **Primary field for ordering**
- `is_required` - Zorunlu mu? (optional)
- `is_visible` - Görünür mü? (optional)
- `is_readonly` - Salt okunur mu? (optional)

> **Not:** Tüm field'lar opsiyonel (partial update). Sadece sıralama için `display_order` göndermek yeterli.

### Response
```json
{
  "id": "ofd_a1b2c3d4",
  "object_id": "obj_contact",
  "field_id": "fld_email",
  "display_order": 5,
  "is_required": false,
  "is_visible": true,
  "is_readonly": false,
  "field_overrides": {},
  "created_at": "2026-01-18T10:00:00Z"
}
```

**Response Fields:**
- `display_order` - Güncellenmiş sıra numarası
- Diğer field'lar değişmeden döner

### Error Responses
- `404 Not Found` - Object-field bulunamadı
- `422 Unprocessable Entity` - Validation hatası (negatif display_order vb.)

**Backend Documentation:**
→ [PATCH /api/object-fields/{object_field_id}](../../backend-docs/api/07-object-fields/04-update-object-field.md)

---

## UI/UX Design

### Sortable Field List Layout
```
┌─────────────────────────────────────────────────────┐
│  Contact Object Fields                [+ Add Field]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ⋮⋮  Email Address       [Primary] [Required]  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ⋮⋮  Phone Number              [Required]      │ │ ← Dragging
│  └────────────────────────────────────────────────┘ │   (shadow)
│                                                      │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│    DROP ZONE                                       │ ← Drop indicator
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ⋮⋮  Company Name              [Optional]      │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ⋮⋮  Job Title                 [Optional]      │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Visual States

#### 1. Idle State
```
┌────────────────────────────────────────────────┐
│ ⋮⋮  Email Address       [Primary] [Required]  │
└────────────────────────────────────────────────┘
  ↑
  Drag handle (hover: cursor-grab)
```

#### 2. Dragging State
```
┌────────────────────────────────────────────────┐
│ ⋮⋮  Phone Number              [Required]      │ ← Semi-transparent ghost
└────────────────────────────────────────────────┘   (opacity: 0.5)

┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  Blue dashed border (2px) - Drop target
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

#### 3. Drop Success (Animation)
```
New position → Green glow (200ms fade-out)
```

### Drag Handle Design
```typescript
// Icon: ⋮⋮ (6 dots in 2x3 grid)
<svg className="w-4 h-4 text-gray-400 cursor-grab">
  <path d="M9 5h2v2H9V5zm0 6h2v2H9v-2zm-4-6h2v2H5V5zm0 6h2v2H5v-2z" />
</svg>
```

**States:**
- **Idle:** `cursor-grab text-gray-400`
- **Hover:** `cursor-grab text-gray-600`
- **Active (dragging):** `cursor-grabbing text-blue-600`

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── object-fields/
│       ├── components/
│       │   ├── SortableFieldList.tsx      ⭐ Main sortable list
│       │   ├── SortableFieldItem.tsx      ⭐ Individual draggable item
│       │   └── DragHandle.tsx             ⭐ Drag handle icon component
│       ├── hooks/
│       │   └── useReorderFields.ts        ⭐ Reorder mutation hook
│       └── utils/
│           └── reorderUtils.ts            ⭐ Calculate new display_order
└── lib/
    └── api/
        └── object-fields.api.ts           ⭐ PATCH object-field endpoint
```

### Component Implementation

#### SortableFieldList.tsx
```typescript
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableFieldItem } from './SortableFieldItem';
import { useReorderFields } from '../hooks/useReorderFields';
import { ObjectField } from '../types/object-field.types';

interface SortableFieldListProps {
  objectId: string;
  fields: ObjectField[];
}

export const SortableFieldList = ({ objectId, fields }: SortableFieldListProps) => {
  const [items, setItems] = useState(fields);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { mutate: reorderFields } = useReorderFields();

  // Configure sensors for mouse, touch, and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement to start drag (prevents accidental drags)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // Optimistic update (UI updates immediately)
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update display_order for affected items
        const updates = newItems.map((item, index) => ({
          object_field_id: item.id,
          display_order: index,
        }));

        // Send batch update to backend
        reorderFields(
          { updates },
          {
            onError: () => {
              // Rollback on error
              setItems(items);
            },
          }
        );

        return newItems;
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((field) => (
            <SortableFieldItem key={field.id} field={field} />
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay (ghost element following cursor) */}
      <DragOverlay>
        {activeItem ? (
          <div className="bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-4 opacity-90">
            <div className="flex items-center gap-3">
              <span className="font-medium">{activeItem.field_name}</span>
              <span className="text-sm text-gray-500">{activeItem.field_type}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
```

#### SortableFieldItem.tsx
```typescript
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle } from './DragHandle';
import { ObjectField } from '../types/object-field.types';
import { cn } from '@/lib/utils';

interface SortableFieldItemProps {
  field: ObjectField;
}

export const SortableFieldItem = ({ field }: SortableFieldItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300',
        'transition-all duration-200',
        isDragging && 'opacity-50 shadow-2xl z-50'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div {...attributes} {...listeners}>
          <DragHandle isDragging={isDragging} />
        </div>

        {/* Field Info */}
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{field.field_name}</span>
            <span className="text-sm text-gray-500">({field.field_type})</span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            {field.is_primary_field && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                Primary
              </span>
            )}
            {field.is_required && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                Required
              </span>
            )}
            {!field.is_required && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                Optional
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### DragHandle.tsx
```typescript
import { cn } from '@/lib/utils';

interface DragHandleProps {
  isDragging?: boolean;
}

export const DragHandle = ({ isDragging }: DragHandleProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded cursor-grab active:cursor-grabbing',
        'hover:bg-gray-100 transition-colors',
        isDragging ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
      )}
      aria-label="Drag to reorder"
    >
      {/* Six dots icon (⋮⋮) */}
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="5" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" />
        <circle cx="11" cy="3" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="11" cy="13" r="1.5" />
      </svg>
    </div>
  );
};
```

#### useReorderFields.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateObjectFieldAPI } from '@/lib/api/object-fields.api';
import { toast } from 'sonner';

interface ReorderUpdate {
  object_field_id: string;
  display_order: number;
}

interface ReorderFieldsInput {
  updates: ReorderUpdate[];
}

export const useReorderFields = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ updates }: ReorderFieldsInput) => {
      // Batch update: Send PATCH request for each field
      const promises = updates.map(({ object_field_id, display_order }) =>
        updateObjectFieldAPI(object_field_id, { display_order })
      );

      return await Promise.all(promises);
    },
    onSuccess: () => {
      // Invalidate object-fields query to refetch
      queryClient.invalidateQueries({ queryKey: ['object-fields'] });

      toast.success('Field order updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to reorder fields:', error);
      toast.error(error.message || 'Failed to update field order');
    },
  });
};
```

#### object-fields.api.ts
```typescript
import axios from 'axios';
import { getAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ObjectFieldUpdatePayload {
  display_order?: number;
  is_required?: boolean;
  is_visible?: boolean;
  is_readonly?: boolean;
}

interface ObjectFieldResponse {
  id: string;
  object_id: string;
  field_id: string;
  display_order: number;
  is_required: boolean;
  is_visible: boolean;
  is_readonly: boolean;
  field_overrides: Record<string, any>;
  created_at: string;
}

export const updateObjectFieldAPI = async (
  objectFieldId: string,
  payload: ObjectFieldUpdatePayload
): Promise<ObjectFieldResponse> => {
  const token = getAuthToken();

  const { data } = await axios.patch<ObjectFieldResponse>(
    `${API_BASE_URL}/api/object-fields/${objectFieldId}`,
    payload,
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

#### reorderUtils.ts
```typescript
/**
 * Calculate new display_order for all affected fields after reordering
 * @param fields - All fields in the list
 * @param oldIndex - Original index of dragged item
 * @param newIndex - Target index of dragged item
 * @returns Array of updates with object_field_id and new display_order
 */
export const calculateReorderUpdates = (
  fields: { id: string }[],
  oldIndex: number,
  newIndex: number
) => {
  const updates: { object_field_id: string; display_order: number }[] = [];

  // Move item from oldIndex to newIndex
  const reorderedFields = [...fields];
  const [movedItem] = reorderedFields.splice(oldIndex, 1);
  reorderedFields.splice(newIndex, 0, movedItem);

  // Update display_order for all fields (0, 1, 2, 3...)
  reorderedFields.forEach((field, index) => {
    updates.push({
      object_field_id: field.id,
      display_order: index,
    });
  });

  return updates;
};
```

---

## Dependencies

### NPM Packages (Yeni Eklenecek)
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**@dnd-kit Features:**
- ✅ Touch support (mobile devices)
- ✅ Keyboard navigation (WCAG 2.1 compliant)
- ✅ Smooth animations
- ✅ Auto-scrolling during drag
- ✅ Collision detection algorithms
- ✅ Drag overlay (ghost element)

### Already Installed ✅
- `@tanstack/react-query` - API state management
- `axios` - HTTP client
- `sonner` - Toast notifications

---

## Acceptance Criteria

- [ ] Field'lar drag & drop ile yeniden sıralanabiliyor
- [ ] Drag handle (⋮⋮) ikonuna tıklayınca drag başlıyor
- [ ] Dragging sırasında visual feedback (semi-transparent ghost)
- [ ] Drop zone mavi kesikli border ile highlight ediliyor
- [ ] Drop sonrası yeşil glow animasyonu (200ms)
- [ ] Optimistic update: UI hemen değişiyor
- [ ] Backend'e PATCH request gönderiliyor (display_order)
- [ ] Hata durumunda rollback yapılıyor
- [ ] Toast notification: success/error
- [ ] Touch support (mobile devices)
- [ ] Keyboard accessibility:
  - [ ] Space tuşu ile grab
  - [ ] Arrow keys (↑↓) ile hareket
  - [ ] Escape ile cancel
- [ ] Auto-scrolling (drag at edge of screen)
- [ ] Minimum 8px movement to start drag (prevent accidents)

---

## Testing Checklist

### Manual Testing

#### Desktop (Mouse)
- [ ] Drag handle hover → cursor-grab
- [ ] Click drag handle → cursor-grabbing
- [ ] Drag item up → other items shift down
- [ ] Drag item down → other items shift up
- [ ] Drop item → green glow animation
- [ ] Success → toast notification
- [ ] Network error → rollback + error toast

#### Mobile (Touch)
- [ ] Long press (250ms) → drag starts
- [ ] Drag item → visual feedback
- [ ] Release → drop animation
- [ ] Touch device auto-scrolling

#### Keyboard (Accessibility)
- [ ] Tab to drag handle → focus ring
- [ ] Space to grab → item selected
- [ ] Arrow Up → move item up
- [ ] Arrow Down → move item down
- [ ] Space to drop → confirm new position
- [ ] Escape → cancel drag

#### Edge Cases
- [ ] Single field → drag disabled
- [ ] Drag to same position → no API call
- [ ] Drag during loading → disabled
- [ ] Concurrent drag operations → blocked
- [ ] Network timeout → rollback + error

### Test Scenarios

**Scenario 1: Reorder 4 fields**
```
Initial order:
0: Email (Primary, Required)
1: Phone (Required)
2: Company (Optional)
3: Job Title (Optional)

Drag Phone → Position 2
Expected result:
0: Email (Primary, Required)
1: Company (Optional)
2: Phone (Required)
3: Job Title (Optional)

Backend calls:
PATCH /api/object-fields/ofd_phone → { display_order: 2 }
PATCH /api/object-fields/ofd_company → { display_order: 1 }
```

---

## Code Examples

### Complete Reorder Flow
```typescript
// 1. User drags field from index 1 to index 3
// 2. handleDragEnd triggered
// 3. Optimistic update (UI changes immediately)
// 4. Calculate new display_order for affected fields
// 5. Send batch PATCH requests to backend
// 6. Success → invalidate query → refetch
// 7. Error → rollback to original order → toast error
```

### Error Handling
```typescript
// useReorderFields.ts
export const useReorderFields = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ updates }: ReorderFieldsInput) => {
      const promises = updates.map(({ object_field_id, display_order }) =>
        updateObjectFieldAPI(object_field_id, { display_order })
      );

      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['object-fields'] });
      toast.success('Sıralama başarıyla güncellendi');
    },
    onError: (error: any) => {
      console.error('Reorder failed:', error);

      // Rollback is handled in SortableFieldList component
      // by reverting to previous state in onError callback

      if (error.response?.status === 404) {
        toast.error('Field bulunamadı');
      } else if (error.response?.status === 422) {
        toast.error('Geçersiz sıralama değeri');
      } else {
        toast.error('Sıralama güncellenemedi');
      }
    },
  });
};
```

### Optimistic Update with Rollback
```typescript
// SortableFieldList.tsx
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    // Store original state for potential rollback
    const previousItems = items;

    setItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      const updates = newItems.map((item, index) => ({
        object_field_id: item.id,
        display_order: index,
      }));

      reorderFields(
        { updates },
        {
          onError: () => {
            // Rollback on error
            setItems(previousItems);
          },
        }
      );

      return newItems;
    });
  }

  setActiveId(null);
};
```

---

## Resources

### Backend Documentation
- [PATCH /api/object-fields/{object_field_id}](../../backend-docs/api/07-object-fields/04-update-object-field.md) - Update field endpoint
- [GET /api/object-fields](../../backend-docs/api/07-object-fields/02-list-object-fields.md) - List fields (for query invalidation)

### Frontend Libraries
- [@dnd-kit Documentation](https://docs.dndkit.com/) - Drag & drop library
- [@dnd-kit Sortable](https://docs.dndkit.com/presets/sortable) - Sortable list preset
- [TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

### Design Inspiration
- [Linear Issue Reordering](https://linear.app/) - Smooth drag experience
- [Notion Database View](https://www.notion.so/) - Field ordering UI
- [Airtable Fields](https://www.airtable.com/) - Drag handle design

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Field Ordering (Drag & Drop) task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/05-object-fields/02-field-ordering.md

Requirements:
1. Install @dnd-kit packages: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
2. Create src/features/object-fields/components/SortableFieldList.tsx - Main drag & drop container with DndContext
3. Create src/features/object-fields/components/SortableFieldItem.tsx - Individual draggable field item
4. Create src/features/object-fields/components/DragHandle.tsx - Six-dot drag handle icon (⋮⋮)
5. Create src/features/object-fields/hooks/useReorderFields.ts - TanStack Query mutation for batch updates
6. Create src/features/object-fields/utils/reorderUtils.ts - Calculate new display_order values
7. Update src/lib/api/object-fields.api.ts - Add updateObjectFieldAPI function

CRITICAL REQUIREMENTS:
- Use @dnd-kit for drag & drop (NOT react-beautiful-dnd)
- Support mouse, touch, and keyboard (Space to grab, Arrow keys to move)
- Optimistic updates: UI changes immediately, rollback on error
- Send PATCH /api/object-fields/{id} with { display_order: number }
- Update display_order sequentially (0, 1, 2, 3...)
- Visual feedback: semi-transparent ghost during drag, blue dashed drop zone, green glow on drop
- Minimum 8px drag distance to prevent accidental drags
- Auto-scrolling when dragging near screen edge
- Toast notifications (success/error) using sonner
- Keyboard accessibility: Tab focus, Space grab, Arrow move, Escape cancel

Follow the exact code examples and design specifications provided in the task file.
Ensure smooth 60fps drag animations and mobile-friendly touch interactions.
```

---

**Status:** 🟡 Pending
**Next Task:** 03-field-configuration.md (Edit field properties: required, default value, validation)
