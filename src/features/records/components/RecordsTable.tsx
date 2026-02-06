/**
 * RecordsTable Component
 *
 * Dynamic data table with TanStack Table v8
 * Features: sorting, filtering, pagination
 */

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useDynamicColumns } from '../hooks/useDynamicColumns';
import type { DataRecord } from '@/types/record.types';
import type { ObjectFieldWithDetails } from '@/types/object-field.types';

interface RecordsTableProps {
  fields: ObjectFieldWithDetails[];
  records: DataRecord[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  globalFilter?: string;
  onRowClick?: (record: DataRecord) => void;
  onEdit?: (record: DataRecord) => void;
  onDelete?: (record: DataRecord) => void;
  onViewDetails?: (record: DataRecord) => void;
}

export const RecordsTable = ({
  fields,
  records,
  sorting,
  onSortingChange,
  globalFilter,
  onRowClick,
  onEdit,
  onDelete,
  onViewDetails,
}: RecordsTableProps) => {
  // Generate dynamic columns from fields
  const columns = useDynamicColumns({ fields, onEdit, onDelete, onViewDetails });

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange,
    enableSortingRemoval: false, // Always have a sort direction
  });

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm">
      <table className="w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-surface-dark-alt">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? 'flex items-center gap-2 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-300'
                          : 'flex items-center gap-2'
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span className="inline-flex flex-col">
                          {header.column.getIsSorted() === 'asc' && (
                            <ChevronUp className="h-4 w-4" />
                          )}
                          {header.column.getIsSorted() === 'desc' && (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          {!header.column.getIsSorted() && (
                            <span className="h-4 w-4 text-gray-300 dark:text-slate-600">
                              <ChevronUp className="h-3 w-3" />
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="bg-white dark:bg-surface-dark divide-y divide-gray-200 dark:divide-slate-700">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={
                onRowClick
                  ? 'hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors'
                  : 'hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors'
              }
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state (when filtered) */}
      {table.getRowModel().rows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400">No records found</p>
        </div>
      )}
    </div>
  );
};
