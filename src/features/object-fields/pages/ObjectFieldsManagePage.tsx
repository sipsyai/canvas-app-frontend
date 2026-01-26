import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ArrowLeft, Loader2, Link as LinkIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { useNavigationStore } from '@/stores/navigationStore';
import { useObjectFields, useCreateObjectField } from '../hooks/useObjectFields';
import { useFields } from '@/features/fields/hooks/useFields';
import { useObject } from '@/features/objects/hooks/useObjects';
import { AvailableFieldsList } from '../components/AvailableFieldsList';
import { AttachedFieldsList } from '../components/AttachedFieldsList';
import type { Field } from '@/types/field.types';

const builderSteps = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'fields', label: 'Fields' },
  { id: 'views', label: 'Views' },
];

export function ObjectFieldsManagePage() {
  const { objectId } = useParams<{ objectId: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigationStore();
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [fieldSearch, setFieldSearch] = useState('');

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

  useEffect(() => {
    if (object) {
      setBreadcrumbs([
        { label: 'Objects', href: '/objects' },
        { label: object.label, href: `/objects/${objectId}/edit` },
        { label: 'Fields' },
      ]);
    }
  }, [object, objectId, setBreadcrumbs]);

  // Filter out already attached fields
  const attachedFieldIds = new Set(attachedFields.map((of) => of.field_id));
  const availableFields = allFields.filter((field) => {
    const notAttached = !attachedFieldIds.has(field.id);
    const matchesSearch = !fieldSearch ||
      field.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
      field.name.toLowerCase().includes(fieldSearch.toLowerCase());
    return notAttached && matchesSearch;
  });

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const field = availableFields.find((f) => f.id === event.active.id);
    if (field) {
      setActiveField(field);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveField(null);

    if (!over || !objectId) return;

    const isAddingField = availableFields.some((f) => f.id === active.id);

    if (isAddingField && over.id === 'attached-fields-area') {
      const fieldId = active.id as string;
      createObjectField({
        object_id: objectId,
        field_id: fieldId,
        display_order: attachedFields.length,
        is_required: false,
        is_visible: true,
        is_readonly: false,
      });
    }
  };

  const isLoading = isLoadingObject || isLoadingFields || isLoadingAttached;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!object) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Object not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -m-6 md:-m-10">
      {/* Header / Stepper */}
      <header className="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 px-6 md:px-8 py-4 flex flex-col gap-4">
        {/* Stepper */}
        <Stepper
          steps={builderSteps}
          currentStep={1}
          onStepClick={(index) => {
            if (index === 0) navigate(`/objects/${objectId}/edit`);
          }}
        />

        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Configure Fields: {object.label}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Configure the data structure by dragging fields from the library.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(`/objects/${objectId}/edit`)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate(`/objects/${objectId}/relationships`)}>
              <LinkIcon className="h-4 w-4" />
              Relationships
            </Button>
          </div>
        </div>
      </header>

      {/* Builder Workspace */}
      <div className="flex-1 overflow-hidden p-6 bg-background-light dark:bg-background-dark">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-12 gap-6 h-full max-w-7xl mx-auto">
            {/* Left Panel: Field Library */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
              {/* Search */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={fieldSearch}
                  onChange={(e) => setFieldSearch(e.target.value)}
                  className="block w-full p-2.5 pl-10 text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Available Fields */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AvailableFieldsList
                  availableFields={availableFields}
                  isLoading={isLoadingFields}
                />
              </div>
            </div>

            {/* Right Panel: Builder Canvas */}
            <div className="col-span-12 lg:col-span-9 flex flex-col h-full overflow-hidden bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              {/* Canvas Toolbar */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface-dark">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Object Fields ({attachedFields.length})
                </p>
              </div>

              {/* Attached Fields */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <AttachedFieldsList
                  objectId={objectId!}
                  attachedFields={attachedFields}
                  isLoading={isLoadingAttached || isAttaching}
                />
              </div>
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeField ? (
              <div className="rounded-lg border border-primary bg-white dark:bg-surface-dark p-4 shadow-lg">
                <div className="font-medium text-slate-900 dark:text-white">{activeField.label}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{activeField.type}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
