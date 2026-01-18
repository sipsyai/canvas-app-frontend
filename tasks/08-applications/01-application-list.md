# Task: Uygulama Listesi

**Priority:** 🟡 Medium
**Estimated Time:** 1.5 gün
**Dependencies:** 04-objects-management

---

## Objective

Kullanıcıların oluşturdukları tüm uygulamaları card view formatında görebilmesi, filtreleyebilmesi ve yönetebilmesi için uygulama listesi sayfası oluşturmak.

---

## Backend API

### Endpoint
```
GET /api/applications
```

### Request Format
**Authentication:** JWT Token gerekli

**Query Parameters:**
| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|-----------|-----|---------|------------|----------|
| skip | integer | Hayır | 0 | Sayfalama için atlanacak kayıt sayısı |
| limit | integer | Hayır | 100 | Döndürülecek maksimum kayıt sayısı |

### Response
```json
[
  {
    "id": "app_crm",
    "name": "CRM",
    "label": "CRM Application",
    "description": "Customer Relationship Management System",
    "icon": "👥",
    "config": {},
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-01-18T14:20:00Z",
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "published_at": "2026-01-18T12:00:00Z"
  },
  {
    "id": "app_itsm",
    "name": "ITSM",
    "label": "IT Service Management",
    "description": "IT ticketing and asset management",
    "icon": "🛠️",
    "config": {},
    "created_at": "2026-01-16T09:15:00Z",
    "updated_at": "2026-01-17T16:45:00Z",
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "published_at": null
  },
  {
    "id": "app_pm",
    "name": "ProjectManagement",
    "label": "Project Management",
    "description": "Manage projects, tasks and teams",
    "icon": "📊",
    "config": {},
    "created_at": "2026-01-17T11:00:00Z",
    "updated_at": "2026-01-18T10:30:00Z",
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "published_at": "2026-01-17T15:00:00Z"
  }
]
```

**Response Fields:**
- `id` - Application ID (app_xxxxxxxx)
- `name` - Application name (unique identifier)
- `label` - Application label (display name)
- `description` - Application description
- `icon` - Icon (emoji or icon class)
- `config` - Application configuration (JSONB)
- `created_at` - Oluşturulma zamanı
- `updated_at` - Son güncelleme zamanı
- `created_by` - Oluşturan kullanıcı UUID
- `published_at` - Yayınlanma zamanı (null ise draft)

### Status Determination
```typescript
status = published_at === null ? 'draft' : 'published'
```

**Backend Documentation:**
→ [GET /api/applications](../../backend-docs/api/05-applications/02-list-applications.md)

---

## UI/UX Design

### Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Applications                                    [+ Create]  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Search: [input field]         Filter: [All ▼]      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ 👥         │  │ 🛠️         │  │ 📊         │            │
│  │ CRM        │  │ ITSM       │  │ Project Mgmt│           │
│  │            │  │            │  │             │            │
│  │ Customer   │  │ IT Service │  │ Manage      │            │
│  │ Relation..  │  │ Manage...  │  │ projects... │           │
│  │            │  │            │  │             │            │
│  │ [Published]│  │ [Draft]    │  │ [Published] │            │
│  │ 12 objects │  │ 8 objects  │  │ 15 objects  │            │
│  │            │  │            │  │             │            │
│  │ [Edit] [⋮] │  │ [Edit] [⋮] │  │ [Edit] [⋮]  │           │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Card Design (ApplicationCard.tsx)
```
┌─────────────────────────────┐
│ 👥                          │  ← Icon (emoji)
│ CRM Application             │  ← Label (bold, 18px)
│                             │
│ Customer Relationship       │  ← Description (2 lines max)
│ Management System           │     with ellipsis
│                             │
│ ┌────────────┐              │  ← Status Badge
│ │ Published  │              │     (green if published, gray if draft)
│ └────────────┘              │
│                             │
│ 12 objects                  │  ← Object count
│                             │
│ ┌──────┐ ┌─────────────┐   │  ← Actions
│ │ Edit │ │ ⋮ Actions ▼ │   │
│ └──────┘ └─────────────┘   │
│                             │
│ Updated 2 days ago          │  ← Last updated (relative time)
└─────────────────────────────┘
```

