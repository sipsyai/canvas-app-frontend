# Task: Table Component

**Priority:** 🔴 High
**Estimated Time:** 1.5 gün
**Dependencies:** React Aria Components 1.5, TanStack Table v8

---

## Objective

TanStack Table v8 kullanarak sıralama, filtreleme, sayfalama ve satır seçimi özellikleriyle tam fonksiyonlu bir tablo bileşeni oluşturmak.

---

## Features

### Core Features
1. **Column Sorting**
   - Ascending/Descending sıralama
   - Multi-column sorting desteği
   - Sıralama yönü göstergesi (↑↓)

2. **Column Filtering**
   - Text filtreleme
   - Select filtreleme
   - Date range filtreleme
   - Custom filter components

3. **Column Visibility**
   - Sütun göster/gizle toggle
   - Dropdown menü ile kontrol
   - Seçilen sütunları kaydetme

4. **Pagination**
   - Sayfa başına satır sayısı seçimi (10, 25, 50, 100)
   - Önceki/Sonraki navigasyon
   - Sayfa numarası göstergesi
   - İlk/Son sayfa butonları

5. **Row Selection**
   - Tek satır seçimi
   - Çoklu satır seçimi (checkbox)
   - Tümünü seç/kaldır
   - Seçili satır sayısı göstergesi

6. **Loading & Empty States**
   - Skeleton loader (shimmer effect)
   - Empty state illustration
   - Custom empty messages

7. **Responsive Design**
   - Desktop: Full tablo görünümü
   - Tablet: Scroll yapılabilir tablo
   - Mobile: Card layout (optional)
   - Sticky header support

---

## UI/UX Design

### Desktop Layout
```
┌────────────────────────────────────────────────────────────────┐
│  Table Title                              [Column Visibility ▼]│
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [Filter: ___] [Status: All ▼]                  [Search] │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [☐] │ Name ↑  │ Email        │ Status    │ Created     │⚙│  │
│  ├─────┼─────────┼──────────────┼───────────┼─────────────┤  │
│  │ [☐] │ John    │ john@ex.com  │ Active ●  │ 2024-01-15  │  │
│  │ [☐] │ Jane    │ jane@ex.com  │ Inactive  │ 2024-01-14  │  │
│  │ [☑] │ Bob     │ bob@ex.com   │ Active ●  │ 2024-01-13  │  │
│  └─────┴─────────┴──────────────┴───────────┴─────────────┘  │
│                                                                 │
│  2 selected  │  Showing 1-10 of 245    [< 1 2 3 ... 25 >]     │
└────────────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────────────┐
│  [Search ____________] 🔍   │
│  [Filter ▼]  [Sort ▼]       │
│                             │
│  ┌─────────────────────────┐│
│  │ [☐] John Doe            ││
│  │ john@example.com        ││
│  │ Status: Active ●        ││
│  │ Created: Jan 15, 2024   ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ [☐] Jane Smith          ││
│  │ jane@example.com        ││
│  │ Status: Inactive        ││
│  │ Created: Jan 14, 2024   ││
│  └─────────────────────────┘│
│                             │
│  Page 1 of 25   [<] [>]    │
└─────────────────────────────┘
```

---

## Technical Details

### File Structure
```
src/
├── components/
│   └── ui/
│       ├── Table/
│       │   ├── Table.tsx                 ⭐ Main table component
│       │   ├── TableHeader.tsx           ⭐ Header with sorting
│       │   ├── TableBody.tsx             ⭐ Body with rows
│       │   ├── TableRow.tsx              ⭐ Individual row
│       │   ├── TableCell.tsx             ⭐ Cell component
│       │   ├── TablePagination.tsx       ⭐ Pagination controls
│       │   ├── TableFilters.tsx          ⭐ Filter components
│       │   ├── ColumnVisibility.tsx      ⭐ Column toggle
│       │   ├── TableSkeleton.tsx         ⭐ Loading skeleton
│       │   ├── TableEmpty.tsx            ⭐ Empty state
│       │   └── index.ts                  ⭐ Exports
│       └── hooks/
│           └── useTable.ts               ⭐ Table hook (TanStack)
└── types/
    └── table.types.ts                    ⭐ TypeScript types
```

### Component Implementation

