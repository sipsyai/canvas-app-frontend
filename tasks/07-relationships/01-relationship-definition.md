# Task: Relationship Definition (İlişki Tanımlama)

**Priority:** 🟡 Medium
**Estimated Time:** 2 gün
**Dependencies:** 04-objects-management

---

## Objective

İki object arasında ilişki tanımlayabilmek için relationship builder sayfası oluşturmak. **Bidirectional (çift yönlü) ilişki doğası vurgulanmalı:** Bir ilişki tanımlandığında, her iki object de birbirini görebilir.

---

## Backend API

### Endpoint
```
POST /api/relationships
```

### Request Format
```typescript
interface CreateRelationshipRequest {
  name: string;                    // İlişki adı (otomatik generate edilebilir)
  from_object_id: string;          // Kaynak object ID (örn: obj_contact)
  to_object_id: string;            // Hedef object ID (örn: obj_opportunity)
  type: '1:N' | 'N:N';            // İlişki tipi
  from_label?: string;             // Kaynak object'te görünecek label
  to_label?: string;               // Hedef object'te görünecek label
}
```

### Response
```json
{
  "id": "rel_a1b2c3d4",
  "name": "contact_opportunities",
  "from_object_id": "obj_contact",
  "to_object_id": "obj_opportunity",
  "type": "1:N",
  "from_label": "Opportunities",
  "to_label": "Contact",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-18T10:00:00Z"
}
```

**Response Fields:**
- `id` - Relationship ID (rel_xxxxxxxx formatında)
- `name` - İlişki adı (genellikle from_object_to_object formatında)
- `from_object_id` - Kaynak object ID
- `to_object_id` - Hedef object ID
- `type` - "1:N" (One-to-Many) veya "N:N" (Many-to-Many)
- `from_label` - Kaynak object'te görünecek label (örn: "Opportunities")
- `to_label` - Hedef object'te görünecek label (örn: "Contact")
- `created_by` - Oluşturan kullanıcı UUID
- `created_at` - Oluşturulma zamanı

### İlişki Tipleri
1. **1:N (One-to-Many)**
   - Bir kayıt birden fazla hedef kayıta bağlanabilir
   - Örnek: Bir Contact → Birden fazla Opportunity
   - Kaynak tarafta: "Opportunities" (çoğul)
   - Hedef tarafta: "Contact" (tekil)

2. **N:N (Many-to-Many)**
   - Bir kayıt birden fazla hedef kayıta, hedef kayıt da birden fazla kaynak kayıta bağlanabilir
   - Örnek: Product ↔ Category (bir ürün birden fazla kategoriye, bir kategori birden fazla ürüne sahip)
   - Her iki tarafta da çoğul label kullanılır

### Error Responses
- `422 Unprocessable Entity` - Validation hatası (eksik field, geçersiz type)
- `401 Unauthorized` - JWT token eksik veya geçersiz

**Backend Documentation:**
→ [POST /api/relationships](../../backend-docs/api/06-relationships/01-create-relationship.md)

---

## UI/UX Design

