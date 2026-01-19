import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDynamicForm } from '../hooks/useDynamicForm';
import { useCreateRecord } from '../hooks/useCreateRecord';
import { DynamicFormField } from './DynamicFormField';
import { Button } from '@/components/ui/Button';
import type { DataRecord } from '@/types/record.types';

interface CreateRecordFormProps {
  objectId: string;
  onSuccess?: (record: DataRecord) => void;
  onCancel?: () => void;
}

export const CreateRecordForm = ({ objectId, onSuccess, onCancel }: CreateRecordFormProps) => {
  const {
    schema,
    defaultValues,
    fields,
    isLoading: isLoadingFields
  } = useDynamicForm(objectId);

  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { mutate: createRecord, isPending } = useCreateRecord();

  const onSubmit = (formData: any) => {
    const recordData = {
      object_id: objectId,
      data: formData,
    };

    createRecord(recordData, {
      onSuccess: (data) => {
        onSuccess?.(data);
      },
    });
  };

  if (isLoadingFields) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field) => (
          <DynamicFormField
            key={field.field_id}
            field={field}
            register={register}
            control={control}
            setValue={setValue}
            watch={watch}
            error={errors[field.field_id]?.message as string | undefined}
          />
        ))}
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Please fix the following errors:</p>
          <ul className="list-disc list-inside mt-2">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{(error as any)?.message || 'Invalid value'}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          loading={isPending}
        >
          Create Record
        </Button>
      </div>
    </form>
  );
};
