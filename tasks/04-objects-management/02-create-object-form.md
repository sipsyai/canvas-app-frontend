# Task: Create Object Form

**Priority:** 🟡 Medium
**Estimated Time:** 2 gün
**Dependencies:** 01-object-list-page, 09-ui-components

---

## Objective

Kullanıcıların yeni object (Contact, Company, Opportunity gibi veri tabloları) oluşturabilmesi için form sayfası/modal geliştirmek. Form arama yapılabilir icon picker, renk seçici ve canlı önizleme içerir.

---

## Backend API

### Endpoint
```
POST /api/objects
```

### Request Format
**Content-Type:** `application/json`

```typescript
interface CreateObjectRequest {
  name: string;           // snake_case, unique, 1-255 karakter
  label: string;          // Görünen ad, 1-255 karakter
  plural_name: string;    // Çoğul isim, 1-255 karakter
  description?: string;   // Object açıklaması (opsiyonel)
  icon?: string;          // Lucide icon adı veya emoji (opsiyonel)
  color?: string;         // Hex color code (opsiyonel, ör: #3B82F6)
  category?: string;      // Kategori (ör: "Sales", "Support", "Custom")
}
```

### Response
```json
{
  "id": "obj_a1b2c3d4",
  "name": "contact",
  "label": "Contact",
  "plural_name": "Contacts",
  "description": "Customer contacts",
  "icon": "user",
  "color": "#3B82F6",
  "category": "Sales",
  "is_custom": true,
  "is_global": false,
  "views": {
    "forms": [],
    "tables": [],
    "kanbans": [],
    "calendars": []
  },
  "permissions": {
    "create": ["all"],
    "read": ["all"],
    "update": ["all"],
    "delete": ["all"]
  },
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": "2026-01-18T10:00:00Z"
}
```

**Response Fields:**
- `id` - Backend tarafından otomatik oluşturulan ID (obj_xxxxxxxx formatında)
- `name` - Object'in teknik adı (snake_case)
- `label` - Tekil görünen ad
- `plural_name` - Çoğul görünen ad
- `is_custom` - Custom object (kullanıcı tarafından oluşturuldu)
- `is_global` - Global object (tüm kullanıcılar erişebilir)

### Error Responses
- `400 Bad Request` - Geçersiz veri formatı
- `409 Conflict` - Object name zaten mevcut (unique constraint)
- `401 Unauthorized` - JWT token eksik veya geçersiz
- `422 Unprocessable Entity` - Validation hatası

**Backend Documentation:**
→ [POST /api/objects](../../backend-docs/api/03-objects/01-create-object.md)

---

## UI/UX Design

### Modal Layout (Önerilen)
```
┌───────────────────────────────────────────────────────┐
│  Create New Object                           [X]      │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │ Preview Card    │  │ Form Fields               │  │
│  │                 │  │                           │  │
│  │  [Icon] Label   │  │  Label *                  │  │
│  │  Plural Name    │  │  [Contact            ]    │  │
│  │  Category       │  │                           │  │
│  │                 │  │  Plural Name *            │  │
│  │                 │  │  [Contacts           ]    │  │
│  │                 │  │                           │  │
│  │                 │  │  Name (auto-generated) *  │  │
│  │                 │  │  [contact            ]    │  │
│  │                 │  │  ⚠️ Auto-generated       │  │
│  │                 │  │                           │  │
│  │                 │  │  Category                 │  │
│  │                 │  │  [Sales ▼]                │  │
│  │                 │  │                           │  │
│  │                 │  │  Description              │  │
│  │                 │  │  [Customer contacts...]   │  │
│  │                 │  │                           │  │
│  │                 │  │  Icon                     │  │
│  │                 │  │  [🔍 Search icons...]     │  │
│  │                 │  │  Popular: 👤 🏢 📧 📱    │  │
│  │                 │  │                           │  │
│  │                 │  │  Color                    │  │
│  │                 │  │  ⬤ ⬤ ⬤ ⬤ ⬤ [#3B82F6]   │  │
│  │                 │  │                           │  │
│  └─────────────────┘  └──────────────────────────┘  │
│                                                       │
│                      [Cancel]  [Create Object]       │
└───────────────────────────────────────────────────────┘
```

