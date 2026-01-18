# Task: Object'e Field Ekleme

**Priority:** 🟡 Medium
**Estimated Time:** 2 gün
**Dependencies:** 03-fields-library, 04-objects-management

---

## Objective

Kullanıcıların field library'den sürükle-bırak (drag-and-drop) veya field selector ile bir object'e field ekleyebilmesi. Field ekleme sırasında is_required, is_unique, default_value gibi konfigürasyonları yapabilme.

---

## Backend API

### Endpoint
```
POST /api/object-fields
```

### Request Format
```typescript
interface CreateObjectFieldRequest {
  object_id: string;       // Object ID (örn: obj_contact)
  field_id: string;        // Field ID (örn: fld_email)
  display_order?: number;  // Görüntüleme sırası (default: 0, auto-calculated)
  is_required?: boolean;   // Zorunlu mu? (default: false)
  is_visible?: boolean;    // Görünür mü? (default: true)
  is_readonly?: boolean;   // Salt okunur mu? (default: false)
  field_overrides?: object; // Field-specific config (default: {})
}
```

### Response
```json
{
  "id": "ofd_a1b2c3d4",
  "object_id": "obj_contact",
  "field_id": "fld_email",
  "display_order": 0,
  "is_required": true,
  "is_visible": true,
  "is_readonly": false,
  "field_overrides": {
    "default_value": "user@example.com"
  },
  "created_at": "2026-01-18T10:00:00Z"
}
```

**Response Fields:**
- `id` - Object-field ID (ofd_xxxxxxxx) - Backend tarafından auto-generate edilir
- `object_id` - Object ID
- `field_id` - Field ID
- `display_order` - Görüntüleme sırası (0'dan başlar, otomatik hesaplanır)
- `is_required` - Zorunlu alan mı?
- `is_visible` - Formda görünür mü?
- `is_readonly` - Salt okunur mu?
- `field_overrides` - Field-specific config overrides (default_value, validation rules)
- `created_at` - Oluşturulma zamanı

### Error Responses
- `401 Unauthorized` - Authentication gerekli
- `422 Unprocessable Entity` - Validation hatası (missing required fields)
- `404 Not Found` - Object veya Field bulunamadı
- `409 Conflict` - Field zaten bu object'e eklenmiş

**Backend Documentation:**
→ [POST /api/object-fields](../../backend-docs/api/07-object-fields/01-create-object-field.md)

---

## UI/UX Design

### Page Layout (Object Detail Page)
```
┌──────────────────────────────────────────────────────────────┐
│  Object: Contact                                             │
│                                                               │
│  ┌─────────────────┐  ┌───────────────────────────────────┐ │
│  │ Field Library   │  │ Object Fields                     │ │
│  │                 │  │                                   │ │
│  │ 🔍 Search       │  │ ┌───────────────────────────────┐ │ │
│  │ [search box]    │  │ │ Drag fields here to add       │ │ │
│  │                 │  │ │        ⬇️                      │ │ │
│  │ 📝 Text         │  │ └───────────────────────────────┘ │ │
│  │ (draggable)     │  │                                   │ │
│  │                 │  │ Current Fields:                   │ │
│  │ 📧 Email        │  │ ┌─────────────────────────────┐   │ │
│  │ (draggable)     │  │ │ 📧 Email          [Edit][×] │   │ │
│  │                 │  │ │    Required: ✅              │   │ │
│  │ 📞 Phone        │  │ │    Visible: ✅               │   │ │
│  │ (draggable)     │  │ └─────────────────────────────┘   │ │
│  │                 │  │                                   │ │
│  │ 🔢 Number       │  │ ┌─────────────────────────────┐   │ │
│  │ (draggable)     │  │ │ 📝 Name           [Edit][×] │   │ │
│  │                 │  │ │    Required: ✅              │   │ │
│  │ 📅 Date         │  │ │    Visible: ✅               │   │ │
│  │ (draggable)     │  │ └─────────────────────────────┘   │ │
│  │                 │  │                                   │ │
│  │ ☑️  Checkbox    │  │ [+ Add Field from Library]       │ │
│  │ (draggable)     │  │                                   │ │
│  └─────────────────┘  └───────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Add Field Dialog (Alternative to Drag-Drop)
```
┌─────────────────────────────────────┐
│  Add Field to Object                │
│                                     │
│  Select Field:                      │
│  ┌───────────────────────────────┐ │
│  │ 🔍 Search fields...           │ │
│  └───────────────────────────────┘ │
│                                     │
│  Available Fields:                  │
│  ┌───────────────────────────────┐ │
│  │ ☑️  📧 Email                  │ │
│  │     Single Line Text          │ │
│  │                               │ │
│  │ ☐  📝 Name                    │ │
│  │     Single Line Text          │ │
│  │                               │ │
│  │ ☐  📞 Phone Number            │ │
│  │     Phone                     │ │
│  └───────────────────────────────┘ │
│                                     │
│  Configuration:                     │
│  ┌───────────────────────────────┐ │
│  │ [✅] Required                 │ │
│  │ [✅] Visible                  │ │
│  │ [  ] Read-only                │ │
│  │                               │ │
│  │ Default Value:                │ │
│  │ [input field]                 │ │
│  └───────────────────────────────┘ │
│                                     │
│  Preview:                           │
│  ┌───────────────────────────────┐ │
│  │ Email *                       │ │
│  │ [example@email.com]           │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Cancel]           [Add Field]    │
└─────────────────────────────────────┘
```

### Drag-and-Drop Zones
```
┌────────────────────────────┐
│ DRAGGABLE FIELD (source)   │
│ ┌────────────────────────┐ │
│ │ 📧 Email Field         │ │
│ │ ··· (grab icon)        │ │
│ └────────────────────────┘ │
└────────────────────────────┘

          ⬇️  (dragging)