#### Table.tsx
```typescript
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { TablePagination } from './TablePagination';
import { TableFilters } from './TableFilters';
import { ColumnVisibility } from './ColumnVisibility';
import { TableSkeleton } from './TableSkeleton';
import { TableEmpty } from './TableEmpty';

interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  loading?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
}

export function Table<TData>({
  data,
  columns,
  loading = false,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableRowSelection = false,
  enableColumnVisibility = true,
  pageSize = 10,
  emptyMessage = 'Veri bulunamadı',
  className = '',
}: TableProps<TData>) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    enableRowSelection,
  });

  // Loading state
  if (loading) {
    return <TableSkeleton rows={pageSize} columns={columns.length} />;
  }

  // Empty state
  if (!data || data.length === 0) {
    return <TableEmpty message={emptyMessage} />;
  }

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {enableFiltering && (
            <TableFilters
              table={table}
              columns={columns}
            />
          )}
        </div>

        {enableColumnVisibility && (
          <ColumnVisibility table={table} />
        )}
      </div>

      {/* Selection Counter */}
      {enableRowSelection && selectedCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} satır seçildi
          </span>
          <button
            onClick={() => table.resetRowSelection()}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Seçimi temizle
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <TableHeader table={table} enableSorting={enableSorting} />
            <TableBody table={table} columns={columns} />
          </table>
        </div>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <TablePagination table={table} />
      )}
    </div>
  );
}
```

#### TableHeader.tsx
```typescript
import { flexRender } from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface TableHeaderProps {
  table: any;
  enableSorting?: boolean;
}

export function TableHeader({ table, enableSorting }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      {table.getHeaderGroups().map((headerGroup: any) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header: any) => {
            const canSort = enableSorting && header.column.getCanSort();
            const isSorted = header.column.getIsSorted();

            return (
              <th
                key={header.id}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                style={{ width: header.getSize() }}
              >
                {header.isPlaceholder ? null : (
                  <div
                    className={`flex items-center gap-2 ${
                      canSort ? 'cursor-pointer select-none hover:text-gray-900' : ''
                    }`}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}

                    {canSort && (
                      <span className="flex flex-col">
                        {isSorted === 'asc' ? (
                          <ChevronUpIcon className="w-4 h-4 text-blue-600" />
                        ) : isSorted === 'desc' ? (
                          <ChevronDownIcon className="w-4 h-4 text-blue-600" />
                        ) : (
                          <div className="flex flex-col -space-y-1">
                            <ChevronUpIcon className="w-3 h-3 text-gray-400" />
                            <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                      </span>
                    )}
                  </div>
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}
```

#### TableBody.tsx
```typescript
import { flexRender } from '@tanstack/react-table';

interface TableBodyProps {
  table: any;
  columns: any[];
}

export function TableBody({ table, columns }: TableBodyProps) {
  const rows = table.getRowModel().rows;

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {rows.map((row: any) => (
        <tr
          key={row.id}
          className={`hover:bg-gray-50 transition-colors ${
            row.getIsSelected() ? 'bg-blue-50' : ''
          }`}
        >
          {row.getVisibleCells().map((cell: any) => (
            <td
              key={cell.id}
              className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
```

#### TablePagination.tsx
```typescript
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface TablePaginationProps {
  table: any;
}

export function TablePagination({ table }: TablePaginationProps) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;

  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
      {/* Left: Rows per page */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Sayfa başına:</span>
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Center: Page info */}
      <div className="text-sm text-gray-700">
        <span className="font-medium">{startRow}-{endRow}</span>
        {' / '}
        <span>{totalRows} satır</span>
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          İlk
        </button>

        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-700">
            Sayfa <span className="font-medium">{pageIndex + 1}</span> / {pageCount}
          </span>
        </div>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        <button
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Son
        </button>
      </div>
    </div>
  );
}
```

#### ColumnVisibility.tsx
```typescript
import React from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EyeIcon, EyeSlashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ColumnVisibilityProps {
  table: any;
}

export function ColumnVisibility({ table }: ColumnVisibilityProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <EyeIcon className="w-4 h-4" />
        Sütunlar
        <ChevronDownIcon className="w-4 h-4" />
      </MenuButton>

      <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
            Görünür Sütunlar
          </div>

          {table.getAllLeafColumns().map((column: any) => {
            // Skip selection column
            if (column.id === 'select') return null;

            return (
              <MenuItem key={column.id}>
                {({ active }) => (
                  <label
                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md ${
                      active ? 'bg-gray-100' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="flex-1 text-gray-900">
                      {typeof column.columnDef.header === 'string'
                        ? column.columnDef.header
                        : column.id}
                    </span>
                    {column.getIsVisible() ? (
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </label>
                )}
              </MenuItem>
            );
          })}
        </div>
      </MenuItems>
    </Menu>
  );
}
```