### Filter Options
1. **All Applications** - Tüm uygulamalar
2. **Published** - published_at !== null
3. **Draft** - published_at === null

### Search
- Search by `name` or `label` or `description`
- Real-time filtering (debounced 300ms)
- Case-insensitive

### Card Actions (Dropdown Menu)
- **Edit** - Navigate to /applications/:id/edit
- **Publish** - POST /api/applications/:id/publish (if draft)
- **Unpublish** - POST /api/applications/:id/unpublish (if published)
- **Clone** - POST /api/applications/:id/clone
- **Delete** - DELETE /api/applications/:id (confirmation dialog)

### Status Badges
```typescript
// Draft - Gray badge
<Badge variant="secondary" className="bg-gray-100 text-gray-700">
  Draft
</Badge>

// Published - Green badge
<Badge variant="success" className="bg-green-100 text-green-700">
  Published
</Badge>
```

### Empty State
```
┌─────────────────────────────────────┐
│                                     │
│         📱                          │
│                                     │
│   No Applications Yet               │
│                                     │
│   Create your first application     │
│   to get started                    │
│                                     │
│   [+ Create Application]            │
│                                     │
└─────────────────────────────────────┘
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── applications/
│       ├── pages/
│       │   └── ApplicationsList.tsx       ⭐ Main list page
│       ├── components/
│       │   ├── ApplicationCard.tsx        ⭐ Card component
│       │   ├── ApplicationFilters.tsx     ⭐ Search + Filter
│       │   ├── ApplicationActions.tsx     ⭐ Dropdown menu
│       │   └── EmptyApplications.tsx      ⭐ Empty state
│       ├── hooks/
│       │   ├── useApplications.ts         ⭐ Fetch applications
│       │   ├── useDeleteApplication.ts    ⭐ Delete mutation
│       │   ├── usePublishApplication.ts   ⭐ Publish mutation
│       │   └── useCloneApplication.ts     ⭐ Clone mutation
│       └── types/
│           └── application.types.ts       ⭐ TypeScript types
├── lib/
│   └── api/
│       └── applications.api.ts            ⭐ API calls
└── components/
    └── ui/
        └── Badge.tsx                      ⭐ Status badge component
```

### Component Implementation

#### ApplicationsList.tsx
```typescript
import { useState } from 'react';
import { useApplications } from '../hooks/useApplications';
import { ApplicationCard } from '../components/ApplicationCard';
import { ApplicationFilters } from '../components/ApplicationFilters';
import { EmptyApplications } from '../components/EmptyApplications';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const ApplicationsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const { data: applications, isLoading, error } = useApplications();

  const filteredApplications = applications?.filter((app) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && app.published_at !== null) ||
      (statusFilter === 'draft' && app.published_at === null);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          Error loading applications: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">
            {applications?.length || 0} application{applications?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => navigate('/applications/create')}
          className="flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Create Application
        </Button>
      </div>

      {/* Filters */}
      <ApplicationFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Empty State */}
      {filteredApplications?.length === 0 && searchQuery === '' && statusFilter === 'all' && (
        <EmptyApplications onCreate={() => navigate('/applications/create')} />
      )}

      {/* No Results */}
      {filteredApplications?.length === 0 && (searchQuery !== '' || statusFilter !== 'all') && (
        <div className="text-center py-12">
          <p className="text-gray-600">No applications found matching your filters.</p>
        </div>
      )}

      {/* Applications Grid */}
      {filteredApplications && filteredApplications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
};
```

#### ApplicationCard.tsx
```typescript
import { formatDistanceToNow } from 'date-fns';
import { Application } from '../types/application.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ApplicationActions } from './ApplicationActions';
import { useNavigate } from 'react-router-dom';

interface ApplicationCardProps {
  application: Application;
}

export const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const navigate = useNavigate();

  const status = application.published_at ? 'published' : 'draft';
  const objectCount = 0; // TODO: Get from application.config or separate API call

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Icon */}
      <div className="text-4xl mb-3">{application.icon || '📱'}</div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
        {application.label || application.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
        {application.description || 'No description'}
      </p>

      {/* Status Badge */}
      <div className="mb-4">
        {status === 'published' ? (
          <Badge variant="success" className="bg-green-100 text-green-700">
            Published
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Draft
          </Badge>
        )}
      </div>

      {/* Object Count */}
      <p className="text-sm text-gray-500 mb-4">
        {objectCount} object{objectCount !== 1 ? 's' : ''}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/applications/${application.id}/edit`)}
          className="flex-1"
        >
          Edit
        </Button>
        <ApplicationActions application={application} />
      </div>

      {/* Last Updated */}
      <p className="text-xs text-gray-400 mt-4">
        Updated {formatDistanceToNow(new Date(application.updated_at), { addSuffix: true })}
      </p>
    </div>
  );
};
```

#### ApplicationFilters.tsx
```typescript
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useState } from 'react';

