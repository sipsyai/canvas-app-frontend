/**
 * EditRecordModal Component
 *
 * Modal for editing an existing record.
 * Pre-populates form with existing record data.
 */

import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Dialog, Heading } from 'react-aria-components';
import { X } from 'lucide-react';
import { useDynamicForm } from '../hooks/useDynamicForm';
import { useUpdateRecord } from '../hooks/useUpdateRecord';
import { DynamicFormField } from './DynamicFormField';
import { Button } from '@/components/ui/Button';
import type { DataRecord } from '@/types/record.types';

interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (record: DataRecord) => void;
  objectId: string;
  record: DataRecord | null;
}

export function EditRecordModal({
  isOpen,
  onClose,
  onSuccess,
  objectId,
  record,
}: EditRecordModalProps) {
  const {
    schema,
    fields,
    isLoading: isLoadingFields,
  } = useDynamicForm(objectId);

  const { mutate: updateRecord, isPending } = useUpdateRecord({ objectId });

  // Build default values from record data
  const getDefaultValues = useCallback(() => {
    if (!record || !fields.length) return {};

    const values: Record<string, any> = {};
    fields.forEach((field) => {
      values[field.field_id] = record.data[field.field_id] ?? '';
    });
    return values;
  }, [record, fields]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when record changes
  useEffect(() => {
    if (record && fields.length) {
      const values = getDefaultValues();
      reset(values);
    }
  }, [record, fields, reset, getDefaultValues]);

  const onSubmit = (formData: Record<string, any>) => {
    if (!record) return;

    updateRecord(
      {
        recordId: record.id,
        data: { data: formData },
      },
      {
        onSuccess: (updatedRecord) => {
          onSuccess?.(updatedRecord);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      isDismissable={!isPending}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog
        className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto outline-none"
        aria-label="Edit record"
      >
        {({ close }) => (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Heading
                slot="title"
                className="text-2xl font-bold text-slate-900 dark:text-white"
              >
                Edit Record
              </Heading>
              <Button
                variant="ghost"
                size="sm"
                onPress={close}
                isDisabled={isPending}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {isLoadingFields ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {fields.map((field) => (
                    <DynamicFormField
                      key={field.field_id}
                      field={field}
                      control={control}
                      watch={watch}
                      error={errors[field.field_id]?.message as string | undefined}
                    />
                  ))}
                </div>

                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                    <p className="font-semibold">Please fix the following errors:</p>
                    <ul className="list-disc list-inside mt-2">
                      {Object.entries(errors).map(([key, error]) => (
                        <li key={key}>{(error as any)?.message || 'Invalid value'}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="secondary"
                    onPress={close}
                    isDisabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isDisabled={isPending}
                    loading={isPending}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Dialog>
    </Modal>
  );
}