### Alternative: Separate Page Layout
```
┌───────────────────────────────────────────────────────┐
│  ← Back to Objects          Create New Object         │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Live Preview                                   │  │
│  │ ┌────────────────┐                             │  │
│  │ │ [Icon] Label   │                             │  │
│  │ │ Plural Name    │                             │  │
│  │ │ Category       │                             │  │
│  │ └────────────────┘                             │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Basic Information                              │  │
│  │                                                 │  │
│  │ Label *             Plural Name *               │  │
│  │ [Contact      ]     [Contacts      ]            │  │
│  │                                                 │  │
│  │ Name (auto-generated from label) *              │  │
│  │ [contact                          ]             │  │
│  │ ⚠️ Auto-generated, can be edited               │  │
│  │                                                 │  │
│  │ Category                                        │  │
│  │ [Select category ▼]                             │  │
│  │                                                 │  │
│  │ Description                                     │  │
│  │ [Customer contacts and information...]          │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Appearance                                      │  │
│  │                                                 │  │
│  │ Icon                                            │  │
│  │ [🔍 Search icons (user, home, building...)  ]   │  │
│  │                                                 │  │
│  │ Popular Icons:                                  │  │
│  │ [👤] [🏢] [📧] [📱] [💼] [📁] [📊] [🎯]        │  │
│  │                                                 │  │
│  │ Color                                           │  │
│  │ ⬤ Blue  ⬤ Green  ⬤ Red  ⬤ Purple  ⬤ Orange    │  │
│  │ Custom: [#3B82F6]                               │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│                       [Cancel]  [Create Object]      │
└───────────────────────────────────────────────────────┘
```

### Form Fields

1. **Label** (Zorunlu)
   - Type: text
   - Placeholder: "Contact"
   - Validation: 1-255 karakter
   - Auto-suggest: İlk harfi büyük yap
   - Trigger: `name` alanını otomatik doldur (snake_case)

2. **Plural Name** (Zorunlu)
   - Type: text
   - Placeholder: "Contacts"
   - Validation: 1-255 karakter
   - Auto-suggest: Label'a 's' ekle

3. **Name** (Zorunlu, Auto-generated)
   - Type: text
   - Auto-filled: Label'dan snake_case'e çevir
   - Editable: Kullanıcı düzenleyebilir
   - Validation: snake_case, unique, 1-255 karakter
   - Pattern: /^[a-z][a-z0-9_]*$/
   - Warning: "Auto-generated from label. You can edit if needed."

4. **Category** (Opsiyonel)
   - Type: select/combobox
   - Options: "Sales", "Support", "Marketing", "Custom", "Other"
   - Default: "Custom"

5. **Description** (Opsiyonel)
   - Type: textarea
   - Placeholder: "Describe what this object is used for..."
   - Max: 500 karakter

6. **Icon Picker** (Opsiyonel)
   - Type: searchable dropdown
   - Library: Lucide React Icons
   - Features:
     - 🔍 Search by name (ör: "user", "home", "mail")
     - Popular icons section (ilk 8-12 icon)
     - Icon preview with name
     - Emoji support (fallback)
   - Default: Generic icon (Box veya Package)

7. **Color Picker** (Opsiyonel)
   - Type: color palette + hex input
   - Preset colors: 8-10 renk (Blue, Green, Red, Purple, Orange, Pink, Teal, Gray)
   - Custom: Hex input (#RRGGBB)
   - Default: Blue (#3B82F6)

### Live Preview Card
Kullanıcı form doldururken preview card'ı güncellensin:
```
┌──────────────────┐
│  [Icon] Label    │
│  Plural Name     │
│  📂 Category     │
└──────────────────┘
```
- Icon: Seçilen icon veya default
- Background: Seçilen renk
- Real-time update

### States
- **Idle** - Form boş, Create button disabled
- **Filling** - Kullanıcı veri giriyor, validation çalışıyor
- **Validating** - Name uniqueness kontrolü (backend check)
- **Loading** - API call yapılıyor, button disabled + spinner
- **Success** - Modal/sayfa kapanır, object list'e yeni item eklenir
- **Error** - Hata mesajı göster (toast/alert)

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── objects/
│       ├── pages/
│       │   └── CreateObjectPage.tsx       ⭐ Full page (alternative)
│       ├── components/
│       │   ├── CreateObjectModal.tsx      ⭐ Modal component (recommended)
│       │   ├── CreateObjectForm.tsx       ⭐ Form component
│       │   ├── ObjectPreviewCard.tsx      ⭐ Live preview
│       │   ├── IconPicker.tsx             ⭐ Icon picker with search
│       │   └── ColorPicker.tsx            ⭐ Color picker
│       ├── hooks/
│       │   ├── useCreateObject.ts         ⭐ TanStack Query mutation
│       │   └── useCheckObjectName.ts      ⭐ Name uniqueness check
│       ├── types/
│       │   └── object.types.ts            ⭐ TypeScript types
│       └── utils/
│           ├── objectSchema.ts            ⭐ Zod validation schema
│           └── objectHelpers.ts           ⭐ Helper functions (labelToName)
├── lib/
│   └── api/
│       └── objects.api.ts                 ⭐ API calls
└── components/
    └── ui/
        └── Modal.tsx                       ⭐ Base modal component
```

### Component Implementation

#### CreateObjectModal.tsx
```typescript
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CreateObjectForm } from './CreateObjectForm';
import { ObjectPreviewCard } from './ObjectPreviewCard';

interface CreateObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (object: ObjectResponse) => void;
}