┌────────────────────────────┐
│ DROP ZONE (target)         │
│ ┌────────────────────────┐ │
│ │ Drop field here        │ │
│ │ ··· (highlighted)      │ │
│ └────────────────────────┘ │
└────────────────────────────┘

          ⬇️  (dropped)

┌────────────────────────────┐
│ CONFIG DIALOG              │
│ ┌────────────────────────┐ │
│ │ Configure Email Field  │ │
│ │ [✅] Required          │ │
│ │ [  ] Read-only         │ │
│ │ [Save]                 │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

### States
- **Idle** - Field library ve object fields görünür
- **Dragging** - Field sürüklenirken drop zone highlight
- **Configuring** - Field config dialog açık
- **Loading** - API call yapılıyor, button disabled + spinner
- **Success** - Field eklendi, list güncellendi, success toast
- **Error** - Hata mesajı göster (toast/alert)

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── object-fields/
│       ├── pages/
│       │   └── ObjectFieldsPage.tsx        ⭐ Main page (object detail + fields)
│       ├── components/
│       │   ├── FieldLibrary.tsx            ⭐ Draggable field list (left sidebar)
│       │   ├── ObjectFieldsList.tsx        ⭐ Current fields (right panel)
│       │   ├── AddFieldToObjectDialog.tsx  ⭐ Field selector + config dialog
│       │   ├── FieldCard.tsx               ⭐ Draggable field card
│       │   ├── DropZone.tsx                ⭐ Drop zone component
│       │   └── FieldConfigForm.tsx         ⭐ Field configuration form
│       ├── hooks/
│       │   ├── useAddFieldToObject.ts      ⭐ Add field mutation (TanStack Query)
│       │   ├── useObjectFields.ts          ⭐ Get object fields query
│       │   └── useFieldLibrary.ts          ⭐ Get available fields query
│       └── types/
│           └── object-field.types.ts       ⭐ TypeScript types
├── lib/
│   ├── api/
│   │   └── object-fields.api.ts            ⭐ API calls
│   └── dnd/
│       └── dnd-config.ts                   ⭐ dnd-kit configuration
└── components/
    └── ui/
        └── FieldPreview.tsx                ⭐ Field preview component
