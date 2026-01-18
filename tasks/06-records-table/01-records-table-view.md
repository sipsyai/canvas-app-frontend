# Task: Records Table View

**Priority:** 🟡 Medium
**Estimated Time:** 2.5 gün
**Dependencies:** 05-object-fields, 09-ui-components (Table)

---

## Objective

Bir object'e ait tüm record'ları dinamik kolonlarla gösteren, sıralama/filtreleme/pagination destekleyen tablo komponenti oluşturmak. **CRITICAL:** Tablo kolonları object-field'lara göre dinamik olarak oluşturulmalı!

---

## Backend API

### Endpoint
```
GET /api/records?object_id={id}
```

### Request Format
```typescript
interface RecordsListParams {
  object_id: string;  // Object ID (e.g., "obj_contact")
  page?: number;      // Sayfa numarası (default: 1)
  page_size?: number; // Sayfa başına kayıt (default: 50, max: 100)
}
```

### Response
```json
{
  "total": 150,
  "page": 1,
  "page_size": 50,
  "records": [
    {
      "id": "rec_a1b2c3d4",
      "object_id": "obj_contact",
      "data": {
        "fld_name": "Ali Yılmaz",
        "fld_email": "ali@example.com",
        "fld_phone": "+90 555 123 4567",
        "fld_website": "https://example.com",
        "fld_active": true,
        "fld_birth_date": "1990-05-15",
        "fld_status": "Active",
        "fld_tags": ["VIP", "Premium"]
      },
      "primary_value": "Ali Yılmaz",
      "created_at": "2026-01-18T10:00:00Z",
      "updated_at": "2026-01-18T10:00:00Z"
    }
  ]
}
```

