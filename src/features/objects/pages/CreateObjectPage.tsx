import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateObject } from '@/hooks/useObjects';
import { ObjectCreateRequest } from '@/types/object.types';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';

export const CreateObjectPage = () => {
  const navigate = useNavigate();
  const createObject = useCreateObject();

  const [formData, setFormData] = useState<ObjectCreateRequest>({
    name: '',
    label: '',
    plural_name: '',
    description: '',
    icon: '👤',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-z_][a-z0-9_]*$/i.test(formData.name)) {
      newErrors.name = 'Name must start with a letter and contain only letters, numbers, and underscores';
    }

    // Label validation
    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    // Plural name validation
    if (!formData.plural_name.trim()) {
      newErrors.plural_name = 'Plural name is required';
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
      await createObject.mutateAsync(formData);
      navigate('/objects');
    } catch (error) {
      console.error('Failed to create object:', error);
      setErrors({
        submit: (error as any)?.response?.data?.detail || 'Failed to create object',
      });
    }
  };

  const handleInputChange = (
    field: keyof ObjectCreateRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
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
          onClick={() => navigate('/objects')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Objects
        </Button>
        <h1 className="text-3xl font-bold">Create Object</h1>
        <p className="text-gray-600 mt-1">
          Define a new data object for your application
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., contact, account, product"
            className={`w-full px-4 py-2 font-mono border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            API name (snake_case recommended)
          </p>
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
            placeholder="e.g., Contact, Account, Product"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.label ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.label && (
            <p className="mt-1 text-sm text-red-600">{errors.label}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Display name shown in the UI
          </p>
        </div>

        {/* Plural Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plural Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.plural_name}
            onChange={(e) => handleInputChange('plural_name', e.target.value)}
            placeholder="e.g., Contacts, Accounts, Products"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.plural_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.plural_name && (
            <p className="mt-1 text-sm text-red-600">{errors.plural_name}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Plural form displayed in lists
          </p>
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icon (Emoji)
          </label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => handleInputChange('icon', e.target.value)}
            placeholder="e.g., 👤, 🏢, 📦"
            maxLength={2}
            className="w-full px-4 py-2 text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter an emoji to represent this object
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the purpose of this object..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">Optional description</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/objects')}
            disabled={createObject.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createObject.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {createObject.isPending ? (
              'Creating...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Object
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
