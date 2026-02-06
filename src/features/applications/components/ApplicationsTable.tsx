import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Application } from '@/lib/api/applications.api';
import { Button } from '@/components/ui/Button';
import { Rocket, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface ApplicationsTableProps {
  applications: Application[];
}

export const ApplicationsTable = ({ applications }: ApplicationsTableProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const columns = useMemo<ColumnDef<Application>[]>(
    () => [
      {
        id: 'icon',
        header: '',
        cell: (info) => {
          const app = info.row.original;
          return (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
              {app.icon || '📱'}
            </div>
          );
        },
        size: 60,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => {
          const app = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-white">{app.name}</span>
              {app.label && app.label !== app.name && (
                <span className="text-sm text-gray-500 dark:text-slate-400">{app.label}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => {
          const description = info.getValue() as string | null;
          return (
            <span className="text-sm text-gray-600 dark:text-slate-400 truncate max-w-md block">
              {description || '-'}
            </span>
          );
        },
      },
      {
        accessorKey: 'published_at',
        header: 'Status',
        cell: (info) => {
          const publishedAt = info.getValue() as string | null;
          return publishedAt ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                <Rocket className="w-3 h-3 mr-1" />
                Published
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300">
              <Clock className="w-3 h-3 mr-1" />
              Draft
            </span>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: (info) => {
          const date = info.getValue() as string;
          return (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              {formatDate(date)}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: applications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-surface-dark shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-surface-dark-alt">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
                <th className="px-4 py-3 w-10"></th>
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-surface-dark divide-y divide-gray-200 dark:divide-slate-700">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => navigate(`/applications/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="px-4 py-4">
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-700 dark:text-slate-300">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              applications.length
            )}{' '}
            of {applications.length} applications
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