**Response Fields:**
- `total` - Toplam kayıt sayısı
- `page` - Mevcut sayfa numarası
- `page_size` - Sayfa başına kayıt sayısı
- `records` - Kayıt listesi (array)
  - `id` - Record ID
  - `object_id` - Object ID
  - `data` - Field verileri (key-value pairs, field_id → value)
  - `primary_value` - Ana değer (tablo'da bold gösterilecek)
  - `created_at` / `updated_at` - Timestamps

**Backend Documentation:**
→ [GET /api/records](../../backend-docs/api/04-records/02-list-records.md)

---

## UI/UX Design

### Page Layout
```
┌────────────────────────────────────────────────────────────────────┐
│ Contacts                                          [+ Add Record]   │
│                                                                    │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ 🔍 Search records...                    [⚙️ Columns] [↻]    │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ Name ▼     | Email          | Phone         | Status | ... │  │
│ ├─────────────────────────────────────────────────────────────│  │
│ │ Ali Yılmaz | ali@ex.com     | +90 555 123.. | ✓ Active   │  │
│ │ Ayşe Kaya  | ayse@ex.com    | +90 555 456.. | ⊗ Inactive │  │
│ │ Mehmet Öz  | mehmet@ex.com  | +90 555 789.. | ✓ Active   │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ Showing 1-50 of 150 records      [ Previous ] [ 1 ] 2 3 [ Next ] │
└────────────────────────────────────────────────────────────────────┘
```

### Dynamic Table Features

#### 1. **Dynamic Column Generation**
Tablo kolonları `object-fields` endpoint'inden alınan field tanımlarına göre otomatik oluşturulur:

```typescript
// GET /api/object-fields?object_id=obj_contact
const fields = [
  { id: "fld_name", name: "Name", type: "text", is_primary: true },
  { id: "fld_email", name: "Email", type: "email" },
  { id: "fld_phone", name: "Phone", type: "phone" },
  { id: "fld_website", name: "Website", type: "url" },
  { id: "fld_active", name: "Active", type: "checkbox" },
  { id: "fld_birth_date", name: "Birth Date", type: "date" },
  { id: "fld_status", name: "Status", type: "select" },
  { id: "fld_tags", name: "Tags", type: "multiselect" }
];

// → Her field için bir column oluşturulur!
```

#### 2. **Field Type Specific Rendering**

Her field type için özel cell renderer:

| Field Type | Rendering | Example |
|------------|-----------|---------|
| `text` | Plain text | `Ali Yılmaz` |
| `email` | Mailto link | `<a href="mailto:ali@example.com">ali@example.com</a>` |
| `phone` | Tel link + format | `<a href="tel:+905551234567">+90 555 123 45 67</a>` |
| `url` | Clickable link | `<a href="https://example.com" target="_blank">example.com</a>` |
| `checkbox` | Check/X icon | `✓` or `⊗` |
| `date` | Formatted date | `15 Mayıs 1990` |
| `select` | Badge | `<Badge color="blue">Active</Badge>` |
| `multiselect` | Multiple badges | `<Badge>VIP</Badge> <Badge>Premium</Badge>` |
| `number` | Formatted number | `1,234.56` |
| `currency` | Currency format | `$1,234.56` |
| `textarea` | Truncated text + tooltip | `Lorem ipsum dolor...` |

#### 3. **Table Features**

**Sıralama (Sorting):**
- Her kolon başlığında sort ikonu (▲ ▼)
- Ascending / Descending toggle
- Default sort: `created_at DESC`

**Filtreleme (Filtering):**
- Global search (tüm kolonlarda ara)
- Column-specific filters (gelecek task)

**Pagination:**
- 50 record per page (default)
- Page size selector: 25 / 50 / 100
- Previous / Next buttons
- Page numbers (max 5 visible)

**Column Visibility:**
- Column picker dropdown (⚙️ icon)
- Show/hide columns
- Drag to reorder (gelecek task)

**Actions Column:**
- Edit button → `/objects/{object_id}/records/{record_id}/edit`
- Delete button → Confirmation modal → DELETE /api/records/{id}
- View details → Row click → Record detail modal

**Row Click:**
- Tıklanan satır highlight
- Record detail modal açılır
- Quick edit / delete actions

#### 4. **Empty State**
```
┌────────────────────────────────────┐
│                                    │
│        📋                          │
│     No Records Yet                 │
│                                    │
│  Create your first record to get   │
│  started with your Contact object. │
│                                    │
│     [+ Add First Record]           │
│                                    │
└────────────────────────────────────┘
```

#### 5. **Loading State**
```
┌────────────────────────────────────┐
│ [Skeleton row 1                  ] │
│ [Skeleton row 2                  ] │
│ [Skeleton row 3                  ] │
│ [Skeleton row 4                  ] │
│ [Skeleton row 5                  ] │
└────────────────────────────────────┘
```

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── records/
│       ├── pages/
│       │   └── RecordsTablePage.tsx       ⭐ Main table page
│       ├── components/
│       │   ├── RecordsTable.tsx           ⭐ Table component (TanStack Table)
│       │   ├── RecordsTableToolbar.tsx    ⭐ Search + Actions toolbar
│       │   ├── RecordRow.tsx              ⭐ Table row component
│       │   ├── FieldRenderer.tsx          ⭐ Dynamic field renderer
│       │   ├── EmptyRecordsState.tsx      ⭐ Empty state
│       │   └── RecordsTableSkeleton.tsx   ⭐ Loading skeleton
│       ├── hooks/
│       │   ├── useRecords.ts              ⭐ Fetch records (TanStack Query)
│       │   ├── useObjectFields.ts         ⭐ Fetch object fields
│       │   ├── useDynamicColumns.ts       ⭐ Generate columns from fields
│       │   ├── useDeleteRecord.ts         ⭐ Delete record mutation
│       │   └── useTableState.ts           ⭐ Table state (sort, filter, pagination)
│       ├── utils/
│       │   ├── fieldRenderers.tsx         ⭐ Field type specific renderers
│       │   └── columnGenerators.ts        ⭐ Column definition generators
│       └── types/
│           └── records.types.ts           ⭐ TypeScript types
├── lib/
│   └── api/
│       └── records.api.ts                 ⭐ API calls
└── components/
    └── ui/
        └── Table/                         ⭐ Reusable table components
            ├── Table.tsx
            ├── TableHeader.tsx
            ├── TableBody.tsx
            ├── TableRow.tsx
            └── TableCell.tsx
```

### Component Implementation

#### RecordsTablePage.tsx
```typescript
import { useParams } from 'react-router-dom';
import { RecordsTable } from '../components/RecordsTable';
import { RecordsTableToolbar } from '../components/RecordsTableToolbar';
import { RecordsTableSkeleton } from '../components/RecordsTableSkeleton';
import { EmptyRecordsState } from '../components/EmptyRecordsState';
import { useRecords } from '../hooks/useRecords';
import { useObjectFields } from '../hooks/useObjectFields';
import { useTableState } from '../hooks/useTableState';

export const RecordsTablePage = () => {
  const { objectId } = useParams<{ objectId: string }>();

  const tableState = useTableState({
    pageSize: 50,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Fetch object fields (for dynamic columns)
  const { data: fields, isLoading: fieldsLoading } = useObjectFields(objectId);

  // Fetch records
  const {
    data: recordsData,
    isLoading: recordsLoading,
    error,
  } = useRecords({
    objectId,
    page: tableState.page,
    pageSize: tableState.pageSize,
  });

  if (fieldsLoading || recordsLoading) {
    return <RecordsTableSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error loading records: {error.message}</p>
      </div>
    );
  }

  if (!recordsData || recordsData.records.length === 0) {
    return <EmptyRecordsState objectId={objectId} />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Records</h1>
        <p className="text-gray-600 mt-1">
          Manage your {objectId} records
        </p>
      </div>

      <RecordsTableToolbar
        objectId={objectId}
        totalRecords={recordsData.total}
        onSearch={tableState.setSearchQuery}
      />

      <RecordsTable
        fields={fields}
        records={recordsData.records}
        tableState={tableState}
      />

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {(tableState.page - 1) * tableState.pageSize + 1} -{' '}
          {Math.min(tableState.page * tableState.pageSize, recordsData.total)}{' '}
          of {recordsData.total} records
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => tableState.setPage(tableState.page - 1)}
            disabled={tableState.page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => tableState.setPage(tableState.page + 1)}
            disabled={tableState.page * tableState.pageSize >= recordsData.total}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### RecordsTable.tsx
```typescript
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useDynamicColumns } from '../hooks/useDynamicColumns';
import { FieldRenderer } from './FieldRenderer';
import type { ObjectField } from '@/features/objects/types/object.types';
import type { Record } from '../types/records.types';

interface RecordsTableProps {
  fields: ObjectField[];
  records: Record[];
  tableState: ReturnType<typeof useTableState>;
}

export const RecordsTable = ({ fields, records, tableState }: RecordsTableProps) => {
  // Generate dynamic columns from fields
  const columns = useDynamicColumns(fields);

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting: [
        {
          id: tableState.sortBy,
          desc: tableState.sortOrder === 'desc',
        },
      ],
      globalFilter: tableState.searchQuery,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function'
        ? updater(table.getState().sorting)
        : updater;

      if (newSorting.length > 0) {
        tableState.setSortBy(newSorting[0].id);
        tableState.setSortOrder(newSorting[0].desc ? 'desc' : 'asc');
      }
    },
  });

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' ▲',
                      desc: ' ▼',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                // Open record detail modal
                console.log('Row clicked:', row.original);
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

#### useDynamicColumns.ts
```typescript
import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { FieldRenderer } from '../components/FieldRenderer';
import type { ObjectField } from '@/features/objects/types/object.types';
import type { Record } from '../types/records.types';

const columnHelper = createColumnHelper<Record>();

export const useDynamicColumns = (fields: ObjectField[]) => {
  return useMemo(() => {
    // Generate columns from fields
    const fieldColumns = fields.map((field) =>
      columnHelper.accessor(
        (row) => row.data[field.id], // Access field value from record.data
        {
          id: field.id,
          header: field.name,
          cell: (info) => (
            <FieldRenderer
              type={field.type}
              value={info.getValue()}
              field={field}
            />
          ),
          enableSorting: true,
        }
      )
    );

    // Add Actions column
    const actionsColumn = columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit
            }}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle delete
            }}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    });

    return [...fieldColumns, actionsColumn];
  }, [fields]);
};
```

#### FieldRenderer.tsx
```typescript
import { formatDate, formatPhoneNumber, formatCurrency } from '@/utils/formatters';
import type { ObjectField } from '@/features/objects/types/object.types';