interface ApplicationFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | 'published' | 'draft';
  onStatusFilterChange: (status: 'all' | 'published' | 'draft') => void;
}

export const ApplicationFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ApplicationFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search applications..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'published' | 'draft')}
          >
            <option value="all">All Applications</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
        </div>
      </div>
    </div>
  );
};
```

#### ApplicationActions.tsx
```typescript
import { Menu } from '@headlessui/react';
import { Application } from '../types/application.types';
import { useDeleteApplication } from '../hooks/useDeleteApplication';
import { usePublishApplication } from '../hooks/usePublishApplication';
import { useCloneApplication } from '../hooks/useCloneApplication';
import { Button } from '@/components/ui/Button';

interface ApplicationActionsProps {
  application: Application;
}

export const ApplicationActions = ({ application }: ApplicationActionsProps) => {
  const { mutate: deleteApp } = useDeleteApplication();
  const { mutate: publishApp } = usePublishApplication();
  const { mutate: cloneApp } = useCloneApplication();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${application.label || application.name}"?`)) {
      deleteApp(application.id);
    }
  };

  const handlePublish = () => {
    publishApp(application.id);
  };

  const handleClone = () => {
    cloneApp(application.id);
  };

  const isPublished = application.published_at !== null;

  return (
    <Menu as="div" className="relative">
      <Menu.Button as={Button} variant="outline" size="sm">
        ⋮
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
        {isPublished ? (
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handlePublish}
                className={`${
                  active ? 'bg-gray-100' : ''
                } w-full text-left px-4 py-2 text-sm text-gray-700`}
              >
                Unpublish
              </button>
            )}
          </Menu.Item>
        ) : (
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handlePublish}
                className={`${
                  active ? 'bg-gray-100' : ''
                } w-full text-left px-4 py-2 text-sm text-gray-700`}
              >
                Publish
              </button>
            )}
          </Menu.Item>
        )}

        <Menu.Item>
          {({ active }) => (
            <button
              onClick={handleClone}
              className={`${
                active ? 'bg-gray-100' : ''
              } w-full text-left px-4 py-2 text-sm text-gray-700`}
            >
              Clone
            </button>
          )}
        </Menu.Item>

        <Menu.Item>
          {({ active }) => (
            <button
              onClick={handleDelete}
              className={`${
                active ? 'bg-red-50' : ''
              } w-full text-left px-4 py-2 text-sm text-red-600`}
            >
              Delete
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
};
```

#### EmptyApplications.tsx
```typescript
interface EmptyApplicationsProps {
  onCreate: () => void;
}

export const EmptyApplications = ({ onCreate }: EmptyApplicationsProps) => {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📱</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
      <p className="text-gray-600 mb-6">Create your first application to get started</p>
      <Button onClick={onCreate} className="mx-auto">
        <span className="text-xl mr-2">+</span>
        Create Application
      </Button>
    </div>
  );
};
```

#### useApplications.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getApplicationsAPI } from '@/lib/api/applications.api';

export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: () => getApplicationsAPI(),
    staleTime: 30000, // 30 seconds
  });
};
```

#### useDeleteApplication.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteApplicationAPI } from '@/lib/api/applications.api';

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => deleteApplicationAPI(applicationId),
    onSuccess: () => {
      // Invalidate applications list to refetch
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      console.error('Delete application failed:', error);
      alert('Failed to delete application. Please try again.');
    },
  });
};
```

#### usePublishApplication.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishApplicationAPI, unpublishApplicationAPI } from '@/lib/api/applications.api';

export const usePublishApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, publish }: { applicationId: string; publish: boolean }) => {
      return publish ? publishApplicationAPI(applicationId) : unpublishApplicationAPI(applicationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      console.error('Publish/Unpublish failed:', error);
      alert('Failed to update application status. Please try again.');
    },
  });
};
```

