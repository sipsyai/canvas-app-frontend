import { Control, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
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
  register: UseFormRegister<any>;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  error?: string;
}

export const DynamicFormField = ({
  field,
  register,
  setValue,
  watch,
  error
}: DynamicFormFieldProps) => {
  if (!field.field) return null;

  const fieldId = field.field_id;
  const fieldType = field.field.type;
  const label = field.field.label;
  const isRequired = field.is_required;
  const isReadonly = field.is_readonly;
  const validation = field.field_overrides?.validation || {};
  const options = field.field_overrides?.options || [];

  const fieldLabel = (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  if (['text', 'email', 'phone', 'url'].includes(fieldType)) {
    return (
      <div>
        {fieldLabel}
        <Input
          type={fieldType === 'phone' ? 'tel' : fieldType}
          placeholder={field.field_overrides?.placeholder || `Enter ${label.toLowerCase()}...`}
          {...register(fieldId)}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  if (fieldType === 'number' || fieldType === 'currency' || fieldType === 'percentage') {
    return (
      <div>
        {fieldLabel}
        <Input
          type="number"
          step={validation.precision || 1}
          min={validation.min}
          max={validation.max}
          {...register(fieldId, { valueAsNumber: true })}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  if (fieldType === 'textarea') {
    return (
      <div>
        {fieldLabel}
        <Textarea
          rows={4}
          placeholder={field.field_overrides?.placeholder || `Enter ${label.toLowerCase()}...`}
          {...register(fieldId)}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  if (fieldType === 'date' || fieldType === 'datetime') {
    return (
      <div>
        {fieldLabel}
        <Datepicker
          value={watch(fieldId)}
          onChange={(date: any) => setValue(fieldId, date)}
          disabled={isReadonly}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (fieldType === 'checkbox') {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          {...register(fieldId)}
          disabled={isReadonly}
        />
        <label className="text-sm text-gray-700">{label}</label>
        {error && <span className="text-red-600 text-sm ml-2">{error}</span>}
      </div>
    );
  }

  if (fieldType === 'select') {
    return (
      <div>
        {fieldLabel}
        <Select
          options={options}
          value={watch(fieldId)}
          onChange={(value) => setValue(fieldId, value)}
          disabled={isReadonly}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (fieldType === 'multiselect') {
    return (
      <div>
        {fieldLabel}
        <MultiSelect
          options={options}
          value={watch(fieldId) || []}
          onChange={(values) => setValue(fieldId, values)}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  if (fieldType === 'radio') {
    return (
      <div>
        {fieldLabel}
        <RadioGroup
          options={options}
          value={watch(fieldId)}
          onChange={(value) => setValue(fieldId, value)}
          disabled={isReadonly}
          error={error}
        />
      </div>
    );
  }

  return (
    <div>
      {fieldLabel}
      <div className="text-sm text-gray-500">
        Field type "{fieldType}" not supported
      </div>
    </div>
  );
};