interface FieldRendererProps {
  type: ObjectField['type'];
  value: any;
  field: ObjectField;
}

export const FieldRenderer = ({ type, value, field }: FieldRendererProps) => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">-</span>;
  }

  switch (type) {
    case 'text':
      return (
        <span className={field.is_primary ? 'font-semibold text-gray-900' : 'text-gray-700'}>
          {value}
        </span>
      );

    case 'email':
      return (
        <a
          href={`mailto:${value}`}
          className="text-blue-600 hover:text-blue-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      );

    case 'phone':
      const formattedPhone = formatPhoneNumber(value);
      return (
        <a
          href={`tel:${value.replace(/\s/g, '')}`}
          className="text-blue-600 hover:text-blue-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {formattedPhone}
        </a>
      );

    case 'url':
      const displayUrl = value.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {displayUrl}
        </a>
      );

    case 'checkbox':
      return (
        <span className="text-lg">
          {value ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-red-600">⊗</span>
          )}
        </span>
      );

    case 'date':
      return <span className="text-gray-700">{formatDate(value)}</span>;

    case 'select':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      );

    case 'multiselect':
      if (!Array.isArray(value)) return <span className="text-gray-400">-</span>;
      return (
        <div className="flex gap-1 flex-wrap">
          {value.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {item}
            </span>
          ))}
        </div>
      );

    case 'number':
      return <span className="text-gray-700 font-mono">{value.toLocaleString()}</span>;

    case 'currency':
      return <span className="text-gray-700 font-mono">{formatCurrency(value)}</span>;

    case 'textarea':
      const truncated = value.length > 50 ? value.substring(0, 50) + '...' : value;
      return (
        <span className="text-gray-700" title={value}>
          {truncated}
        </span>
      );

    default:
      return <span className="text-gray-700">{String(value)}</span>;
  }
};
```

#### useRecords.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getRecordsAPI } from '@/lib/api/records.api';

interface UseRecordsParams {
  objectId: string;
  page?: number;
  pageSize?: number;
}

export const useRecords = ({ objectId, page = 1, pageSize = 50 }: UseRecordsParams) => {
  return useQuery({
    queryKey: ['records', objectId, page, pageSize],
    queryFn: () => getRecordsAPI({ object_id: objectId, page, page_size: pageSize }),
    enabled: !!objectId,
    staleTime: 30000, // 30 seconds
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
    staleTime: 60000, // 1 minute (fields rarely change)
  });
};
```