export const CreateObjectModal = ({ isOpen, onClose, onSuccess }: CreateObjectModalProps) => {
  const [previewData, setPreviewData] = useState({
    label: '',
    plural_name: '',
    icon: 'box',
    color: '#3B82F6',
    category: 'Custom',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Object"
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Section */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
          <ObjectPreviewCard
            label={previewData.label || 'Object Name'}
            pluralName={previewData.plural_name || 'Object Names'}
            icon={previewData.icon}
            color={previewData.color}
            category={previewData.category}
          />
        </div>

        {/* Form Section */}
        <div className="lg:col-span-2">
          <CreateObjectForm
            onPreviewChange={setPreviewData}
            onSuccess={(object) => {
              onSuccess?.(object);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </Modal>
  );
};
```

#### CreateObjectForm.tsx
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { objectSchema, type ObjectFormData } from '../utils/objectSchema';
import { useCreateObject } from '../hooks/useCreateObject';
import { labelToSnakeCase } from '../utils/objectHelpers';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';

interface CreateObjectFormProps {
  onPreviewChange?: (data: Partial<ObjectFormData>) => void;
  onSuccess?: (object: ObjectResponse) => void;
  onCancel?: () => void;
}

export const CreateObjectForm = ({ onPreviewChange, onSuccess, onCancel }: CreateObjectFormProps) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ObjectFormData>({
    resolver: zodResolver(objectSchema),
    defaultValues: {
      category: 'Custom',
      icon: 'box',
      color: '#3B82F6',
    },
  });

  const { mutate: createObject, isPending, isError, error } = useCreateObject();

  // Watch all fields for live preview
  const watchedFields = watch();

  // Auto-generate name from label
  const label = watch('label');
  useEffect(() => {
    if (label) {
      const autoName = labelToSnakeCase(label);
      setValue('name', autoName);
    }
  }, [label, setValue]);

  // Update preview
  useEffect(() => {
    onPreviewChange?.(watchedFields);
  }, [watchedFields, onPreviewChange]);

  const onSubmit = (data: ObjectFormData) => {
    createObject(data, {
      onSuccess: (object) => {
        onSuccess?.(object);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Contact"
              {...register('label')}
              error={errors.label?.message}
            />
            <p className="mt-1 text-xs text-gray-500">Singular display name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plural Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Contacts"
              {...register('plural_name')}
              error={errors.plural_name?.message}
            />
            <p className="mt-1 text-xs text-gray-500">Plural display name</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name (auto-generated) <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="contact"
            {...register('name')}
            error={errors.name?.message}
          />
          <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
            <span>⚠️</span>
            Auto-generated from label. Use snake_case (lowercase, underscores).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select {...register('category')}>
            <option value="Sales">Sales</option>
            <option value="Support">Support</option>
            <option value="Marketing">Marketing</option>
            <option value="Custom">Custom</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            placeholder="Describe what this object is used for..."
            rows={3}
            maxLength={500}
            {...register('description')}
            error={errors.description?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            {watch('description')?.length || 0}/500 characters
          </p>
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Appearance</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icon
          </label>
          <IconPicker
            value={watch('icon')}
            onChange={(icon) => setValue('icon', icon)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <ColorPicker
            value={watch('color')}
            onChange={(color) => setValue('color', color)}
          />
        </div>
      </div>

      {/* Error Message */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error?.message || 'Failed to create object. Please try again.'}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
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
          {isPending ? 'Creating...' : 'Create Object'}
        </Button>
      </div>
    </form>
  );
};
```

#### IconPicker.tsx
```typescript
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import * as LucideIcons from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const POPULAR_ICONS = [
  'user', 'users', 'building', 'mail', 'phone',
  'briefcase', 'folder', 'bar-chart', 'target', 'calendar',
  'shopping-cart', 'package', 'truck', 'credit-card', 'dollar-sign'
];

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const [search, setSearch] = useState('');

  // Get all available Lucide icons
  const allIcons = useMemo(() => {
    return Object.keys(LucideIcons).filter(
      (key) => key !== 'default' && key !== 'createLucideIcon'
    );
  }, []);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) return POPULAR_ICONS;
    return allIcons.filter((icon) =>
      icon.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 24); // Limit results
  }, [search, allIcons]);

  const getIconComponent = (iconName: string) => {
    const Icon = LucideIcons[iconName as keyof typeof LucideIcons];
    return Icon ? <Icon size={20} /> : null;
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <Input
        placeholder="Search icons (user, home, mail...)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon="search"
      />

      {/* Icon Grid */}
      <div className="border rounded-lg p-3 max-h-64 overflow-y-auto">
        {!search && (
          <p className="text-xs text-gray-500 mb-2">Popular Icons:</p>
        )}
        <div className="grid grid-cols-6 gap-2">
          {filteredIcons.map((iconName) => (
            <button
              key={iconName}
              type="button"
              onClick={() => onChange(iconName)}
              className={`
                p-3 rounded-lg border-2 transition-all
                hover:border-blue-300 hover:bg-blue-50
                ${value === iconName
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
                }
              `}
              title={iconName}
            >
              {getIconComponent(iconName)}
            </button>
          ))}
        </div>

        {filteredIcons.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-8">
            No icons found. Try different keywords.
          </p>
        )}
      </div>

      {/* Selected Icon Display */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Selected:</span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded">
          {getIconComponent(value)}
          <span className="font-mono text-xs">{value}</span>
        </div>
      </div>
    </div>
  );
};
```

#### ColorPicker.tsx
```typescript
import { Input } from '@/components/ui/Input';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Gray', value: '#6B7280' },
];

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <div className="space-y-3">
      {/* Preset Colors */}
      <div className="grid grid-cols-4 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
              hover:border-gray-400
              ${value === color.value ? 'border-gray-700' : 'border-gray-200'}
            `}
          >
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: color.value }}
            />
            <span className="text-sm font-medium">{color.name}</span>
          </button>
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="#3B82F6"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          pattern="^#[0-9A-Fa-f]{6}$"
          maxLength={7}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border-2 border-gray-300 rounded cursor-pointer"
        />
      </div>

      {/* Preview */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Preview:</span>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded" style={{ backgroundColor: value }}>
          <span className="text-white font-medium">Sample Text</span>
        </div>
      </div>
    </div>
  );
};
```

#### ObjectPreviewCard.tsx
```typescript
import * as LucideIcons from 'lucide-react';