```

### Component Implementation

#### ObjectFieldsPage.tsx
```typescript
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { FieldLibrary } from '../components/FieldLibrary';
import { ObjectFieldsList } from '../components/ObjectFieldsList';
import { AddFieldToObjectDialog } from '../components/AddFieldToObjectDialog';
import { useObjectFields } from '../hooks/useObjectFields';
import { useAddFieldToObject } from '../hooks/useAddFieldToObject';

export const ObjectFieldsPage = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);

  const { data: objectFields, isLoading } = useObjectFields(objectId!);
  const { mutate: addField } = useAddFieldToObject();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'object-fields-drop-zone') {
      const fieldId = active.id as string;

      // Açılır dialog ile konfigürasyon yapılacak
      setDraggedFieldId(fieldId);
      setIsAddDialogOpen(true);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen">
        {/* Left Sidebar - Field Library */}
        <div className="w-80 border-r border-gray-200 bg-gray-50">
          <FieldLibrary />
        </div>

        {/* Right Panel - Object Fields */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Object Fields
              </h1>
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Field from Library
              </button>
            </div>

            <ObjectFieldsList
              objectId={objectId!}
              fields={objectFields || []}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Add Field Dialog */}
        <AddFieldToObjectDialog
          objectId={objectId!}
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setDraggedFieldId(null);
          }}
          preselectedFieldId={draggedFieldId}
        />
      </div>
    </DndContext>
  );
};
```

#### FieldLibrary.tsx (Draggable Fields)
```typescript
import { useDraggable } from '@dnd-kit/core';
import { useFieldLibrary } from '../hooks/useFieldLibrary';
import { Field } from '../types/object-field.types';

const DraggableFieldCard = ({ field }: { field: Field }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: field.id,
    data: { field },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{getFieldIcon(field.field_type)}</span>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{field.field_name}</div>
          <div className="text-xs text-gray-500">{field.field_type}</div>
        </div>
        <div className="text-gray-400">⋮⋮</div>
      </div>
    </div>
  );
};

export const FieldLibrary = () => {
  const { data: fields, isLoading } = useFieldLibrary();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFields = fields?.filter((field) =>
    field.field_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Field Library
        </h2>
        <input
          type="text"
          placeholder="🔍 Search fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          filteredFields?.map((field) => (
            <DraggableFieldCard key={field.id} field={field} />
          ))
        )}
      </div>
    </div>
  );
};

const getFieldIcon = (fieldType: string) => {
  const icons: Record<string, string> = {
    text: '📝',
    email: '📧',
    phone: '📞',
    number: '🔢',
    date: '📅',
    checkbox: '☑️',
    dropdown: '▼',
  };
  return icons[fieldType] || '📄';
};
```

#### ObjectFieldsList.tsx (Drop Zone + Current Fields)
```typescript
import { useDroppable } from '@dnd-kit/core';
import { ObjectField } from '../types/object-field.types';

export const ObjectFieldsList = ({
  objectId,
  fields,
  isLoading,
}: {
  objectId: string;
  fields: ObjectField[];
  isLoading: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'object-fields-drop-zone',
  });

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50'
          }
        `}
      >
        <div className="text-gray-500">
          <div className="text-4xl mb-2">⬇️</div>
          <div className="font-medium">
            {isOver ? 'Drop field here to add' : 'Drag fields here to add'}
          </div>
          <div className="text-sm mt-1">
            or use the "Add Field from Library" button above
          </div>
        </div>
      </div>

      {/* Current Fields */}
      {isLoading ? (
        <div className="text-center text-gray-500">Loading fields...</div>
      ) : fields.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No fields added yet. Drag a field from the library to get started.
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Current Fields</h3>
          {fields.map((objectField) => (
            <ObjectFieldCard key={objectField.id} objectField={objectField} />
          ))}
        </div>
      )}
    </div>
  );
};

const ObjectFieldCard = ({ objectField }: { objectField: ObjectField }) => {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getFieldIcon(objectField.field_type)}</span>
          <div>
            <div className="font-medium text-gray-900">
              {objectField.field_name}
              {objectField.is_required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Required: {objectField.is_required ? '✅' : '❌'} •
              Visible: {objectField.is_visible ? '✅' : '❌'} •
              Read-only: {objectField.is_readonly ? '✅' : '❌'}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
            Edit
          </button>
          <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
            ×
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### AddFieldToObjectDialog.tsx
```typescript
import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { FieldConfigForm } from './FieldConfigForm';
import { FieldPreview } from '@/components/ui/FieldPreview';
import { useFieldLibrary } from '../hooks/useFieldLibrary';
import { useAddFieldToObject } from '../hooks/useAddFieldToObject';

