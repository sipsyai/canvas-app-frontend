# Task: Objects List Page (Card View)

**Priority:** 🟡 Medium
**Estimated Time:** 1.5 gün
**Dependencies:** 02-api-integration, 09-ui-components

---

## Objective

Kullanıcının oluşturduğu tüm object'leri card-based layout ile listeleyip, arama, filtreleme ve CRUD işlemleri yapabilmesi için Objects List sayfası oluşturmak. Airtable/Notion tarzında modern card görünümü.

---

## Backend API

### Endpoint
```
GET /api/objects
```

### Request Format
Query parametreleri yok. JWT token ile authenticate edilmiş kullanıcının tüm object'lerini döner.

**Headers:**
```typescript
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

### Response
```json
[
  {
    "id": "obj_contact",
    "name": "contact",
    "label": "Contact",
    "plural_name": "Contacts",
    "description": "Customer contacts and leads",
    "icon": "👤",
    "color": "#3B82F6",
    "is_custom": true,
    "is_global": false,
    "views": {},
    "permissions": {},
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-01-18T10:00:00Z",
    "updated_at": "2026-01-18T10:00:00Z",
    "record_count": 245
  },
  {
    "id": "obj_company",
    "name": "company",
    "label": "Company",
    "plural_name": "Companies",
    "description": "Business organizations",
    "icon": "🏢",
    "color": "#10B981",
    "is_custom": true,
    "is_global": false,
    "views": {},
    "permissions": {},
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-01-18T11:30:00Z",
    "updated_at": "2026-01-18T11:30:00Z",
    "record_count": 87
  }
]
```

**Response Fields:**
- `id` - Object unique identifier (string)
- `name` - Internal name (lowercase, no spaces)
- `label` - Display name (singular)
- `plural_name` - Display name (plural)
- `description` - Object description (optional)
- `icon` - Emoji or icon identifier
- `color` - Brand color (hex code)
- `is_custom` - Custom object mi?
- `is_global` - Global object mi?
- `record_count` - Toplam kayıt sayısı (frontend için eklenmeli, backend'de hesaplanmalı)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Backend Documentation:**
→ [GET /api/objects](../../backend-docs/api/03-objects/02-list-objects.md)

---

## UI/UX Design

### Page Layout (Desktop - 3 Column Grid)
```
┌─────────────────────────────────────────────────────────────────┐
│  Objects                                       [+ Create Object] │
│                                                                   │
│  [🔍 Search objects...]        [Filter: All ▼]  [Sort: Name ▼]  │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 👤 Contact  │  │ 🏢 Company  │  │ 📝 Project  │             │
│  │ Contacts    │  │ Companies   │  │ Projects    │             │
│  │             │  │             │  │             │             │
│  │ Customer    │  │ Business    │  │ Track work  │             │
│  │ contacts    │  │ orgs        │  │ items       │             │
│  │             │  │             │  │             │             │
│  │ 245 records │  │ 87 records  │  │ 142 records │             │
│  │             │  │             │  │             │             │
│  │ [Edit] [⋮]  │  │ [Edit] [⋮]  │  │ [Edit] [⋮]  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 🎯 Task     │  │ 📅 Event    │  │ 💰 Deal     │             │
│  │ Tasks       │  │ Events      │  │ Deals       │             │
│  │             │  │             │  │             │             │
│  │ Action      │  │ Calendar    │  │ Sales       │             │
│  │ items       │  │ events      │  │ pipeline    │             │
│  │             │  │             │  │             │             │
│  │ 523 records │  │ 34 records  │  │ 156 records │             │
│  │             │  │             │  │             │             │
│  │ [Edit] [⋮]  │  │ [Edit] [⋮]  │  │ [Edit] [⋮]  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  ← Previous   1 2 3 ... 8   Next →                              │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (1 Column)
```
┌───────────────────────┐
│ Objects    [+ Create] │
│                       │
│ [🔍 Search...]        │
│                       │
│ ┌───────────────────┐ │
│ │ 👤 Contact        │ │
│ │ Contacts          │ │
│ │                   │ │
│ │ Customer contacts │ │
│ │ 245 records       │ │
│ │                   │ │
│ │ [Edit] [⋮]        │ │
│ └───────────────────┘ │
│                       │
│ ┌───────────────────┐ │
│ │ 🏢 Company        │ │
│ │ Companies         │ │
│ │                   │ │
│ │ Business orgs     │ │
│ │ 87 records        │ │
│ │                   │ │
│ │ [Edit] [⋮]        │ │
│ └───────────────────┘ │
│                       │
└───────────────────────┘
```