#### useTableState.ts
```typescript
import { useState } from 'react';

interface TableStateConfig {
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useTableState = (config: TableStateConfig = {}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.pageSize ?? 50);
  const [sortBy, setSortBy] = useState(config.sortBy ?? 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(config.sortOrder ?? 'desc');
  const [searchQuery, setSearchQuery] = useState('');

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    searchQuery,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setSearchQuery,
  };
};
```

#### records.api.ts
```typescript
import { apiClient } from '@/lib/api/client';

interface GetRecordsParams {
  object_id: string;
  page?: number;
  page_size?: number;
}

interface RecordListResponse {
  total: number;
  page: number;
  page_size: number;
  records: Record[];
}

export interface Record {
  id: string;
  object_id: string;
  data: Record<string, any>; // Field ID → Value mapping
  primary_value: string;
  created_by: string;
  updated_by: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export const getRecordsAPI = async (
  params: GetRecordsParams
): Promise<RecordListResponse> => {
  const { data } = await apiClient.get<RecordListResponse>('/api/records', {
    params,
  });
  return data;
};

export const deleteRecordAPI = async (recordId: string): Promise<void> => {
  await apiClient.delete(`/api/records/${recordId}`);
};
```

#### EmptyRecordsState.tsx
```typescript
interface EmptyRecordsStateProps {
  objectId: string;
}

export const EmptyRecordsState = ({ objectId }: EmptyRecordsStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Records Yet
        </h3>
        <p className="text-gray-600 mb-6 max-w-sm">
          Create your first record to get started with your {objectId} object.
        </p>
        <button
          onClick={() => {
            // Navigate to create record page
            window.location.href = `/objects/${objectId}/records/new`;
          }}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add First Record
        </button>
      </div>
    </div>
  );
};
```

#### RecordsTableSkeleton.tsx
```typescript
export const RecordsTableSkeleton = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>

        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="border-b border-gray-200 p-4">
            <div className="flex gap-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Dependencies

### NPM Packages
```bash
# TanStack Table (Data table library)
npm install @tanstack/react-table

# Date formatting
npm install date-fns