interface ObjectPreviewCardProps {
  label: string;
  pluralName: string;
  icon: string;
  color: string;
  category?: string;
}

export const ObjectPreviewCard = ({
  label,
  pluralName,
  icon,
  color,
  category,
}: ObjectPreviewCardProps) => {
  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons];

  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-sm">
      <div className="flex items-start gap-4">
        {/* Icon Circle */}
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {IconComponent ? <IconComponent size={28} /> : null}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-600">{pluralName}</p>
          {category && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500">📂 {category}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Preview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500">Records</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500">Fields</p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### objectSchema.ts
```typescript
import { z } from 'zod';

export const objectSchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(255, 'Label must be 255 characters or less')
    .trim(),

  plural_name: z
    .string()
    .min(1, 'Plural name is required')
    .max(255, 'Plural name must be 255 characters or less')
    .trim(),

  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less')
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Name must be lowercase, start with a letter, and contain only letters, numbers, and underscores'
    )
    .trim(),

  category: z.string().optional(),

  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),

  icon: z.string().optional(),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #3B82F6)')
    .optional(),
});

export type ObjectFormData = z.infer<typeof objectSchema>;
```

#### objectHelpers.ts
```typescript
/**
 * Convert label to snake_case for object name
 * Example: "Contact Person" → "contact_person"
 */
export const labelToSnakeCase = (label: string): string => {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')        // Spaces to underscores
    .replace(/[^\w_]/g, '')      // Remove non-word chars
    .replace(/_{2,}/g, '_')      // Multiple underscores to single
    .replace(/^_+|_+$/g, '');    // Remove leading/trailing underscores
};

/**
 * Suggest plural name from label
 * Example: "Contact" → "Contacts"
 */
export const suggestPluralName = (label: string): string => {
  const trimmed = label.trim();
  if (!trimmed) return '';

  // Simple pluralization rules (English)
  if (trimmed.endsWith('y') && !/[aeiou]y$/i.test(trimmed)) {
    return trimmed.slice(0, -1) + 'ies'; // "Company" → "Companies"
  }
  if (trimmed.endsWith('s') || trimmed.endsWith('x') || trimmed.endsWith('sh') || trimmed.endsWith('ch')) {
    return trimmed + 'es'; // "Business" → "Businesses"
  }
  return trimmed + 's'; // "Contact" → "Contacts"
};
```

#### useCreateObject.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createObjectAPI } from '@/lib/api/objects.api';
import { toast } from '@/hooks/useToast';

export const useCreateObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createObjectAPI,
    onSuccess: (data) => {
      // Invalidate objects list
      queryClient.invalidateQueries({ queryKey: ['objects'] });

      // Show success message
      toast.success(`Object "${data.label}" created successfully!`);
    },
    onError: (error: any) => {
      console.error('Failed to create object:', error);

      // Handle specific errors
      if (error.response?.status === 409) {
        toast.error('An object with this name already exists.');
      } else if (error.response?.status === 422) {
        toast.error('Please check your input and try again.');
      } else {
        toast.error('Failed to create object. Please try again.');
      }
    },
  });
};
```

#### objects.api.ts
```typescript
import { apiClient } from './client';
import type { ObjectFormData } from '@/features/objects/utils/objectSchema';
import type { ObjectResponse } from '@/features/objects/types/object.types';

