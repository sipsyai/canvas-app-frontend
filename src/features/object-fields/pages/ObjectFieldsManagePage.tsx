import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { ArrowLeft, Loader2, Link } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useObjectFields, useCreateObjectField } from '../hooks/useObjectFields';
import { useFields } from '@/features/fields/hooks/useFields';
import { useObject } from '@/features/objects/hooks/useObjects';
import { AvailableFieldsList } from '../components/AvailableFieldsList';
import { AttachedFieldsList } from '../components/AttachedFieldsList';
import type { Field } from '@/types/field.types';

export function ObjectFieldsManagePage() {
  const { objectId } = useParams<{ objectId: string }>();
  const navigate = useNavigate();
  const [activeField, setActiveField] = useState<Field | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    })
  );

  // Fetch object details
  const { data: object, isLoading: isLoadingObject } = useObject(objectId!);

  // Fetch all fields
  const { data: allFields = [], isLoading: isLoadingFields } = useFields();

  // Fetch object's attached fields
  const { data: attachedFields = [], isLoading: isLoadingAttached } = useObjectFields(objectId!);

  // Mutation to attach field to object
  const { mutate: createObjectField, isPending: isAttaching } = useCreateObjectField();

  // Filter out already attached fields
  const attachedFieldIds = new Set(attachedFields.map((of) => of.field_id));
  const availableFields = allFields.filter((field) => !attachedFieldIds.has(field.id));

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const field = availableFields.find((f) => f.id === event.active.id);
    if (field) {
      setActiveField(field);
    }
  };

  // Handle drag end (field dropped onto object OR reordering)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveField(null);

    if (!over || !objectId) return;

    // Check if we're adding a new field (dropped from available fields)
    const isAddingField = availableFields.some((f) => f.id === active.id);

    if (isAddingField && over.id === 'attached-fields-area') {
      const fieldId = active.id as string;

      // Create object-field relationship
      createObjectField({
        object_id: objectId,
        field_id: fieldId,
        display_order: attachedFields.length, // Add to end
        is_required: false,
        is_visible: true,
        is_readonly: false,
      });
    }
    // Otherwise, we're reordering existing fields
    // This is handled by AttachedFieldsList's internal logic
  };

  const isLoading = isLoadingObject || isLoadingFields || isLoadingAttached;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!object) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Object not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/objects')}
              className="rounded p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Manage Fields - {object.label}
              </h1>
              <p className="text-sm text-gray-500">
                Drag fields from the right panel to add them to this object
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate(`/objects/${objectId}/relationships`)}
          >
            <Link className="h-4 w-4 mr-2" />
            Manage Relationships
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Attached Fields */}
          <div className="flex-1 overflow-auto p-6">
            <AttachedFieldsList
              objectId={objectId!}
              attachedFields={attachedFields}
              isLoading={isLoadingAttached || isAttaching}
            />
          </div>

          {/* Right: Available Fields */}
          <div className="w-96 border-l border-gray-200 bg-white overflow-auto p-6">
            <AvailableFieldsList
              availableFields={availableFields}
              isLoading={isLoadingFields}
            />
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeField ? (
            <div className="rounded-lg border border-blue-300 bg-white p-4 shadow-lg">
              <div className="font-medium text-gray-900">{activeField.label}</div>
              <div className="text-sm text-gray-500">{activeField.type}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
