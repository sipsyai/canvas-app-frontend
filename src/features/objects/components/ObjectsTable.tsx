import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Object } from '@/types/object.types';
import { ObjectIcon } from './ObjectIcon';
import { Button } from '@/components/ui/Button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DeleteObjectModal } from './DeleteObjectModal';

interface ObjectsTableProps {
  objects: Object[];
}

export const ObjectsTable = ({ objects }: ObjectsTableProps) => {
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState<Object | null>(null);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'custom':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = useMemo<ColumnDef<Object>[]>(
    () => [
      {
        id: 'icon',
        header: '',
        cell: (info) => {
          const object = info.row.original;
          return (
            <ObjectIcon
              icon={object.icon}
              color={object.color}
              size={24}
            />
          );
        },
        size: 60,
      },
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
        accessorKey: 'category',
        header: 'Category',
        cell: (info) => {
          const category = info.getValue() as string;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getCategoryBadgeColor(
                category
              )}`}
            >
              {category}
            </span>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => {
          const description = info.getValue() as string | undefined;
          if (!description) return <span className="text-gray-400">—</span>;
          const truncated = description.length > 50
            ? description.substring(0, 50) + '...'
            : description;
          return <span className="text-sm text-gray-600">{truncated}</span>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const object = info.row.original;
          const isSystem = object.is_system_object;

          return (
            <div className="flex gap-2">
              {isSystem ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/objects/${object.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/objects/${object.id}/edit`)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedObject(object);
                      setDeleteModalOpen(true);
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
    data: objects,
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
    <>
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
              objects.length
            )}{' '}
            of {objects.length} objects
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

      {/* Delete Modal */}
      {selectedObject && (
        <DeleteObjectModal
          object={selectedObject}
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedObject(null);
          }}
        />
      )}
    </>
  );
};
