import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { FieldTypeIcon } from '@/features/fields/components/FieldTypeIcon';
import type { Field } from '@/types/field.types';

interface AvailableFieldsListProps {
  availableFields: Field[];
  isLoading?: boolean;
}

export function AvailableFieldsList({ availableFields, isLoading }: AvailableFieldsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Available Fields</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (availableFields.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Available Fields</h2>
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">All fields have been added</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Available Fields</h2>
        <p className="text-sm text-gray-500">Drag to add to object</p>
      </div>

      <div className="space-y-2">
        {availableFields.map((field) => (
          <DraggableField key={field.id} field={field} />
        ))}
      </div>
    </div>
  );
}

function DraggableField({ field }: { field: Field }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: field.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3
        transition-all hover:border-blue-300 hover:shadow-md cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50' : ''}
      `}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
      <FieldTypeIcon type={field.type} className="h-5 w-5 text-gray-500" />
      <div className="flex-1">
        <div className="font-medium text-gray-900">{field.label}</div>
        <div className="text-xs text-gray-500">{field.type}</div>
      </div>
    </div>
  );
}