#### TableSkeleton.tsx
```typescript
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 10, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-10 bg-gray-200 rounded w-64"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="flex-1 px-6 py-3">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="flex-1 px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
        <div className="h-8 bg-gray-200 rounded w-32"></div>
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-8 bg-gray-200 rounded w-64"></div>
      </div>
    </div>
  );
}
```

#### TableEmpty.tsx
```typescript
import { InboxIcon } from '@heroicons/react/24/outline';

interface TableEmptyProps {
  message?: string;
  description?: string;
}

export function TableEmpty({
  message = 'Veri bulunamadı',
  description = 'Görüntülenecek veri bulunmuyor. Farklı filtreler deneyin.',
}: TableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white border border-gray-200 rounded-lg">
      <InboxIcon className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">{message}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">{description}</p>
    </div>
  );
}
```

#### useTable.ts
```typescript
import { useState } from 'react';
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
} from '@tanstack/react-table';

interface UseTableOptions {
  pageSize?: number;
}

export function useTable({ pageSize = 10 }: UseTableOptions = {}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  return {
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
  };
}
```

#### table.types.ts
```typescript
import { ColumnDef } from '@tanstack/react-table';

export interface TableColumn<TData> extends ColumnDef<TData> {
  accessorKey?: string;
  header: string | ((props: any) => JSX.Element);
  cell?: (props: any) => JSX.Element;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  size?: number;
}

export interface TableProps<TData> {
  data: TData[];
  columns: TableColumn<TData>[];
  loading?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}[]

export interface ColumnFilter {
  id: string;
  value: unknown;
}
```

---

## Usage Examples

### Basic Table
```typescript
import { Table } from '@/components/ui/Table';
import { ColumnDef } from '@tanstack/react-table';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'İsim',
    enableSorting: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {row.original.status === 'active' ? '● Aktif' : 'Pasif'}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'createdAt',
    header: 'Oluşturma Tarihi',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('tr-TR'),
    enableSorting: true,
  },
];

const data: User[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Ayşe Demir',
    email: 'ayse@example.com',
    status: 'inactive',
    createdAt: '2024-01-14T10:00:00Z',
  },
];

export function UserListPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Kullanıcılar</h1>

      <Table
        data={data}
        columns={columns}
        enableSorting={true}
        enablePagination={true}
        pageSize={10}
      />
    </div>
  );
}
```

### Table with Row Selection
```typescript
import { Table } from '@/components/ui/Table';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/Checkbox';

const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    size: 50,
  },
  {
    accessorKey: 'name',
    header: 'İsim',
  },
  // ... other columns
];

export function UsersWithSelection() {
  return (
    <Table
      data={users}
      columns={columns}
      enableRowSelection={true}
    />
  );
}
```

### Table with Custom Filters
```typescript
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'status',
    header: 'Durum',
    filterFn: (row, id, value) => {
      return value === 'all' || row.getValue(id) === value;
    },
  },
];

// In your component
const [statusFilter, setStatusFilter] = useState('all');

<div className="flex gap-4 mb-4">
  <select
    value={statusFilter}
    onChange={(e) => {
      setStatusFilter(e.target.value);
      table.getColumn('status')?.setFilterValue(
        e.target.value === 'all' ? '' : e.target.value
      );
    }}
    className="px-4 py-2 border border-gray-300 rounded-lg"
  >
    <option value="all">Tümü</option>
    <option value="active">Aktif</option>
    <option value="inactive">Pasif</option>
  </select>
</div>
```

### Loading State
```typescript
export function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return (
    <Table
      data={data ?? []}
      columns={columns}
      loading={isLoading}
    />
  );
}
```