interface AddFieldToObjectDialogProps {
  objectId: string;
  isOpen: boolean;
  onClose: () => void;
  preselectedFieldId?: string | null;
}

export const AddFieldToObjectDialog = ({
  objectId,
  isOpen,
  onClose,
  preselectedFieldId,
}: AddFieldToObjectDialogProps) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [config, setConfig] = useState({
    is_required: false,
    is_visible: true,
    is_readonly: false,
    default_value: '',
  });

  const { data: fields } = useFieldLibrary();
  const { mutate: addField, isPending } = useAddFieldToObject();

  // Preselect field if dragged
  useEffect(() => {
    if (preselectedFieldId) {
      setSelectedFieldId(preselectedFieldId);
    }
  }, [preselectedFieldId]);

  const selectedField = fields?.find((f) => f.id === selectedFieldId);

  const filteredFields = fields?.filter((field) =>
    field.field_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddField = () => {
    if (!selectedFieldId) return;

    addField({
      object_id: objectId,
      field_id: selectedFieldId,
      ...config,
      field_overrides: config.default_value
        ? { default_value: config.default_value }
        : {},
    }, {
      onSuccess: () => {
        onClose();
        setSelectedFieldId(null);
        setConfig({
          is_required: false,
          is_visible: true,
          is_readonly: false,
          default_value: '',
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="Add Field to Object">
      <div className="space-y-6">
        {/* Field Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Field:
          </label>
          <input
            type="text"
            placeholder="🔍 Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
          />
          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {filteredFields?.map((field) => (
              <div
                key={field.id}
                onClick={() => setSelectedFieldId(field.id)}
                className={`
                  p-3 cursor-pointer border-b last:border-b-0 hover:bg-blue-50
                  ${selectedFieldId === field.id ? 'bg-blue-100' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={selectedFieldId === field.id}
                    onChange={() => setSelectedFieldId(field.id)}
                    className="cursor-pointer"
                  />
                  <span className="text-xl">{getFieldIcon(field.field_type)}</span>
                  <div className="flex-1">
                    <div className="font-medium">{field.field_name}</div>
                    <div className="text-xs text-gray-500">{field.field_type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Form */}
        {selectedField && (
          <>
            <FieldConfigForm config={config} onChange={setConfig} />

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview:
              </label>
              <FieldPreview
                field={selectedField}
                config={config}
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleAddField}
            disabled={!selectedFieldId || isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Adding...' : 'Add Field'}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
```

#### FieldConfigForm.tsx
```typescript
interface FieldConfig {
  is_required: boolean;
  is_visible: boolean;
  is_readonly: boolean;
  default_value: string;
}

interface FieldConfigFormProps {
  config: FieldConfig;
  onChange: (config: FieldConfig) => void;
}

export const FieldConfigForm = ({ config, onChange }: FieldConfigFormProps) => {
  const handleChange = (key: keyof FieldConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Configuration:</h3>

      <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.is_required}
            onChange={(e) => handleChange('is_required', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-700">Required</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.is_visible}
            onChange={(e) => handleChange('is_visible', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-700">Visible</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.is_readonly}
            onChange={(e) => handleChange('is_readonly', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-700">Read-only</span>
        </label>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Default Value:
          </label>
          <input
            type="text"
            value={config.default_value}
            onChange={(e) => handleChange('default_value', e.target.value)}
            placeholder="Enter default value (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );
};
```

#### useAddFieldToObject.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createObjectFieldAPI } from '@/lib/api/object-fields.api';
import { toast } from '@/lib/toast';

interface AddFieldToObjectParams {
  object_id: string;
  field_id: string;
  display_order?: number;
  is_required?: boolean;
  is_visible?: boolean;
  is_readonly?: boolean;
  field_overrides?: Record<string, any>;
}

export const useAddFieldToObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddFieldToObjectParams) => {
      // Display order auto-calculated by backend (next highest number)
      return await createObjectFieldAPI(params);
    },
    onSuccess: (data, variables) => {
      // Invalidate object fields query to refresh list
      queryClient.invalidateQueries({
        queryKey: ['object-fields', variables.object_id],
      });

      toast.success('Field successfully added to object');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error('This field is already added to the object');
      } else if (error.response?.status === 404) {
        toast.error('Object or field not found');
      } else {
        toast.error('Failed to add field to object');
      }
      console.error('Add field to object failed:', error);
    },
  });
};
```

#### useObjectFields.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getObjectFieldsAPI } from '@/lib/api/object-fields.api';

export const useObjectFields = (objectId: string) => {
  return useQuery({
    queryKey: ['object-fields', objectId],
    queryFn: () => getObjectFieldsAPI(objectId),
    enabled: !!objectId,
  });
};
```

#### useFieldLibrary.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getFieldsAPI } from '@/lib/api/fields.api';

export const useFieldLibrary = () => {
  return useQuery({
    queryKey: ['fields', 'library'],
    queryFn: () => getFieldsAPI(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
```

#### object-fields.api.ts
```typescript
import { apiClient } from './client';

interface CreateObjectFieldRequest {
  object_id: string;
  field_id: string;
  display_order?: number;
  is_required?: boolean;
  is_visible?: boolean;
  is_readonly?: boolean;
  field_overrides?: Record<string, any>;
}

interface ObjectFieldResponse {
  id: string; // ofd_xxxxxxxx (auto-generated by backend)
  object_id: string;
  field_id: string;
  display_order: number; // Auto-calculated (next highest number)
  is_required: boolean;
  is_visible: boolean;
  is_readonly: boolean;
  field_overrides: Record<string, any>;
  created_at: string;
}

export const createObjectFieldAPI = async (
  data: CreateObjectFieldRequest
): Promise<ObjectFieldResponse> => {
  const response = await apiClient.post<ObjectFieldResponse>(
    '/api/object-fields',
    data
  );
  return response.data;
};

export const getObjectFieldsAPI = async (
  objectId: string
): Promise<ObjectFieldResponse[]> => {
  const response = await apiClient.get<ObjectFieldResponse[]>(
    `/api/object-fields?object_id=${objectId}`
  );
  return response.data;
};

export const deleteObjectFieldAPI = async (
  objectFieldId: string
): Promise<void> => {
  await apiClient.delete(`/api/object-fields/${objectFieldId}`);
};
```

#### object-field.types.ts
```typescript
export interface Field {
  id: string; // fld_xxxxxxxx
  field_name: string;
  field_label: string;
  field_type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'checkbox' | 'dropdown';
  description?: string;
  is_system: boolean;
  created_at: string;
}

export interface ObjectField {
  id: string; // ofd_xxxxxxxx (auto-generated)
  object_id: string; // obj_xxxxxxxx
  field_id: string; // fld_xxxxxxxx
  field_name: string; // Denormalized from Field
  field_type: string; // Denormalized from Field
  display_order: number; // Auto-calculated
  is_required: boolean;
  is_visible: boolean;
  is_readonly: boolean;
  field_overrides: {
    default_value?: string;
    validation_rules?: Record<string, any>;
  };
  created_at: string;
}

export interface CreateObjectFieldRequest {
  object_id: string;
  field_id: string;
  display_order?: number; // Optional, auto-calculated if not provided
  is_required?: boolean;
  is_visible?: boolean;
  is_readonly?: boolean;
  field_overrides?: Record<string, any>;
}
```

#### dnd-config.ts (dnd-kit setup)
```typescript
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

export const useDndSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    })
  );
};

export const dndConfig = {
  collisionDetection: 'closestCenter' as const,
  modifiers: [],
};
```

---

## Dependencies

### NPM Packages (To Be Installed)
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- `@dnd-kit/core` - Drag and drop core functionality
- `@dnd-kit/sortable` - Sortable list functionality (for reordering fields)
- `@dnd-kit/utilities` - Utility functions for dnd-kit

### Already Installed ✅
- `@tanstack/react-query` - API state management
- `react-hook-form` - Form management
- `zod` - Schema validation

### UI Components (To Be Built)
- `Dialog` component (React Aria)
- `FieldPreview` component (custom)

---

## Acceptance Criteria

- [ ] Field library görüntüleniyor (sol sidebar)
- [ ] Field'lar sürüklenebiliyor (drag-and-drop)
- [ ] Drop zone çalışıyor (highlight on hover)
- [ ] Field drop edilince config dialog açılıyor
- [ ] "Add Field from Library" butonu çalışıyor
- [ ] Field selector searchable (arama çalışıyor)
- [ ] is_required, is_visible, is_readonly config çalışıyor
- [ ] default_value config çalışıyor
- [ ] Field preview gösteriliyor
- [ ] Display order otomatik hesaplanıyor (backend)
- [ ] Başarılı ekleme sonrası list güncelleniyor
- [ ] Başarılı ekleme sonrası success toast gösteriliyor
- [ ] Duplicate field ekleme önleniyor (409 error)
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Error handling çalışıyor (toast messages)
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Field sürükleme çalışıyor
- [ ] Drop zone highlight çalışıyor
- [ ] Config dialog açılıyor
- [ ] Field selector arama çalışıyor
- [ ] Required checkbox çalışıyor
- [ ] Visible checkbox çalışıyor
- [ ] Read-only checkbox çalışıyor
- [ ] Default value input çalışıyor
- [ ] Preview doğru görünüyor
- [ ] API call başarılı (201 Created)
- [ ] Object-field ID auto-generated (ofd_xxxxxxxx)
- [ ] Display order auto-calculated
- [ ] List güncelleniyor (query invalidation)
- [ ] Duplicate field ekleme → 409 error
- [ ] Geçersiz object/field → 404 error
- [ ] Network error → error toast
- [ ] Loading state çalışıyor

### Test Scenarios
```typescript
// Scenario 1: Drag-and-drop field
1. Field library'den "Email" field'ını sürükle
2. Drop zone'a bırak
3. Config dialog açılır
4. "Required" işaretle
5. Default value gir: "user@example.com"
6. "Add Field" butonuna bas
7. Field eklenir, list güncellenir

// Scenario 2: Manual field selection
1. "Add Field from Library" butonuna bas
2. Dialog açılır
3. Search box'a "phone" yaz
4. "Phone Number" seç
5. "Required" işaretle
6. "Add Field" butonuna bas
7. Field eklenir

// Scenario 3: Duplicate field prevention
1. Zaten eklenmiş "Email" field'ını ekle
2. 409 error → "Field already added" toast

// Scenario 4: Display order auto-calculation
1. İlk field ekle → display_order: 0
2. İkinci field ekle → display_order: 1
3. Üçüncü field ekle → display_order: 2
```

---

## Code Examples

### Complete Add Field Flow
```typescript
// 1. User drags field from library
// 2. Field hovers over drop zone (highlight)
// 3. User drops field
// 4. Config dialog opens
// 5. User configures field (required, visible, default_value)
// 6. User clicks "Add Field"
// 7. API call: POST /api/object-fields
// 8. Backend auto-generates ID: ofd_xxxxxxxx
// 9. Backend auto-calculates display_order (next highest)
// 10. Success response received
// 11. Query invalidated, list refreshes
// 12. Success toast shown
// 13. Dialog closes
```

### Error Handling
```typescript
// API Client (object-fields.api.ts)
export const createObjectFieldAPI = async (data: CreateObjectFieldRequest) => {
  try {
    const response = await apiClient.post('/api/object-fields', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Field is already added to this object');
    }
    if (error.response?.status === 404) {
      throw new Error('Object or field not found');
    }
    if (error.response?.status === 422) {
      throw new Error('Invalid field configuration');
    }
    throw new Error('Failed to add field to object');
  }
};
```

### dnd-kit Integration
```typescript
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

// Draggable Field (FieldLibrary.tsx)
const { attributes, listeners, setNodeRef, transform } = useDraggable({
  id: field.id,
  data: { field },
});

// Droppable Zone (ObjectFieldsList.tsx)
const { setNodeRef, isOver } = useDroppable({
  id: 'object-fields-drop-zone',
});

// Handle Drop (ObjectFieldsPage.tsx)
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && over.id === 'object-fields-drop-zone') {
    const fieldId = active.id as string;
    openConfigDialog(fieldId);
  }
};
```

---

## Resources

### Backend Documentation
- [POST /api/object-fields](../../backend-docs/api/07-object-fields/01-create-object-field.md) - Create object-field endpoint
- [GET /api/object-fields](../../backend-docs/api/07-object-fields/02-list-object-fields.md) - List object-fields
- [Frontend Developer Guide](../../backend-docs/api/00-FRONTEND-GUIDE.md) - Complete frontend guide

### Frontend Libraries
- [dnd-kit Docs](https://docs.dndkit.com/) - Drag and drop library
- [TanStack Query Docs](https://tanstack.com/query/latest) - Data fetching
- [React Hook Form Docs](https://react-hook-form.com/) - Form management

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the "Add Field to Object" task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/05-object-fields/01-add-field-to-object.md

Requirements:
1. Install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
2. Create src/features/object-fields/pages/ObjectFieldsPage.tsx - Main page with DndContext
3. Create src/features/object-fields/components/FieldLibrary.tsx - Draggable field list (left sidebar)
4. Create src/features/object-fields/components/ObjectFieldsList.tsx - Drop zone + current fields list
5. Create src/features/object-fields/components/AddFieldToObjectDialog.tsx - Field selector + config dialog
6. Create src/features/object-fields/components/FieldConfigForm.tsx - Configuration form (required, visible, readonly, default_value)
7. Create src/features/object-fields/hooks/useAddFieldToObject.ts - TanStack Query mutation
8. Create src/features/object-fields/hooks/useObjectFields.ts - Get object fields query
9. Create src/features/object-fields/hooks/useFieldLibrary.ts - Get available fields query
10. Create src/lib/api/object-fields.api.ts - API functions (createObjectFieldAPI, getObjectFieldsAPI)
11. Create src/lib/dnd/dnd-config.ts - dnd-kit configuration
12. Create src/components/ui/FieldPreview.tsx - Field preview component
13. Update src/features/object-fields/types/object-field.types.ts - TypeScript types

CRITICAL REQUIREMENTS:
- Use dnd-kit library for drag-and-drop functionality
- Backend auto-generates object-field ID as ofd_xxxxxxxx
- Backend auto-calculates display_order (next highest number)
- Implement both drag-and-drop AND manual field selection methods
- Show configuration dialog after drop or selection
- Field preview must show how field will look in forms
- Handle 409 error (duplicate field) gracefully
- Show success toast after successful addition
- Invalidate queries to refresh list after addition
- Searchable field selector in dialog
- Mobile responsive design with Tailwind CSS 4

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 02-reorder-object-fields.md
