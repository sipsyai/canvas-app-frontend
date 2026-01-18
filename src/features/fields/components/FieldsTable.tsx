import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Field } from '@/types/field.types';
import { FieldTypeIcon } from './FieldTypeIcon';
import { Button } from '@/components/ui/Button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FieldsTableProps {
  fields: Field[];
}

export const FieldsTable = ({ fields }: FieldsTableProps) => {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<Field>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'label',
        header: 'Label',
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: (info) => {
          const type = info.getValue() as string;
          return (
            <div className="flex items-center gap-2">
              <FieldTypeIcon type={type as any} />
              <span className="text-sm capitalize">{type}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: (info) => {
          const category = info.getValue() as string | null;
          if (!category) return <span className="text-gray-400">—</span>;
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {category}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const field = info.row.original;
          const isSystem = field.is_system_field;

          return (
            <div className="flex gap-2">
              {isSystem ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/fields/${field.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/fields/${field.id}/edit`)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete field "${field.label}"?`)) {
                        // TODO: Implement delete mutation (task 18)
                        console.log('Delete field:', field.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [navigate]
  );

  const table = useReactTable({
    data: fields,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  return (
    <div>
      {/* Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
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
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {table.getState().pagination.pageIndex * 50 + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * 50,
            fields.length
          )}{' '}
          of {fields.length} fields
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ← Prev
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
};