### Responsive Mobile Layout
```typescript
// For mobile, you can create a card-based layout
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function ResponsiveTable() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">Durum:</span>
              <span className={`text-xs ${item.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                {item.status === 'active' ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <Table data={data} columns={columns} />;
}
```

---

## Dependencies

### NPM Packages
```bash
npm install @tanstack/react-table
npm install @headlessui/react
npm install @heroicons/react
```

**Already Installed:**
- `react-aria-components` 1.5
- `tailwindcss` 4.x

---

## Acceptance Criteria

- [ ] Tablo bileşeni TanStack Table v8 ile entegre
- [ ] Column sorting çalışıyor (asc/desc, multi-column)
- [ ] Column filtering çalışıyor (text, select, custom)
- [ ] Column visibility toggle çalışıyor
- [ ] Pagination çalışıyor (sayfa başına satır, navigasyon)
- [ ] Row selection çalışıyor (single, multiple, select all)
- [ ] Loading skeleton gösteriliyor
- [ ] Empty state gösteriliyor
- [ ] Responsive design çalışıyor (mobile scroll/cards)
- [ ] Tailwind CSS 4 styling uygulanmış
- [ ] TypeScript type definitions eksiksiz
- [ ] Tüm props ve events doğru çalışıyor

---

## Testing Checklist

### Manual Testing
- [ ] Sütun başlığına tıklandığında sıralama değişiyor
- [ ] Multi-column sorting çalışıyor (Shift+Click)
- [ ] Filter input'a yazıldığında tabloda filtreleme oluyor
- [ ] Column visibility dropdown'dan sütun gizlenebiliyor
- [ ] Pagination butonları çalışıyor (ilk, önceki, sonraki, son)
- [ ] Sayfa başına satır sayısı değiştirilebiliyor
- [ ] Tek satır seçimi çalışıyor
- [ ] Çoklu satır seçimi çalışıyor (checkbox)
- [ ] Select all checkbox çalışıyor
- [ ] Loading state skeleton gösteriliyor
- [ ] Boş veri durumunda empty state gösteriliyor
- [ ] Mobile cihazda tablo scroll edilebiliyor veya card layout görünüyor
- [ ] Tablet cihazda tablo düzgün görünüyor

### Accessibility Testing
- [ ] Keyboard navigation çalışıyor (Tab, Space, Enter)
- [ ] Screen reader ile kullanılabiliyor
- [ ] Focus states görünüyor
- [ ] ARIA labels doğru

### Performance Testing
- [ ] 1000+ satır ile test edildi
- [ ] Sıralama hızlı çalışıyor
- [ ] Filtreleme hızlı çalışıyor
- [ ] Pagination smooth çalışıyor

---

## Resources

### TanStack Table Documentation
- [TanStack Table v8 Docs](https://tanstack.com/table/v8)
- [React Table Examples](https://tanstack.com/table/v8/docs/examples/react/basic)
- [Column Filtering](https://tanstack.com/table/v8/docs/guide/column-filtering)
- [Sorting](https://tanstack.com/table/v8/docs/guide/sorting)
- [Pagination](https://tanstack.com/table/v8/docs/guide/pagination)

### UI Libraries
- [Headless UI Menu](https://headlessui.com/react/menu)
- [Heroicons](https://heroicons.com/)
- [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Table Component task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/09-ui-components/04-table-component.md

Requirements:
1. Create src/components/ui/Table/Table.tsx - Main table component with TanStack Table v8
2. Create src/components/ui/Table/TableHeader.tsx - Header with sorting indicators
3. Create src/components/ui/Table/TableBody.tsx - Body with row rendering
4. Create src/components/ui/Table/TablePagination.tsx - Pagination controls (10, 25, 50, 100 per page)
5. Create src/components/ui/Table/ColumnVisibility.tsx - Column visibility toggle dropdown
6. Create src/components/ui/Table/TableSkeleton.tsx - Loading skeleton with shimmer effect
7. Create src/components/ui/Table/TableEmpty.tsx - Empty state with icon and message
8. Create src/components/ui/Table/index.ts - Export all components
9. Create src/hooks/useTable.ts - Custom table hook for state management
10. Create src/types/table.types.ts - TypeScript type definitions

CRITICAL REQUIREMENTS:
- Use TanStack Table v8 (@tanstack/react-table)
- Implement column sorting (ascending/descending, multi-column with Shift+Click)
- Implement column filtering (text, select, custom filters)
- Implement column visibility toggle (dropdown with checkboxes)
- Implement pagination (with page size selector, navigation buttons)
- Implement row selection (single, multiple, select all)
- Add loading skeleton with shimmer animation
- Add empty state with illustration and message
- Responsive design (desktop: full table, tablet/mobile: horizontal scroll or card layout)
- Use Tailwind CSS 4 for all styling
- Use @headlessui/react for dropdown menus
- Use @heroicons/react for icons
- Full TypeScript support with proper types
- Accessible (keyboard navigation, ARIA labels)

Follow the exact code examples and file structure provided in the task file. Test with sample data (users, products, etc.).
```

---

**Status:** 🟡 Pending
**Next Task:** 05-modal-component.md
