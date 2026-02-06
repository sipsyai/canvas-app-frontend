/**
 * useDynamicColumns Hook
 *
 * Generate table columns dynamically from object fields
 */

import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { FieldRenderer } from '../components/FieldRenderer';
import type { DataRecord } from '@/types/record.types';
import type { ObjectFieldWithDetails } from '@/types/object-field.types';

const columnHelper = createColumnHelper<DataRecord>();

interface UseDynamicColumnsProps {
  fields: ObjectFieldWithDetails[];
  onEdit?: (record: DataRecord) => void;
  onDelete?: (record: DataRecord) => void;
  onViewDetails?: (record: DataRecord) => void;
}

export const useDynamicColumns = ({ fields, onEdit, onDelete, onViewDetails }: UseDynamicColumnsProps) => {
  return useMemo(() => {
    // Guard: return empty columns if fields is not available
    if (!fields || !Array.isArray(fields)) {
      return [];
    }

    // Filter visible fields and sort by display_order
    const visibleFields = fields
      .filter((objectField) => objectField.is_visible && objectField.field)
      .sort((a, b) => a.display_order - b.display_order);

    // Generate columns from fields
    const fieldColumns = visibleFields.map((objectField) => {
      const field = objectField.field!;

      return columnHelper.accessor(
        (row) => row.data[field.id], // Access field value from record.data
        {
          id: field.id,
          header: field.label,
          cell: (info) => (
            <FieldRenderer
              type={field.type}
              value={info.getValue()}
              field={{
                id: field.id,
                name: field.label,
                type: field.type,
                is_primary_field: field.is_system_field, // Temporary mapping
                config: objectField.field_overrides,
              }}
            />
          ),
          enableSorting: true,
        }
      );
    });

    // Add Actions column
    const actionsColumn = columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(row.original);
              }}
              className="p-1 text-gray-600 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded transition-colors"
              title="View details and relationships"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.original);
              }}
              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Edit record"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.original);
              }}
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete record"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
      size: 120,
    });

    return [...fieldColumns, actionsColumn];
  }, [fields, onEdit, onDelete, onViewDetails]);
};