### Page Layout
```
┌──────────────────────────────────────────────────────┐
│  Relationships > Create New Relationship             │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  Step 1: Select Objects                       │ │
│  │                                                │ │
│  │  From Object:        [Select Object ▼]        │ │
│  │                      Contact                   │ │
│  │                                                │ │
│  │  To Object:          [Select Object ▼]        │ │
│  │                      Opportunity               │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  Step 2: Relationship Type                    │ │
│  │                                                │ │
│  │  ○ 1:N (One-to-Many)                          │ │
│  │     One Contact → Many Opportunities          │ │
│  │                                                │ │
│  │  ○ N:N (Many-to-Many)                         │ │
│  │     Many Contacts ↔ Many Opportunities        │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  Step 3: Labels (Optional)                    │ │
│  │                                                │ │
│  │  From Label (shown on Contact):               │ │
│  │  [Opportunities                          ]     │ │
│  │                                                │ │
│  │  To Label (shown on Opportunity):             │ │
│  │  [Contact                                ]     │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  Visual Preview                               │ │
│  │                                                │ │
│  │     ┌─────────┐                ┌──────────┐  │ │
│  │     │Contact  │───────────────>│Opportun. │  │ │
│  │     │         │ Opportunities  │          │  │ │
│  │     │         │<───────────────│          │  │ │
│  │     └─────────┘    Contact     └──────────┘  │ │
│  │                                                │ │
│  │  Relationship Name: contact_opportunities     │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  [Cancel]                    [Create Relationship]   │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Form Sections

#### 1. Select Objects Section
- **From Object Dropdown**
  - Object listesinden seçim (GET /api/objects endpoint'inden)
  - Display: Object name (örn: "Contact")
  - Value: Object ID (örn: "obj_contact")

- **To Object Dropdown**
  - Object listesinden seçim
  - From object ile aynı object seçilemez (validation)

#### 2. Relationship Type Section
- **Radio Button Group**
  - Option 1: 1:N (One-to-Many)
    - Description: "One Contact → Many Opportunities"
    - Icon: Single arrow (→)

  - Option 2: N:N (Many-to-Many)
    - Description: "Many Contacts ↔ Many Opportunities"
    - Icon: Double arrow (↔)

#### 3. Labels Section (Optional)
- **From Label Input**
  - Placeholder: Auto-generated from to_object name
  - Örnek: "Opportunities" (çoğul form)
  - Help text: "Label shown on Contact records"

- **To Label Input**
  - Placeholder: Auto-generated from from_object name
  - Örnek: "Contact" (tekil form for 1:N, çoğul for N:N)
  - Help text: "Label shown on Opportunity records"

#### 4. Visual Preview Section
- **Relationship Diagram**
  - İki kutucuk (from object ve to object)
  - Aralarında ok (1:N için tek yön, N:N için çift yön)
  - Label'lar ok üzerinde gösterilir
  - Bidirectional nature vurgulanır

- **Auto-generated Name**
  - Format: `{from_object}_{to_object}` (örn: "contact_opportunities")
  - Lowercase, underscore ile ayrılmış

### States
- **Idle** - Form boş, butona basılabilir
- **Loading Objects** - Object listesi yükleniyor
- **Validating** - Form validation yapılıyor
- **Creating** - API call yapılıyor, button disabled + spinner
- **Success** - Relationship created, redirect to relationships list
- **Error** - Hata mesajı göster (toast/alert)

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── relationships/
│       ├── pages/
│       │   ├── RelationshipsPage.tsx         ⭐ List page
│       │   └── CreateRelationshipPage.tsx    ⭐ Create page
│       ├── components/
│       │   ├── CreateRelationshipForm.tsx    ⭐ Main form
│       │   ├── ObjectSelector.tsx            ⭐ Object dropdown
│       │   ├── RelationshipTypeSelector.tsx  ⭐ Type radio buttons
│       │   ├── RelationshipLabels.tsx        ⭐ Label inputs
│       │   └── RelationshipDiagram.tsx       ⭐ Visual preview
│       ├── hooks/
│       │   ├── useCreateRelationship.ts      ⭐ Create mutation
│       │   ├── useRelationships.ts           ⭐ List query
│       │   └── useObjects.ts                 ⭐ Fetch objects for dropdown
│       └── types/
│           └── relationship.types.ts         ⭐ TypeScript types
├── lib/
│   └── api/
│       └── relationships.api.ts              ⭐ API calls
└── utils/
    └── relationship-utils.ts                 ⭐ Helper functions
```

### Component Implementation

#### CreateRelationshipPage.tsx
```typescript
import { CreateRelationshipForm } from '../components/CreateRelationshipForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CreateRelationshipPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/relationships"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Relationships
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Relationship
          </h1>
          <p className="text-gray-600 mt-2">
            Define how two objects relate to each other. Relationships are bidirectional.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <CreateRelationshipForm />
        </div>
      </div>
    </div>
  );
};
```

#### CreateRelationshipForm.tsx
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRelationship } from '../hooks/useCreateRelationship';
import { useObjects } from '../hooks/useObjects';
import { ObjectSelector } from './ObjectSelector';
import { RelationshipTypeSelector } from './RelationshipTypeSelector';
import { RelationshipLabels } from './RelationshipLabels';
import { RelationshipDiagram } from './RelationshipDiagram';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';

const relationshipSchema = z.object({
  from_object_id: z.string().min(1, 'Please select a from object'),
  to_object_id: z.string().min(1, 'Please select a to object'),
  type: z.enum(['1:N', 'N:N'], { required_error: 'Please select a relationship type' }),
  from_label: z.string().optional(),
  to_label: z.string().optional(),
}).refine((data) => data.from_object_id !== data.to_object_id, {
  message: 'From object and to object cannot be the same',
  path: ['to_object_id'],
});