### Object Card Design
```
┌─────────────────────────────┐
│ 👤                          │
│                             │
│ Contact                     │ ← label (büyük, bold)
│ Contacts                    │ ← plural_name (küçük, muted)
│                             │
│ Customer contacts and       │ ← description (2 satır max)
│ leads database              │
│                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                             │
│ 245 records                 │ ← record count
│                             │
│ [Edit]  [⋮ More]            │ ← Actions
└─────────────────────────────┘
  └─ Accent color (#3B82F6)
```

### Card States
- **Default** - Beyaz bg, subtle border, hover'da shadow
- **Hover** - Elevated shadow, border color changes to accent
- **Loading** - Skeleton card with pulse animation
- **Empty** - Illustration + "No objects yet" message

### Search & Filter Section
1. **Search Input**
   - Placeholder: "Search objects by name or label..."
   - Real-time search (debounced 300ms)
   - Clear button (X)

2. **Category Filter Dropdown**
   - Options: All, Custom, System, Global
   - Default: All

3. **Sort Dropdown**
   - Options: Name (A-Z), Name (Z-A), Newest, Oldest, Most Records
   - Default: Name (A-Z)

4. **Create Object Button**
   - Primary blue button
   - Opens create modal/page

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── objects/
│       ├── pages/
│       │   └── ObjectsListPage.tsx        ⭐ Main page
│       ├── components/
│       │   ├── ObjectCard.tsx             ⭐ Object card
│       │   ├── ObjectCardSkeleton.tsx     ⭐ Loading skeleton
│       │   ├── ObjectsEmptyState.tsx      ⭐ Empty state
│       │   ├── ObjectSearchBar.tsx        ⭐ Search + filters
│       │   └── ObjectCardActions.tsx      ⭐ Dropdown menu
│       ├── hooks/
│       │   ├── useObjectsList.ts          ⭐ Query hook
│       │   ├── useObjectSearch.ts         ⭐ Search logic
│       │   └── useDeleteObject.ts         ⭐ Delete mutation
│       └── types/
│           └── object.types.ts            ⭐ TypeScript types
├── lib/
│   └── api/
│       └── objects.api.ts                 ⭐ API calls
└── components/
    └── ui/
        └── Card.tsx                       ⭐ Base card component
```

### Component Implementation

#### ObjectsListPage.tsx
```typescript
import { useState } from 'react';
import { useObjectsList } from '../hooks/useObjectsList';
import { useObjectSearch } from '../hooks/useObjectSearch';
import { ObjectCard } from '../components/ObjectCard';
import { ObjectCardSkeleton } from '../components/ObjectCardSkeleton';
import { ObjectsEmptyState } from '../components/ObjectsEmptyState';
import { ObjectSearchBar } from '../components/ObjectSearchBar';
import { Button } from '@/components/ui/Button';
import { PlusIcon } from 'lucide-react';