#### useCloneApplication.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cloneApplicationAPI } from '@/lib/api/applications.api';

export const useCloneApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => cloneApplicationAPI(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      console.error('Clone application failed:', error);
      alert('Failed to clone application. Please try again.');
    },
  });
};
```

#### applications.api.ts
```typescript
import { apiClient } from './client';
import { Application } from '@/features/applications/types/application.types';

export const getApplicationsAPI = async (): Promise<Application[]> => {
  const { data } = await apiClient.get<Application[]>('/api/applications');
  return data;
};

export const deleteApplicationAPI = async (applicationId: string): Promise<void> => {
  await apiClient.delete(`/api/applications/${applicationId}`);
};

export const publishApplicationAPI = async (applicationId: string): Promise<Application> => {
  const { data } = await apiClient.post<Application>(`/api/applications/${applicationId}/publish`);
  return data;
};

export const unpublishApplicationAPI = async (applicationId: string): Promise<Application> => {
  const { data } = await apiClient.post<Application>(`/api/applications/${applicationId}/unpublish`);
  return data;
};

export const cloneApplicationAPI = async (applicationId: string): Promise<Application> => {
  const { data } = await apiClient.post<Application>(`/api/applications/${applicationId}/clone`);
  return data;
};
```

#### application.types.ts
```typescript
export interface Application {
  id: string; // app_xxxxxxxx
  name: string; // Unique identifier
  label: string | null; // Display name
  description: string | null;
  icon: string | null; // Emoji or icon class
  config: Record<string, any>; // JSONB
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  created_by: string; // User UUID
  published_at: string | null; // ISO 8601 datetime or null
}

export type ApplicationStatus = 'draft' | 'published';

