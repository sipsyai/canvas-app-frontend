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
import { Pencil, Trash2, Eye, Rocket, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface ApplicationsTableProps {
  applications: Application[];
  onDelete?: (app: Application) => void;
  onPublish?: (app: Application) => void;
}

export const ApplicationsTable = ({ applications, onDelete, onPublish }: ApplicationsTableProps) => {
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
              <span className="font-medium text-gray-900">{app.name}</span>
              {app.label && app.label !== app.name && (
                <span className="text-sm text-gray-500">{app.label}</span>
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
            <span className="text-sm text-gray-600 truncate max-w-md block">
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Rocket className="w-3 h-3 mr-1" />
                Published
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {formatDate(date)}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const app = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/applications/${app.id}`)}
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/applications/${app.id}/edit`)}
                title="Edit application"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              {!app.published_at && onPublish && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPublish(app)}
                  title="Publish application"
                  className="text-green-600 hover:text-green-700"
                >
                  <Rocket className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onDelete(app)}
                  title="Delete application"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        },
        size: 180,
      },
    ],
    [navigate, onDelete, onPublish]
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
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
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

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-700">
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