export const ObjectsListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'custom' | 'system' | 'global'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'records'>('name-asc');

  const { data: objects, isLoading, isError, error } = useObjectsList();
  const filteredObjects = useObjectSearch(objects || [], searchTerm, categoryFilter, sortBy);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Objects</h1>
            <Button disabled>
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Object
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ObjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="font-semibold mb-2">Failed to load objects</h3>
            <p>{error?.message || 'Something went wrong. Please try again.'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!objects || objects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Objects</h1>
            <Button onClick={() => window.location.href = '/objects/create'}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Object
            </Button>
          </div>

          <ObjectsEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Objects</h1>
            <p className="text-gray-600 mt-1">{objects.length} objects created</p>
          </div>
          <Button onClick={() => window.location.href = '/objects/create'}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Object
          </Button>
        </div>

        {/* Search & Filters */}
        <ObjectSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Objects Grid */}
        {filteredObjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No objects found matching your search.</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredObjects.map((object) => (
              <ObjectCard key={object.id} object={object} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### ObjectCard.tsx
```typescript
import { ObjectResponse } from '../types/object.types';
import { Card } from '@/components/ui/Card';
import { ObjectCardActions } from './ObjectCardActions';
import { MoreVertical, Edit, Eye } from 'lucide-react';

interface ObjectCardProps {
  object: ObjectResponse;
}

export const ObjectCard = ({ object }: ObjectCardProps) => {
  const handleViewRecords = () => {
    window.location.href = `/objects/${object.id}/records`;
  };

  const handleEdit = () => {
    window.location.href = `/objects/${object.id}/edit`;
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-blue-200"
      style={{
        borderTopColor: object.color || '#3B82F6',
        borderTopWidth: '4px'
      }}
      onClick={handleViewRecords}
    >
      <div className="p-6">
        {/* Icon */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${object.color || '#3B82F6'}15` }}
          >
            {object.icon || '📦'}
          </div>

          <ObjectCardActions object={object} />
        </div>

        {/* Title */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {object.label}
          </h3>
          <p className="text-sm text-gray-500">
            {object.plural_name}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {object.description || 'No description'}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <span className="text-2xl font-bold text-gray-900">
              {object.record_count || 0}
            </span>
            <span className="text-sm ml-2">records</span>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit object"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewRecords();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="View records"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-4">
          {object.is_custom && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
              Custom
            </span>
          )}
          {object.is_global && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium">
              Global
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
```

#### ObjectCardSkeleton.tsx
```typescript
export const ObjectCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      {/* Icon */}
      <div className="w-14 h-14 bg-gray-200 rounded-xl mb-4"></div>

      {/* Title */}
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>

      {/* Description */}
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};
```

#### ObjectsEmptyState.tsx
```typescript
import { Button } from '@/components/ui/Button';
import { PlusIcon, PackageIcon } from 'lucide-react';

export const ObjectsEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Illustration */}
      <div className="w-64 h-64 mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <PackageIcon className="w-32 h-32 text-blue-400" />
        </div>
      </div>

      {/* Text */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        No objects yet
      </h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Get started by creating your first object. Objects are like tables in a database -
        they help you organize and manage your data.
      </p>

      {/* CTA */}
      <Button size="lg" onClick={() => window.location.href = '/objects/create'}>
        <PlusIcon className="w-5 h-5 mr-2" />
        Create Your First Object
      </Button>

      {/* Examples */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">👤</div>
          <h3 className="font-semibold text-gray-900 mb-1">Contacts</h3>
          <p className="text-sm text-gray-600">Manage customer contacts</p>
        </div>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🏢</div>
          <h3 className="font-semibold text-gray-900 mb-1">Companies</h3>
          <p className="text-sm text-gray-600">Track business organizations</p>
        </div>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📝</div>
          <h3 className="font-semibold text-gray-900 mb-1">Projects</h3>
          <p className="text-sm text-gray-600">Organize your projects</p>
        </div>
      </div>
    </div>
  );
};
```

#### ObjectSearchBar.tsx
```typescript
import { Search, Filter, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface ObjectSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: 'all' | 'custom' | 'system' | 'global';
  onCategoryChange: (value: 'all' | 'custom' | 'system' | 'global') => void;
  sortBy: 'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'records';
  onSortChange: (value: 'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'records') => void;
}

export const ObjectSearchBar = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
}: ObjectSearchBarProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search objects by name or label..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <Select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as any)}
          >
            <option value="all">All Objects</option>
            <option value="custom">Custom Only</option>
            <option value="system">System Only</option>
            <option value="global">Global Only</option>
          </Select>
        </div>

        {/* Sort */}
        <div className="w-full md:w-48">
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="records">Most Records</option>
          </Select>
        </div>
      </div>
    </div>
  );
};
```

#### ObjectCardActions.tsx
```typescript
import { useState } from 'react';
import { ObjectResponse } from '../types/object.types';
import { useDeleteObject } from '../hooks/useDeleteObject';
import { MoreVertical, Edit, Trash2, Eye, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';

interface ObjectCardActionsProps {
  object: ObjectResponse;
}

export const ObjectCardActions = ({ object }: ObjectCardActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteObject, isPending } = useDeleteObject();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${object.label}"?`)) {
      deleteObject(object.id);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => window.location.href = `/objects/${object.id}/records`}>
          <Eye className="w-4 h-4 mr-2" />
          View Records
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => window.location.href = `/objects/${object.id}/edit`}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Object
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => window.location.href = `/objects/${object.id}/duplicate`}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isPending ? 'Deleting...' : 'Delete'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

#### useObjectsList.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getObjectsAPI } from '@/lib/api/objects.api';
import { ObjectResponse } from '../types/object.types';

