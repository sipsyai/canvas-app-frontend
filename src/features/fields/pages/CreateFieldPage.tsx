import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateField } from '../hooks/useFields';
import type { FieldCreateRequest, FieldType } from '@/types/field.types';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi-select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'url', label: 'URL' },
];

const CATEGORIES = [
  { value: '', label: 'No category' },
  { value: 'Contact Info', label: 'Contact Info' },
  { value: 'Business', label: 'Business' },
  { value: 'System', label: 'System' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'Address', label: 'Address' },
];

export const CreateFieldPage = () => {
  const navigate = useNavigate();
  const createField = useCreateField();

  const [formData, setFormData] = useState<FieldCreateRequest>({
    name: '',
    label: '',
    type: 'text',
    category: null,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-z_][a-z0-9_]*$/i.test(formData.name)) {
      newErrors.name = 'Name must start with a letter or underscore and contain only letters, numbers, and underscores';
    }

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createField.mutateAsync({
        ...formData,
        category: formData.category || null,
      });
      navigate('/fields');
    } catch (error) {
      console.error('Failed to create field:', error);
      setErrors({
        submit: (error as any)?.response?.data?.detail || 'Failed to create field',
      });
    }
  };

  const handleInputChange = (
    field: keyof FieldCreateRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/fields')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Fields
        </Button>
        <h1 className="text-3xl font-bold">Create Field</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Define a new reusable field for your data objects
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., first_name, email_address, phone"
            className={`w-full px-4 py-2 font-mono border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-surface-dark dark:text-white ${
              errors.name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            API name (snake_case recommended)
          </p>
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Label <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
            placeholder="e.g., First Name, Email Address, Phone Number"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-surface-dark dark:text-white ${
              errors.label ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
            }`}
          />
          {errors.label && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.label}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            Display name shown in the UI
          </p>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Field Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-surface-dark dark:text-white"
          >
            {FIELD_TYPES.map((ft) => (
              <option key={ft.value} value={ft.value}>{ft.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            Field type cannot be changed after creation
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Category
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-surface-dark dark:text-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            Organize fields into categories
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the purpose of this field..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-surface-dark dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Optional description</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/fields')}
            disabled={createField.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createField.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {createField.isPending ? (
              'Creating...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Field
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
