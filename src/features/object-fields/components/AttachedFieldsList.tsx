import { useDroppable, DragEndEvent, DndContext } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { Trash2, EyeOff, Lock, GripVertical, Settings } from 'lucide-react';
import { useState } from 'react';
import { useDeleteObjectField, useBulkUpdateFieldOrder } from '../hooks/useObjectFields';
import { FieldSettingsModal } from './FieldSettingsModal';
import type { ObjectFieldWithDetails } from '@/types/object-field.types';

interface AttachedFieldsListProps {
  objectId: string;
  attachedFields: ObjectFieldWithDetails[];
  isLoading?: boolean;
}

export function AttachedFieldsList({
  objectId,
  attachedFields,
  isLoading,
}: AttachedFieldsListProps) {
  const { setNodeRef } = useDroppable({
    id: 'attached-fields-area',
  });

  const { mutate: deleteObjectField } = useDeleteObjectField();
  const { mutate: bulkUpdateOrder } = useBulkUpdateFieldOrder();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<ObjectFieldWithDetails | null>(null);

  const handleRemoveField = (objectFieldId: string) => {
    setDeletingId(objectFieldId);
    deleteObjectField(objectFieldId, {
      onSettled: () => setDeletingId(null),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = attachedFields.findIndex((f) => f.id === active.id);
      const newIndex = attachedFields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder the array
        const reordered = [...attachedFields];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        // Create updates with new display_order
        const updates = reordered.map((field, index) => ({
          id: field.id,
          display_order: index,
          object_id: objectId,
        }));

        bulkUpdateOrder(updates);
      }
    }
  };

  if (isLoading) {
    return (
      <div ref={setNodeRef} className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Object Fields</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (attachedFields.length === 0) {
    return (
      <div ref={setNodeRef} className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Object Fields</h2>
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-sm text-gray-500">
            Drag fields from the right panel to add them to this object
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Object Fields ({attachedFields.length})
        </h2>
        <p className="text-sm text-gray-500">Drag to reorder fields</p>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext
          items={attachedFields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {attachedFields.map((objectField) => (
              <SortableFieldCard
                key={objectField.id}
                objectField={objectField}
                onRemove={handleRemoveField}
                onSettings={(field) => {
                  setSelectedField(field);
                  setSettingsModalOpen(true);
                }}
                isDeleting={deletingId === objectField.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Settings Modal */}
      {selectedField && (
        <FieldSettingsModal
          objectField={selectedField}
          isOpen={settingsModalOpen}
          onClose={() => {
            setSettingsModalOpen(false);
            setSelectedField(null);
          }}
        />
      )}
    </div>
  );
}

interface SortableFieldCardProps {
  objectField: ObjectFieldWithDetails;
  onRemove: (id: string) => void;
  onSettings: (field: ObjectFieldWithDetails) => void;
  isDeleting: boolean;
}

function SortableFieldCard({ objectField, onRemove, onSettings, isDeleting }: SortableFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: objectField.id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm
        transition-shadow hover:shadow-md
        ${isDragging ? 'opacity-50 z-50' : ''}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
      </div>

      {/* Field Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium text-gray-900">
            {objectField.field?.label || objectField.field?.name || `Field #${objectField.display_order}`}
          </div>
          <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {objectField.field?.type || 'unknown'}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm">
          {objectField.is_required && (
            <span className="inline-flex items-center rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
              Required
            </span>
          )}
          {!objectField.is_visible && (
            <span className="inline-flex items-center gap-1 text-gray-500">
              <EyeOff className="h-3 w-3" />
              <span className="text-xs">Hidden</span>
            </span>
          )}
          {objectField.is_readonly && (
            <span className="inline-flex items-center gap-1 text-gray-500">
              <Lock className="h-3 w-3" />
              <span className="text-xs">Read-only</span>
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
        <button
          onClick={() => onSettings(objectField)}
          className="rounded p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
          title="Field settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          onClick={() => onRemove(objectField.id)}
          disabled={isDeleting}
          className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          title="Remove field from object"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