export const createObjectAPI = async (data: ObjectFormData): Promise<ObjectResponse> => {
  const response = await apiClient.post<ObjectResponse>('/api/objects', data);
  return response.data;
};

export const listObjectsAPI = async (): Promise<ObjectResponse[]> => {
  const response = await apiClient.get<ObjectResponse[]>('/api/objects');
  return response.data;
};
```

#### object.types.ts
```typescript
export interface ObjectResponse {
  id: string;                    // obj_xxxxxxxx
  name: string;                  // snake_case
  label: string;                 // Display name
  plural_name: string;           // Plural display name
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  is_custom: boolean;
  is_global: boolean;
  views: {
    forms: any[];
    tables: any[];
    kanbans: any[];
    calendars: any[];
  };
  permissions: {
    create: string[];
    read: string[];
    update: string[];
    delete: string[];
  };
  created_by: string;            // UUID
  created_at: string;            // ISO datetime
  updated_at: string;            // ISO datetime
}

export interface CreateObjectRequest {
  name: string;
  label: string;
  plural_name: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@tanstack/react-query` - API state management
- `lucide-react` - Icon library (1000+ icons)

### UI Components (To Be Built)
- `Modal` component
- `Input` component
- `Textarea` component
- `Select` component
- `Button` component

---

## Acceptance Criteria

- [ ] Create object modal/page açılıyor
- [ ] Form validation çalışıyor (Zod schema)
- [ ] Label girişi → Name otomatik snake_case'e çevriliyor
- [ ] Label girişi → Plural name otomatik öneriliyor
- [ ] Icon picker arama çalışıyor (Lucide icons)
- [ ] Popular icons section gösteriliyor
- [ ] Color picker preset colors ve custom hex input çalışıyor
- [ ] Live preview card real-time güncelleniyor
- [ ] Başarılı submit sonrası object oluşturuluyor (backend)
- [ ] Başarılı submit sonrası modal kapanıyor
- [ ] Object list yeni item ile güncelleniyor (cache invalidation)
- [ ] Duplicate name hatası yakalanıyor (409 Conflict)
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Error handling çalışıyor (toast messages)
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Boş form submit → validation errors
- [ ] Label gir → name otomatik snake_case
- [ ] Label "Contact" → plural_name "Contacts" önerisi
- [ ] Icon search "user" → user iconları göster
- [ ] Icon seç → preview card'da görünsün
- [ ] Color seç → preview card rengi değişsin
- [ ] Custom hex color gir → preview güncellensin
- [ ] Valid form submit → success + modal kapansın
- [ ] Duplicate name → 409 error mesajı
- [ ] Network error → error toast
- [ ] Loading state → button disabled
- [ ] Success → object list'te yeni item
- [ ] Preview card → real-time update

### Edge Cases
- [ ] Label boşluklar içersin → name doğru temizlensin
- [ ] Label özel karakterler → name temizlensin
- [ ] Çok uzun label (>255) → validation error
- [ ] Geçersiz hex color → validation error
- [ ] Icon search sonuç yok → "No icons found" mesajı

---

## Code Examples

### Complete Object Creation Flow
```typescript
// 1. User opens modal/page
// 2. User enters "Contact" in label → name auto-fills "contact"
// 3. User enters "Contacts" in plural_name (or accepts suggestion)
// 4. User selects category "Sales"
// 5. User searches "user" icon → selects user icon
// 6. User selects blue color
// 7. Preview card updates in real-time
// 8. User clicks "Create Object"
// 9. Form validation passes (Zod)
// 10. API call to POST /api/objects
// 11. Backend creates object with ID "obj_a1b2c3d4"
// 12. Success → Modal closes
// 13. Object list refreshes with new item
// 14. Toast: "Object 'Contact' created successfully!"
```

### Error Handling
```typescript
// API Client (objects.api.ts)
export const createObjectAPI = async (data: ObjectFormData) => {
  try {
    const response = await apiClient.post('/api/objects', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('An object with this name already exists.');
    }
    if (error.response?.status === 422) {
      const detail = error.response.data?.detail || 'Validation error';
      throw new Error(detail);
    }
    if (error.response?.status === 401) {
      throw new Error('You are not authorized. Please log in again.');
    }
    throw new Error('Failed to create object. Please try again.');
  }
};
```

### Auto-suggestion Logic
```typescript
// In CreateObjectForm.tsx
import { suggestPluralName } from '../utils/objectHelpers';

// Watch label changes
const label = watch('label');

// Auto-suggest plural name (if user hasn't manually edited it)
useEffect(() => {
  if (label && !pluralNameManuallyEdited) {
    const suggestion = suggestPluralName(label);
    setValue('plural_name', suggestion);
  }
}, [label]);
```

---

## Resources

### Backend Documentation
- [POST /api/objects](../../backend-docs/api/03-objects/01-create-object.md) - Detailed endpoint documentation
- [Objects Overview](../../backend-docs/api/03-objects/README.md) - Object system overview

### Frontend Libraries
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [Lucide Icons](https://lucide.dev/) - Icon library
- [TanStack Query Docs](https://tanstack.com/query/latest)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Create Object Form task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/04-objects-management/02-create-object-form.md

Requirements:
1. Create src/features/objects/components/CreateObjectModal.tsx - Modal component with preview + form
2. Create src/features/objects/components/CreateObjectForm.tsx - Form component with React Hook Form + Zod
3. Create src/features/objects/components/IconPicker.tsx - Searchable icon picker (Lucide icons)
4. Create src/features/objects/components/ColorPicker.tsx - Color picker (presets + custom hex)
5. Create src/features/objects/components/ObjectPreviewCard.tsx - Live preview card
6. Create src/features/objects/hooks/useCreateObject.ts - TanStack Query mutation hook
7. Create src/features/objects/utils/objectSchema.ts - Zod validation schema
8. Create src/features/objects/utils/objectHelpers.ts - Helper functions (labelToSnakeCase, suggestPluralName)
9. Update src/lib/api/objects.api.ts - Add createObjectAPI function
10. Update src/features/objects/types/object.types.ts - Add ObjectResponse and CreateObjectRequest types

CRITICAL REQUIREMENTS:
- Use POST /api/objects endpoint (JSON format)
- Backend auto-generates object ID as obj_xxxxxxxx
- Auto-generate name from label (snake_case) but allow editing
- Auto-suggest plural_name from label
- Icon picker: Searchable with Lucide icons, show popular icons first
- Color picker: 8 preset colors + custom hex input
- Live preview card: Updates in real-time as user types
- Form validation: Zod schema (name uniqueness, snake_case pattern, length limits)
- Handle 409 Conflict error (duplicate name)
- Mobile responsive design with Tailwind CSS 4
- Success → Close modal, invalidate cache, show toast

Follow the exact code examples and file structure provided in the task file. Use Turkish language for labels and messages where appropriate.
```

---

**Status:** 🟡 Pending
**Next Task:** 03-object-detail-page.md
