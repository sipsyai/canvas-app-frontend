/**
 * DynamicFormField Component
 *
 * Renders dynamic form fields with React Aria components and React Hook Form integration
 * - Uses Controller for proper integration with React Aria components
 * - Automatic label association via React Aria
 * - Proper ARIA attributes for all field types
 * - Error message linking
 */

import { Controller, Control, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Datepicker } from '@/components/ui/Datepicker';
import type { ObjectFieldWithDetails } from '@/types/object-field.types';

interface DynamicFormFieldProps {
  field: ObjectFieldWithDetails;
  control: Control<any>;
  watch: UseFormWatch<any>;
  error?: string;
}

export const DynamicFormField = ({
  field,
  control,
  error
}: DynamicFormFieldProps) => {
  if (!field.field) return null;

  const fieldId = field.field_id;
  const fieldType = field.field.type;
  const label = field.field.label;
  const isRequired = field.is_required;
  const isReadonly = field.is_readonly;
  const options = field.field_overrides?.options || [];

  if (['text', 'email', 'phone', 'url'].includes(fieldType)) {
    return (
      <Controller
        name={fieldId}
        control={control}
        render={({ field: controllerField }) => (
          <Input
            label={label}
            type={fieldType === 'phone' ? 'tel' : fieldType}
            placeholder={field.field_overrides?.placeholder || `Enter ${label.toLowerCase()}...`}
            value={controllerField.value || ''}
            onChange={controllerField.onChange}
            isRequired={isRequired}
            isDisabled={isReadonly}
            error={error}
          />
        )}
      />
    );
  }

  if (fieldType === 'number' || fieldType === 'currency' || fieldType === 'percentage') {
    return (
      <Controller
        name={fieldId}
        control={control}
        render={({ field: controllerField }) => (
          <Input
            label={label}
            type="number"
            value={controllerField.value || ''}
            onChange={(value) => controllerField.onChange(Number(value))}
            isRequired={isRequired}
            isDisabled={isReadonly}
            error={error}
          />
        )}
      />
    );
  }

  if (fieldType === 'textarea') {
    return (
      <Controller
        name={fieldId}
        control={control}
        render={({ field: controllerField }) => (
          <Textarea
            label={label}
            rows={4}
            placeholder={field.field_overrides?.placeholder || `Enter ${label.toLowerCase()}...`}
            value={controllerField.value || ''}
            onChange={controllerField.onChange}
            isRequired={isRequired}
            isDisabled={isReadonly}
            error={error}
          />
        )}
      />
    );
  }

  if (fieldType === 'date' || fieldType === 'datetime') {
    return (
      <Controller
        name={fieldId}
        control={control}
        render={({ field: controllerField }) => (
          <Datepicker
            label={label}
            value={controllerField.value}
            onChange={controllerField.onChange}
            isRequired={isRequired}
            isDisabled={isReadonly}
            error={error}
          />
        )}
      />
    );
  }

  if (fieldType === 'checkbox') {
    return (
      <Controller
        name={fieldId}
        control={control}
        render={({ field: controllerField }) => (
          <Checkbox
            label={label}
            isSelected={controllerField.value || false}
            onChange={controllerField.onChange}
            isDisabled={isReadonly}
          />
        )}
      />
    );
  }

  if (fieldType === 'select') {
    return (
      <Controller
        name={fieldId}
        control={control}
        render={({ field: controllerField }) => (
          <Select
            label={label}
            options={options}
            value={controllerField.value}
            onChange={controllerField.onChange}
            disabled={isReadonly}
            error={error}
          />
        )}
      />
    );
  }

  if (fieldType === 'multiselect') {
    return (
      <Controller
        name={fieldId}
        control={control}
        render={({ field: controllerField }) => (
          <MultiSelect
            label={label}
            options={options}
            value={controllerField.value || []}
            onChange={controllerField.onChange}
            isRequired={isRequired}
            disabled={isReadonly}
            error={error}
          />
        )}
      />
    );
  }

  if (fieldType === 'radio') {
    return (
      <Controller
        name={fieldId}
        control={control}
        render={({ field: controllerField }) => (
          <RadioGroup
            label={label}
            options={options}
            value={controllerField.value}
            onChange={controllerField.onChange}
            isRequired={isRequired}
            disabled={isReadonly}
            error={error}
          />
        )}
      />
    );
  }

  return (
    <div>
      <div className="text-sm text-gray-500 dark:text-slate-400">
        Field type "{fieldType}" not supported
      </div>
    </div>
  );
};