type RelationshipFormData = z.infer<typeof relationshipSchema>;

export const CreateRelationshipForm = () => {
  const { data: objects, isLoading: objectsLoading } = useObjects();
  const { mutate: createRelationship, isPending, isError, error } = useCreateRelationship();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<RelationshipFormData>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: {
      type: '1:N',
    },
  });

  const fromObjectId = watch('from_object_id');
  const toObjectId = watch('to_object_id');
  const relationshipType = watch('type');
  const fromLabel = watch('from_label');
  const toLabel = watch('to_label');

  // Auto-generate labels when objects are selected
  useEffect(() => {
    if (fromObjectId && toObjectId && objects) {
      const fromObject = objects.find((obj) => obj.id === fromObjectId);
      const toObject = objects.find((obj) => obj.id === toObjectId);

      if (fromObject && toObject) {
        // Auto-generate from_label (shown on from_object, plural)
        if (!fromLabel) {
          setValue('from_label', pluralize(toObject.name));
        }

        // Auto-generate to_label (shown on to_object)
        if (!toLabel) {
          setValue('to_label', relationshipType === '1:N' ? fromObject.name : pluralize(fromObject.name));
        }
      }
    }
  }, [fromObjectId, toObjectId, relationshipType, objects, fromLabel, toLabel, setValue]);

  const onSubmit = (data: RelationshipFormData) => {
    // Auto-generate name
    const fromObject = objects?.find((obj) => obj.id === data.from_object_id);
    const toObject = objects?.find((obj) => obj.id === data.to_object_id);

    const name = `${fromObject?.name.toLowerCase()}_${toObject?.name.toLowerCase()}`.replace(/\s+/g, '_');

    createRelationship({
      name,
      from_object_id: data.from_object_id,
      to_object_id: data.to_object_id,
      type: data.type,
      from_label: data.from_label,
      to_label: data.to_label,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
      {/* Step 1: Select Objects */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Step 1: Select Objects
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <ObjectSelector
            label="From Object"
            objects={objects || []}
            isLoading={objectsLoading}
            error={errors.from_object_id?.message}
            {...register('from_object_id')}
          />
          <ObjectSelector
            label="To Object"
            objects={objects || []}
            isLoading={objectsLoading}
            error={errors.to_object_id?.message}
            {...register('to_object_id')}
          />
        </div>
      </div>

      {/* Step 2: Relationship Type */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Step 2: Relationship Type
        </h2>
        <RelationshipTypeSelector
          error={errors.type?.message}
          {...register('type')}
        />
      </div>

      {/* Step 3: Labels */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Step 3: Labels (Optional)
        </h2>
        <RelationshipLabels
          fromObjectName={objects?.find((obj) => obj.id === fromObjectId)?.name}
          toObjectName={objects?.find((obj) => obj.id === toObjectId)?.name}
          relationshipType={relationshipType}
          fromLabelRegister={register('from_label')}
          toLabelRegister={register('to_label')}
        />
      </div>

      {/* Visual Preview */}
      {fromObjectId && toObjectId && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Visual Preview
          </h2>
          <RelationshipDiagram
            fromObject={objects?.find((obj) => obj.id === fromObjectId)}
            toObject={objects?.find((obj) => obj.id === toObjectId)}
            relationshipType={relationshipType}
            fromLabel={fromLabel}
            toLabel={toLabel}
          />
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error?.message || 'Failed to create relationship. Please try again.'}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || objectsLoading}
          loading={isPending}
        >
          {isPending ? 'Creating...' : 'Create Relationship'}
        </Button>
      </div>
    </form>
  );
};

// Helper function to pluralize object names
function pluralize(word: string): string {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}
```

#### ObjectSelector.tsx
```typescript
import { forwardRef } from 'react';
import { ObjectDefinition } from '../types/relationship.types';

interface ObjectSelectorProps {
  label: string;
  objects: ObjectDefinition[];
  isLoading: boolean;
  error?: string;
}

export const ObjectSelector = forwardRef<HTMLSelectElement, ObjectSelectorProps>(
  ({ label, objects, isLoading, error, ...rest }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded-lg
            ${error ? 'border-red-300' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
          disabled={isLoading}
          {...rest}
        >
          <option value="">
            {isLoading ? 'Loading objects...' : 'Select Object'}
          </option>
          {objects.map((obj) => (
            <option key={obj.id} value={obj.id}>
              {obj.name}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

ObjectSelector.displayName = 'ObjectSelector';
```

#### RelationshipTypeSelector.tsx
```typescript
import { forwardRef } from 'react';
import { ArrowRight, ArrowRightLeft } from 'lucide-react';

interface RelationshipTypeSelectorProps {
  error?: string;
}

export const RelationshipTypeSelector = forwardRef<HTMLInputElement, RelationshipTypeSelectorProps>(
  ({ error, ...rest }, ref) => {
    return (
      <div className="space-y-3">
        {/* 1:N Option */}
        <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            value="1:N"
            className="mt-1"
            {...rest}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">1:N (One-to-Many)</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              One record in the source object can relate to many records in the target object.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Example: One Contact → Many Opportunities
            </p>
          </div>
        </label>

        {/* N:N Option */}
        <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            value="N:N"
            className="mt-1"
            {...rest}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">N:N (Many-to-Many)</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Records in both objects can relate to multiple records in the other object.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Example: Many Products ↔ Many Categories
            </p>
          </div>
        </label>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

RelationshipTypeSelector.displayName = 'RelationshipTypeSelector';
```

#### RelationshipLabels.tsx
```typescript
import { UseFormRegisterReturn } from 'react-hook-form';
import { Info } from 'lucide-react';

interface RelationshipLabelsProps {
  fromObjectName?: string;
  toObjectName?: string;
  relationshipType: '1:N' | 'N:N';
  fromLabelRegister: UseFormRegisterReturn;
  toLabelRegister: UseFormRegisterReturn;
}

export const RelationshipLabels = ({
  fromObjectName,
  toObjectName,
  relationshipType,
  fromLabelRegister,
  toLabelRegister,
}: RelationshipLabelsProps) => {
  return (
    <div className="space-y-4">
      {/* From Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          From Label (shown on {fromObjectName})
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={toObjectName ? `e.g., ${pluralize(toObjectName)}` : 'e.g., Opportunities'}
          {...fromLabelRegister}
        />
        <div className="flex items-start gap-2 mt-1">
          <Info className="w-4 h-4 text-gray-400 mt-0.5" />
          <p className="text-xs text-gray-500">
            This label will appear on {fromObjectName} records to show related {toObjectName} records.
          </p>
        </div>
      </div>

      {/* To Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          To Label (shown on {toObjectName})
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={
            fromObjectName
              ? relationshipType === '1:N'
                ? `e.g., ${fromObjectName}`
                : `e.g., ${pluralize(fromObjectName)}`
              : 'e.g., Contact'
          }
          {...toLabelRegister}
        />
        <div className="flex items-start gap-2 mt-1">
          <Info className="w-4 h-4 text-gray-400 mt-0.5" />
          <p className="text-xs text-gray-500">
            This label will appear on {toObjectName} records to show related {fromObjectName} records.
          </p>
        </div>
      </div>
    </div>
  );
};

function pluralize(word: string): string {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}
```

#### RelationshipDiagram.tsx
```typescript
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { ObjectDefinition } from '../types/relationship.types';

interface RelationshipDiagramProps {
  fromObject?: ObjectDefinition;
  toObject?: ObjectDefinition;
  relationshipType: '1:N' | 'N:N';
  fromLabel?: string;
  toLabel?: string;
}

export const RelationshipDiagram = ({
  fromObject,
  toObject,
  relationshipType,
  fromLabel,
  toLabel,
}: RelationshipDiagramProps) => {
  if (!fromObject || !toObject) return null;

  const relationshipName = `${fromObject.name.toLowerCase()}_${toObject.name.toLowerCase()}`.replace(/\s+/g, '_');

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
      {/* Diagram */}
      <div className="flex items-center justify-center gap-8 mb-6">
        {/* From Object */}
        <div className="bg-white rounded-lg shadow-md p-4 w-40 text-center border-2 border-blue-300">
          <div className="font-semibold text-gray-900">{fromObject.name}</div>
          <div className="text-xs text-gray-500 mt-1">Source</div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center">
          {relationshipType === '1:N' ? (
            <>
              <ArrowRight className="w-8 h-8 text-blue-600" />
              <div className="text-xs text-gray-600 mt-1">{fromLabel || 'Label'}</div>
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-8 h-8 text-purple-600" />
              <div className="text-xs text-gray-600 mt-1">{fromLabel || 'Label'}</div>
            </>
          )}
        </div>

        {/* To Object */}
        <div className="bg-white rounded-lg shadow-md p-4 w-40 text-center border-2 border-indigo-300">
          <div className="font-semibold text-gray-900">{toObject.name}</div>
          <div className="text-xs text-gray-500 mt-1">Target</div>
        </div>
      </div>

      {/* Bidirectional Arrow (return) */}
      {relationshipType === '1:N' && (
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="w-40" />
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-600 mb-1">{toLabel || 'Label'}</div>
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="border-t-2 border-gray-400 w-full"></div>
              <div className="absolute left-0 w-0 h-0 border-t-4 border-r-4 border-transparent border-r-gray-400"></div>
            </div>
          </div>
          <div className="w-40" />
        </div>
      )}

      {/* Relationship Info */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Relationship Name:</span>
            <div className="font-mono font-medium text-gray-900 mt-1">{relationshipName}</div>
          </div>
          <div>
            <span className="text-gray-600">Type:</span>
            <div className="font-medium text-gray-900 mt-1">
              {relationshipType === '1:N' ? 'One-to-Many (1:N)' : 'Many-to-Many (N:N)'}
            </div>
          </div>
        </div>

        {/* Bidirectional Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900 text-sm">Bidirectional Relationship</div>
              <p className="text-xs text-blue-700 mt-1">
                Bu ilişki çift yönlüdür. Her iki object'te de ilişkili kayıtlar görünecektir:
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                <li><strong>{fromObject.name}</strong> kayıtları <strong>"{fromLabel}"</strong> bölümünde ilişkili {toObject.name} kayıtlarını görecek</li>
                <li><strong>{toObject.name}</strong> kayıtları <strong>"{toLabel}"</strong> bölümünde ilişkili {fromObject.name} kayıtlarını görecek</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### useCreateRelationship.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createRelationshipAPI } from '@/lib/api/relationships.api';
import { CreateRelationshipRequest } from '../types/relationship.types';

export const useCreateRelationship = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRelationshipRequest) => {
      const response = await createRelationshipAPI(data);
      return response;
    },
    onSuccess: () => {
      // Invalidate relationships list
      queryClient.invalidateQueries({ queryKey: ['relationships'] });

      // Show success toast (optional)
      // toast.success('Relationship created successfully!');

      // Redirect to relationships list
      navigate('/relationships');
    },
    onError: (error: any) => {
      console.error('Failed to create relationship:', error);
      // toast.error('Failed to create relationship');
    },
  });
};
```

#### useObjects.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getObjectsAPI } from '@/lib/api/objects.api';

export const useObjects = () => {
  return useQuery({
    queryKey: ['objects'],
    queryFn: async () => {
      const response = await getObjectsAPI();
      return response;
    },
  });
};
```

#### relationships.api.ts
```typescript
import axios from 'axios';
import { getAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface CreateRelationshipRequest {
  name: string;
  from_object_id: string;
  to_object_id: string;
  type: '1:N' | 'N:N';
  from_label?: string;
  to_label?: string;
}

export interface RelationshipResponse {
  id: string;
  name: string;
  from_object_id: string;
  to_object_id: string;
  type: '1:N' | 'N:N';
  from_label: string | null;
  to_label: string | null;
  created_by: string;
  created_at: string;
}

export const createRelationshipAPI = async (
  data: CreateRelationshipRequest
): Promise<RelationshipResponse> => {
  const token = getAuthToken();

  const { data: response } = await axios.post<RelationshipResponse>(
    `${API_BASE_URL}/api/relationships`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response;
};

export const getRelationshipsAPI = async (): Promise<RelationshipResponse[]> => {
  const token = getAuthToken();

  const { data } = await axios.get<RelationshipResponse[]>(
    `${API_BASE_URL}/api/relationships`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};
```

#### relationship.types.ts
```typescript
export interface ObjectDefinition {
  id: string;
  name: string;
  api_name: string;
  description?: string;
}

export interface CreateRelationshipRequest {
  name: string;
  from_object_id: string;
  to_object_id: string;
  type: '1:N' | 'N:N';
  from_label?: string;
  to_label?: string;
}

export interface RelationshipResponse {
  id: string;
  name: string;
  from_object_id: string;
  to_object_id: string;
  type: '1:N' | 'N:N';
  from_label: string | null;
  to_label: string | null;
  created_by: string;
  created_at: string;
}

export type RelationshipType = '1:N' | 'N:N';
```

#### relationship-utils.ts
```typescript
/**
 * Pluralize a word (simple English rules)
 */
export function pluralize(word: string): string {
  if (!word) return word;

  const lowerWord = word.toLowerCase();

  // Irregular plurals
  const irregularPlurals: Record<string, string> = {
    person: 'people',
    child: 'children',
    man: 'men',
    woman: 'women',
    tooth: 'teeth',
    foot: 'feet',
    mouse: 'mice',
    goose: 'geese',
  };

  if (irregularPlurals[lowerWord]) {
    return irregularPlurals[lowerWord];
  }

  // Words ending in 'y' preceded by a consonant
  if (word.endsWith('y') && !'aeiou'.includes(word[word.length - 2])) {
    return word.slice(0, -1) + 'ies';
  }

  // Words ending in 's', 'x', 'z', 'ch', 'sh'
  if (
    word.endsWith('s') ||
    word.endsWith('x') ||
    word.endsWith('z') ||
    word.endsWith('ch') ||
    word.endsWith('sh')
  ) {
    return word + 'es';
  }

  // Words ending in 'f' or 'fe'
  if (word.endsWith('f')) {
    return word.slice(0, -1) + 'ves';
  }
  if (word.endsWith('fe')) {
    return word.slice(0, -2) + 'ves';
  }

  // Default: add 's'
  return word + 's';
}

/**
 * Generate relationship name from two object names
 */
export function generateRelationshipName(fromObjectName: string, toObjectName: string): string {
  return `${fromObjectName.toLowerCase()}_${toObjectName.toLowerCase()}`.replace(/\s+/g, '_');
}

/**
 * Get relationship type description
 */
export function getRelationshipTypeDescription(type: '1:N' | 'N:N'): string {
  return type === '1:N'
    ? 'One-to-Many: One record relates to many records'
    : 'Many-to-Many: Many records relate to many records';
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@tanstack/react-query` - API state management
- `axios` - HTTP client
- `react-router-dom` - Navigation
- `lucide-react` - Icons

### UI Components (To Be Built)
- `Button` component (React Aria)
- `Select` component (for object dropdowns)
- `RadioGroup` component (for relationship type)

---

## Acceptance Criteria

- [ ] Relationship creation form `/relationships/create` route'unda çalışıyor
- [ ] Object dropdown'ları GET /api/objects endpoint'inden veri çekiyor
- [ ] From object ve to object aynı olamaz (validation)
- [ ] Relationship type seçimi çalışıyor (1:N ve N:N)
- [ ] Label'lar otomatik generate ediliyor (manuel override edilebilir)
- [ ] Visual diagram çalışıyor (bidirectional nature gösteriliyor)
- [ ] Relationship name otomatik generate ediliyor (from_object_to_object formatında)
- [ ] Form validation çalışıyor (Zod)
- [ ] Başarılı relationship creation sonrası `/relationships` sayfasına redirect
- [ ] Hata durumunda error mesajı gösteriliyor
- [ ] Loading state çalışıyor (button disabled + spinner)
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Boş form submit → validation errors
- [ ] Aynı object seçimi → error
- [ ] Doğru data ile submit → success + redirect
- [ ] Network error → error mesajı
- [ ] Loading state görünüyor
- [ ] Auto-generated labels doğru
- [ ] Visual diagram doğru gösteriliyor
- [ ] Bidirectional nature açıkça gösteriliyor

### Test Data Examples

#### Example 1: Contact → Opportunity (1:N)
```json
{
  "name": "contact_opportunities",
  "from_object_id": "obj_contact",
  "to_object_id": "obj_opportunity",
  "type": "1:N",
  "from_label": "Opportunities",
  "to_label": "Contact"
}
```
**Explanation:**
- Bir Contact birden fazla Opportunity'ye sahip olabilir
- Contact kayıtlarında "Opportunities" bölümü görünür (çoğul)
- Opportunity kayıtlarında "Contact" bölümü görünür (tekil)

#### Example 2: Product ↔ Category (N:N)
```json
{
  "name": "product_categories",
  "from_object_id": "obj_product",
  "to_object_id": "obj_category",
  "type": "N:N",
  "from_label": "Categories",
  "to_label": "Products"
}
```
**Explanation:**
- Bir Product birden fazla Category'ye ait olabilir
- Bir Category birden fazla Product içerebilir
- Her iki tarafta da çoğul label (bidirectional many-to-many)

#### Example 3: Account → Contact (1:N)
```json
{
  "name": "account_contacts",
  "from_object_id": "obj_account",
  "to_object_id": "obj_contact",
  "type": "1:N",
  "from_label": "Contacts",
  "to_label": "Account"
}
```

---

## Code Examples

### Complete Relationship Creation Flow
```typescript
// 1. User selects from_object (Contact) and to_object (Opportunity)
// 2. User selects relationship type (1:N)
// 3. Auto-generate labels: from_label="Opportunities", to_label="Contact"
// 4. Auto-generate name: "contact_opportunities"
// 5. Visual diagram shows bidirectional relationship
// 6. Submit form → useCreateRelationship mutation
// 7. API call with JSON body
// 8. Receive relationship response
// 9. Redirect to /relationships list
```

### Error Handling
```typescript
// API Client (relationships.api.ts)
export const createRelationshipAPI = async (data: CreateRelationshipRequest) => {
  try {
    const token = getAuthToken();

    const { data: response } = await axios.post(
      `${API_BASE_URL}/api/relationships`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error: any) {
    if (error.response?.status === 422) {
      const validationError = error.response.data.detail[0];
      throw new Error(validationError.msg || 'Validation error');
    }
    if (error.response?.status === 401) {
      throw new Error('Not authenticated');
    }
    throw new Error('Failed to create relationship. Please try again.');
  }
};
```

---

## Resources

### Backend Documentation
- [POST /api/relationships](../../backend-docs/api/06-relationships/01-create-relationship.md) - Detailed endpoint documentation
- [Relationships Overview](../../backend-docs/api/06-relationships/README.md) - Relationship system overview
- [Frontend Developer Guide](../../backend-docs/api/00-FRONTEND-GUIDE.md) - Complete frontend guide

### Frontend Libraries
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Lucide React Icons](https://lucide.dev/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Relationship Definition task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/07-relationships/01-relationship-definition.md

Requirements:
1. Create src/features/relationships/pages/CreateRelationshipPage.tsx - Main create relationship page
2. Create src/features/relationships/components/CreateRelationshipForm.tsx - Main form component with steps
3. Create src/features/relationships/components/ObjectSelector.tsx - Object dropdown selector
4. Create src/features/relationships/components/RelationshipTypeSelector.tsx - Radio buttons for 1:N and N:N
5. Create src/features/relationships/components/RelationshipLabels.tsx - Label inputs with auto-generation
6. Create src/features/relationships/components/RelationshipDiagram.tsx - Visual preview with bidirectional arrows
7. Create src/features/relationships/hooks/useCreateRelationship.ts - TanStack Query mutation for creating relationship
8. Create src/features/relationships/hooks/useObjects.ts - TanStack Query hook to fetch objects
9. Create src/lib/api/relationships.api.ts - API functions (createRelationshipAPI, getRelationshipsAPI)
10. Create src/features/relationships/types/relationship.types.ts - TypeScript type definitions
11. Create src/utils/relationship-utils.ts - Helper functions (pluralize, generateRelationshipName)

CRITICAL REQUIREMENTS:
- Emphasize BIDIRECTIONAL nature of relationships (shown in visual diagram)
- Auto-generate relationship name: {from_object}_{to_object} (lowercase, underscore-separated)
- Auto-generate labels: from_label (plural of to_object), to_label (singular for 1:N, plural for N:N)
- Validate: from_object and to_object cannot be the same
- Support two relationship types: 1:N (One-to-Many) and N:N (Many-to-Many)
- Visual diagram shows arrows and labels for both directions
- Use React Hook Form + Zod validation
- API uses JSON format (not form-data)
- JWT token required in Authorization header
- Redirect to /relationships after successful creation
- Mobile responsive design with Tailwind CSS 4

Follow the exact code examples and file structure provided in the task file. Test with:
- Contact → Opportunity (1:N)
- Product ↔ Category (N:N)
```

---

**Status:** 🟡 Pending
**Next Task:** 02-relationship-list.md