export const useObjectsList = () => {
  return useQuery<ObjectResponse[], Error>({
    queryKey: ['objects', 'list'],
    queryFn: getObjectsAPI,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
```

#### useObjectSearch.ts
```typescript
import { useMemo } from 'react';
import { ObjectResponse } from '../types/object.types';

export const useObjectSearch = (
  objects: ObjectResponse[],
  searchTerm: string,
  categoryFilter: 'all' | 'custom' | 'system' | 'global',
  sortBy: 'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'records'
) => {
  return useMemo(() => {
    let filtered = [...objects];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (obj) =>
          obj.name.toLowerCase().includes(term) ||
          obj.label.toLowerCase().includes(term) ||
          obj.plural_name.toLowerCase().includes(term) ||
          obj.description?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((obj) => {
        if (categoryFilter === 'custom') return obj.is_custom;
        if (categoryFilter === 'global') return obj.is_global;
        if (categoryFilter === 'system') return !obj.is_custom;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.label.localeCompare(b.label);
        case 'name-desc':
          return b.label.localeCompare(a.label);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'records':
          return (b.record_count || 0) - (a.record_count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [objects, searchTerm, categoryFilter, sortBy]);
};
```

#### useDeleteObject.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteObjectAPI } from '@/lib/api/objects.api';
import { toast } from 'sonner';

export const useDeleteObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (objectId: string) => deleteObjectAPI(objectId),
    onSuccess: () => {
      // Invalidate objects list query
      queryClient.invalidateQueries({ queryKey: ['objects', 'list'] });
      toast.success('Object deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete failed:', error);
      toast.error(error?.message || 'Failed to delete object');
    },
  });
};
```

#### objects.api.ts
```typescript
import { apiClient } from './client';
import { ObjectResponse } from '@/features/objects/types/object.types';

/**
 * Get all objects for current user
 */
export const getObjectsAPI = async (): Promise<ObjectResponse[]> => {
  const { data } = await apiClient.get<ObjectResponse[]>('/api/objects');
  return data;
};

/**
 * Delete an object by ID
 */
export const deleteObjectAPI = async (objectId: string): Promise<void> => {
  await apiClient.delete(`/api/objects/${objectId}`);
};
```

#### object.types.ts
```typescript
export interface ObjectResponse {
  id: string;
  name: string;
  label: string;
  plural_name: string;
  description: string | null;
  icon: string | null;
  color?: string; // Hex color code (frontend extra)
  is_custom: boolean;
  is_global: boolean;
  views: Record<string, any>;
  permissions: Record<string, any>;
  created_by: string; // UUID as string
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  record_count?: number; // Total records (should be calculated by backend)
}

export type CategoryFilter = 'all' | 'custom' | 'system' | 'global';

export type SortOption = 'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'records';
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - API state management
- `axios` - HTTP client
- `lucide-react` - Icons
- `sonner` - Toast notifications

### UI Components (To Be Built)
- `Card` component (base card)
- `Button` component
- `Input` component
- `Select` component
- `DropdownMenu` component (Radix UI)

---

## Acceptance Criteria

- [ ] Objects list page `/objects` route'unda çalışıyor
- [ ] Objects API'den başarıyla fetch ediliyor (JWT auth)
- [ ] Card-based grid layout (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] Her card'da: icon, color, label, plural_name, description, record count gösteriliyor
- [ ] Search bar çalışıyor (name, label, description'da arama)
- [ ] Category filter çalışıyor (All, Custom, System, Global)
- [ ] Sort çalışıyor (Name A-Z, Z-A, Newest, Oldest, Most Records)
- [ ] "Create Object" button çalışıyor
- [ ] Card hover state ve animations çalışıyor
- [ ] Card actions (Edit, Delete, View Records) çalışıyor
- [ ] Delete confirmation dialog çalışıyor
- [ ] Loading state (card skeletons) gösteriliyor
- [ ] Empty state (illustration + message) gösteriliyor
- [ ] Error state gösteriliyor
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Toast notifications (success/error) çalışıyor

---

## Testing Checklist

### Manual Testing
- [ ] Page load → API call yapılıyor
- [ ] Loading state → skeletons gösteriliyor
- [ ] Objects loaded → cards doğru render ediliyor
- [ ] Search → filtering çalışıyor (debounced)
- [ ] Category filter → filtreleme doğru
- [ ] Sort → sıralama doğru
- [ ] Card click → records page'e gidiyor
- [ ] Edit button → edit page'e gidiyor
- [ ] Delete button → confirmation + deletion
- [ ] Empty state → illustration + CTA button
- [ ] Error state → error message
- [ ] Responsive → mobile/tablet/desktop görünümler
- [ ] Performance → 50+ objects ile test
- [ ] Network error → error handling

### Test Data (Backend'de olmalı)
```json
[
  {
    "id": "obj_contact",
    "name": "contact",
    "label": "Contact",
    "plural_name": "Contacts",
    "description": "Customer contacts and leads",
    "icon": "👤",
    "color": "#3B82F6",
    "record_count": 245
  },
  {
    "id": "obj_company",
    "name": "company",
    "label": "Company",
    "plural_name": "Companies",
    "description": "Business organizations",
    "icon": "🏢",
    "color": "#10B981",
    "record_count": 87
  }
]
```

---

## Code Examples

### Complete Flow
```typescript
// 1. User navigates to /objects
// 2. ObjectsListPage mounts
// 3. useObjectsList hook triggers API call
// 4. Loading state → show skeletons
// 5. Data loaded → render cards
// 6. User searches/filters → useObjectSearch filters
// 7. User clicks card → navigate to records
// 8. User clicks delete → confirmation → useDeleteObject
// 9. Delete success → invalidate query → refresh list
```

### API Client Setup (client.ts)
```typescript
import axios from 'axios';
import { getAuthToken } from '@/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Resources

### Backend Documentation
- [GET /api/objects](../../backend-docs/api/03-objects/02-list-objects.md) - List objects endpoint
- [DELETE /api/objects/{id}](../../backend-docs/api/03-objects/04-delete-object.md) - Delete object endpoint
- [Objects Overview](../../backend-docs/api/03-objects/README.md) - Objects API overview

### Design Inspiration
- [Airtable Workspace](https://airtable.com) - Card-based database list
- [Notion Databases](https://notion.so) - Database gallery view
- [Linear Projects](https://linear.app) - Modern card layout

### Frontend Libraries
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Lucide React Icons](https://lucide.dev)
- [Radix UI DropdownMenu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Objects List Page task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/04-objects-management/01-object-list-page.md

Requirements:
1. Create src/features/objects/pages/ObjectsListPage.tsx - Main page with header, search, filters, and card grid
2. Create src/features/objects/components/ObjectCard.tsx - Card component showing icon, color, label, description, record count
3. Create src/features/objects/components/ObjectCardSkeleton.tsx - Loading skeleton for cards
4. Create src/features/objects/components/ObjectsEmptyState.tsx - Empty state with illustration and CTA
5. Create src/features/objects/components/ObjectSearchBar.tsx - Search input + category filter + sort dropdown
6. Create src/features/objects/components/ObjectCardActions.tsx - Dropdown menu (Edit, Delete, View Records)
7. Create src/features/objects/hooks/useObjectsList.ts - TanStack Query hook for fetching objects
8. Create src/features/objects/hooks/useObjectSearch.ts - Client-side search/filter/sort logic
9. Create src/features/objects/hooks/useDeleteObject.ts - TanStack Query mutation for deletion
10. Update src/lib/api/objects.api.ts - Add getObjectsAPI and deleteObjectAPI functions
11. Create src/features/objects/types/object.types.ts - TypeScript type definitions

CRITICAL REQUIREMENTS:
- Card-based layout (NOT table view!)
- Responsive grid: 1 col (mobile), 2 col (tablet), 3 col (desktop)
- Each card shows: icon (emoji), color accent, label, plural_name, description (2 lines max), record count
- Search by name/label/description (debounced 300ms)
- Filter by category (All, Custom, System, Global)
- Sort by: Name A-Z, Name Z-A, Newest, Oldest, Most Records
- Card hover: elevated shadow, border color change, show actions
- Card actions: Edit, View Records, Delete (with confirmation)
- Loading state: 6 skeleton cards
- Empty state: illustration + "Create Your First Object" CTA
- JWT authentication (Authorization: Bearer token)
- Toast notifications for success/error
- Design inspired by Airtable/Notion database gallery view

API Endpoint: GET /api/objects
Backend Docs: backend-docs/api/03-objects/02-list-objects.md

Follow the exact code examples and component structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 02-create-object-page.md