export interface ApplicationFilters {
  searchQuery: string;
  status: 'all' | 'published' | 'draft';
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - API state management
- `react-router-dom` - Navigation
- `date-fns` - Date formatting (relative time)
- `@headlessui/react` - Dropdown menu (unstyled)

### NPM Packages (To Install)
```bash
npm install date-fns @headlessui/react
```

### UI Components (To Be Built/Used)
- `Badge` component - Status badges
- `Button` component - Actions
- `Input` component - Search
- `Select` component - Filter dropdown

### Custom Hooks (To Be Built)
- `useDebounce` - Debounced search input

---

## Acceptance Criteria

- [ ] Applications listesi `/applications` route'unda çalışıyor
- [ ] Card grid layout responsive (1 col mobile, 2 tablet, 3 desktop, 4 xl)
- [ ] Her card'da icon, label, description, status badge, object count gösteriliyor
- [ ] Status badge doğru renklerde (draft=gray, published=green)
- [ ] Search çalışıyor (name, label, description'da arama)
- [ ] Status filter çalışıyor (All, Published, Draft)
- [ ] Edit button doğru sayfaya yönlendiriyor
- [ ] Delete mutation çalışıyor (confirmation dialog + refetch)
- [ ] Publish/Unpublish mutation çalışıyor (refetch)
- [ ] Clone mutation çalışıyor (refetch)
- [ ] Empty state gösteriliyor (hiç application yoksa)
- [ ] Loading state çalışıyor
- [ ] Error state gösteriliyor
- [ ] Last updated relative time doğru formatlanıyor
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Sayfa açılıyor ve applications yükleniyor
- [ ] Card grid düzgün görünüyor (responsive)
- [ ] Search input çalışıyor (debounced)
- [ ] Status filter çalışıyor (All, Published, Draft)
- [ ] Edit button doğru sayfaya yönlendiriyor
- [ ] Delete confirmation dialog açılıyor
- [ ] Delete sonrası liste güncelleniyor
- [ ] Publish/Unpublish sonrası badge değişiyor
- [ ] Clone sonrası yeni application listede görünüyor
- [ ] Empty state gösteriliyor (hiç application yoksa)
- [ ] No results gösteriliyor (filter sonucu boş)
- [ ] Loading spinner gösteriliyor
- [ ] Error mesajı gösteriliyor (network error)
- [ ] Mobile responsive test (320px, 768px, 1024px, 1440px)

### Test Data Examples
```typescript
// CRM Application (Published)
{
  id: "app_crm",
  name: "CRM",
  label: "CRM Application",
  description: "Customer Relationship Management System",
  icon: "👥",
  published_at: "2026-01-18T12:00:00Z"
}

// ITSM Application (Draft)
{
  id: "app_itsm",
  name: "ITSM",
  label: "IT Service Management",
  description: "IT ticketing and asset management",
  icon: "🛠️",
  published_at: null
}

// Project Management (Published)
{
  id: "app_pm",
  name: "ProjectManagement",
  label: "Project Management",
  description: "Manage projects, tasks and teams",
  icon: "📊",
  published_at: "2026-01-17T15:00:00Z"
}
```

---

## Code Examples

### Complete Flow
```typescript
// 1. User navigates to /applications
// 2. useApplications hook fetches data (TanStack Query)
// 3. ApplicationsList renders cards in grid
// 4. User types in search → debounced filter
// 5. User selects status filter → immediate filter
// 6. User clicks Edit → navigate to edit page
// 7. User clicks Delete → confirmation → mutation → refetch
// 8. User clicks Publish → mutation → refetch
// 9. User clicks Clone → mutation → refetch
```

### useDebounce Hook
```typescript
import { useEffect, useState } from 'react';

export const useDebounce = <T,>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

### Badge Component
```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        success: 'bg-green-100 text-green-700 border border-green-200',
        secondary: 'bg-gray-100 text-gray-700 border border-gray-200',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};
```

---

## Resources

### Backend Documentation
- [GET /api/applications](../../backend-docs/api/05-applications/02-list-applications.md) - List applications endpoint
- [DELETE /api/applications/:id](../../backend-docs/api/05-applications/04-delete-application.md) - Delete application
- [POST /api/applications/:id/publish](../../backend-docs/api/05-applications/06-publish-application.md) - Publish application
- [POST /api/applications/:id/clone](../../backend-docs/api/05-applications/07-clone-application.md) - Clone application

### Frontend Libraries
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Headless UI Menu](https://headlessui.com/react/menu)
- [date-fns formatDistanceToNow](https://date-fns.org/v2.29.3/docs/formatDistanceToNow)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Applications List page exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/08-applications/01-application-list.md

Requirements:
1. Create src/features/applications/pages/ApplicationsList.tsx - Main list page with search, filter, and grid layout
2. Create src/features/applications/components/ApplicationCard.tsx - Card component with icon, status badge, actions
3. Create src/features/applications/components/ApplicationFilters.tsx - Search input + status filter
4. Create src/features/applications/components/ApplicationActions.tsx - Dropdown menu (Edit, Publish, Delete, Clone)
5. Create src/features/applications/components/EmptyApplications.tsx - Empty state component
6. Create src/features/applications/hooks/useApplications.ts - TanStack Query hook for fetching applications
7. Create src/features/applications/hooks/useDeleteApplication.ts - Delete mutation hook
8. Create src/features/applications/hooks/usePublishApplication.ts - Publish/Unpublish mutation hook
9. Create src/features/applications/hooks/useCloneApplication.ts - Clone mutation hook
10. Create src/lib/api/applications.api.ts - API functions (getApplications, deleteApplication, publishApplication, cloneApplication)
11. Create src/features/applications/types/application.types.ts - TypeScript type definitions
12. Create src/hooks/useDebounce.ts - Debounce hook for search
13. Create src/components/ui/Badge.tsx - Status badge component (if not exists)

CRITICAL REQUIREMENTS:
- Card grid: 1 column (mobile), 2 (tablet), 3 (desktop), 4 (xl screens)
- Status badges: Green for published, Gray for draft
- Search: Debounced 300ms, searches name, label, description
- Filter: All, Published (published_at !== null), Draft (published_at === null)
- Actions dropdown: Edit, Publish/Unpublish, Clone, Delete (with confirmation)
- Empty state: Show when no applications exist
- Loading state: Spinner during fetch
- Error state: Error message on fetch failure
- Last updated: Relative time (e.g., "2 days ago") using date-fns
- Mobile responsive design

Test with example data:
- CRM Application (Published, icon: 👥)
- ITSM Application (Draft, icon: 🛠️)
- Project Management (Published, icon: 📊)

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 02-create-application.md