# Phone number formatting
npm install libphonenumber-js
```

### Existing Dependencies (Already Installed ✅)
- `@tanstack/react-query` - Data fetching
- `react-router-dom` - Navigation
- `tailwindcss` - Styling

### UI Components (To Be Built)
- `Table` components (Table, TableHeader, TableBody, TableRow, TableCell)
- `Badge` component (for select/multiselect fields)
- `Skeleton` component (loading state)

---

## Acceptance Criteria

- [ ] Tablo `/objects/:objectId/records` route'unda görünüyor
- [ ] Kolonlar object-fields'a göre dinamik oluşturuluyor
- [ ] Her field type için doğru renderer kullanılıyor
- [ ] Email/phone/url fieldları clickable link
- [ ] Checkbox field checkmark/x icon
- [ ] Select/multiselect fieldları badge
- [ ] Date fieldları formatted (DD MMM YYYY)
- [ ] Primary field bold görünüyor
- [ ] Sıralama (sorting) çalışıyor (her kolon)
- [ ] Global search çalışıyor (tüm kolonlarda)
- [ ] Pagination çalışıyor (50 records/page)
- [ ] Actions column (Edit, Delete) çalışıyor
- [ ] Row click → record detail modal (gelecek task)
- [ ] Empty state görünüyor (0 records)
- [ ] Loading skeleton görünüyor (fetch sırasında)
- [ ] Column visibility toggle çalışıyor
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing
- [ ] Boş object (0 records) → Empty state
- [ ] Dolu object (100+ records) → Pagination
- [ ] Sort by name → Ascending order
- [ ] Sort by date → Descending order
- [ ] Global search → Filter results
- [ ] Page 1 → Page 2 → Page 3
- [ ] Email field → Click → Mail client açılıyor
- [ ] Phone field → Click → Dialer açılıyor
- [ ] URL field → Click → Yeni tab açılıyor
- [ ] Edit button → Edit page açılıyor
- [ ] Delete button → Confirmation modal → Record siliniyor
- [ ] Row click → Record detail modal açılıyor
- [ ] Column picker → Hide column → Column gizleniyor

### Test Data
Backend'de test data oluştur:
```bash
# 100 test record
POST /api/records (100 kez)
```

---

## Performance Considerations

### Virtualization (Optional)
100+ record için virtual scrolling:
```bash
npm install @tanstack/react-virtual
```

### Memoization
```typescript
// useDynamicColumns içinde useMemo kullan
const columns = useMemo(() => {
  return generateColumnsFromFields(fields);
}, [fields]);
```

### Pagination Strategy
- Default: 50 records/page
- Max: 100 records/page
- Frontend pagination değil, **backend pagination** kullan!

---

## Resources

### Backend Documentation
- [GET /api/records](../../backend-docs/api/04-records/02-list-records.md) - List records endpoint
- [GET /api/object-fields](../../backend-docs/api/05-object-fields/02-list-object-fields.md) - List object fields

### Frontend Libraries
- [TanStack Table Docs](https://tanstack.com/table/latest) - Data table library
- [TanStack Query Docs](https://tanstack.com/query/latest) - Data fetching
- [date-fns Docs](https://date-fns.org/) - Date formatting

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Records Table View task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/06-records-table/01-records-table-view.md

Requirements:
1. Create src/features/records/pages/RecordsTablePage.tsx - Main table page with toolbar and pagination
2. Create src/features/records/components/RecordsTable.tsx - TanStack Table component
3. Create src/features/records/components/FieldRenderer.tsx - Dynamic field renderer (type-specific)
4. Create src/features/records/components/EmptyRecordsState.tsx - Empty state component
5. Create src/features/records/components/RecordsTableSkeleton.tsx - Loading skeleton
6. Create src/features/records/hooks/useRecords.ts - Fetch records hook
7. Create src/features/records/hooks/useObjectFields.ts - Fetch object fields hook
8. Create src/features/records/hooks/useDynamicColumns.ts - Generate dynamic columns hook
9. Create src/features/records/hooks/useTableState.ts - Table state management hook
10. Create src/lib/api/records.api.ts - Records API functions
11. Create src/features/records/types/records.types.ts - TypeScript types

CRITICAL REQUIREMENTS:
- Table columns MUST be generated dynamically from object-fields!
- Each field type MUST have its own renderer (email → mailto, phone → tel, etc.)
- Use TanStack Table v8 for table management
- Use TanStack Query for data fetching
- Implement backend pagination (NOT frontend pagination)
- Default sort: created_at DESC
- Page size: 50 (default), max 100
- Empty state for 0 records
- Loading skeleton for fetch state
- Actions column: Edit + Delete buttons
- Row click → Record detail modal (placeholder)
- Mobile responsive design with Tailwind CSS 4

Field Renderers:
- text: Plain text (primary field → bold)
- email: mailto link
- phone: tel link + formatted
- url: clickable link (target="_blank")
- checkbox: ✓ or ⊗ icon
- date: formatted (DD MMM YYYY)
- select: badge
- multiselect: multiple badges
- number: formatted (1,234.56)
- currency: $ symbol
- textarea: truncated (50 chars) + tooltip

Install dependencies:
npm install @tanstack/react-table date-fns libphonenumber-js

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 02-record-detail-modal.md
