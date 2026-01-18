import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useObject, useUpdateObject } from '@/hooks/useObjects';
import { ObjectUpdateRequest, ObjectCategory } from '@/types/object.types';
import { Button } from '@/components/ui/Button';
import { IconPicker } from '../components/IconPicker';
import { ColorPicker } from '../components/ColorPicker';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const EditObjectPage = () => {
  const navigate = useNavigate();
  const { objectId } = useParams<{ objectId: string }>();
  const { data: object, isLoading, isError, error } = useObject(objectId!);
  const updateObject = useUpdateObject();

  const [formData, setFormData] = useState<ObjectUpdateRequest>({
    label: '',
    category: 'custom',
    description: '',
    icon: 'Box',
    color: '#6366f1',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when object is loaded
  useEffect(() => {
    if (object) {
      setFormData({
        label: object.label,
        category: object.category,
        description: object.description || '',
        icon: object.icon || 'Box',
        color: object.color || '#6366f1',
      });
    }
  }, [object]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Label validation
    if (!formData.label?.trim()) {
      newErrors.label = 'Label is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateObject.mutateAsync({
        objectId: objectId!,
        data: formData,
      });
      navigate('/objects');
    } catch (error) {
      console.error('Failed to update object:', error);
      setErrors({
        submit: (error as any)?.response?.data?.detail || 'Failed to update object',
      });
    }
  };

  const handleInputChange = (
    field: keyof ObjectUpdateRequest,
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

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !object) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/objects')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Objects
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {(error as any)?.message || 'Failed to load object'}
        </div>
      </div>
    );
  }

  // System object warning
  if (object.is_system_object) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/objects')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Objects
        </Button>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                System Object Cannot Be Edited
              </h3>
              <p className="text-yellow-700 mb-4">
                This is a system object and cannot be modified. System objects are
                protected to ensure application stability.
              </p>
              <div className="bg-white border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Object: {object.label}</p>
                <p className="text-sm font-mono text-gray-600">{object.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold">Edit Object</h1>
        <p className="text-gray-600 mt-1">
          Update object configuration
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

        {/* Name (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name (Read-only)
          </label>
          <input
            type="text"
            value={object.name}
            disabled
            className="w-full px-4 py-2 font-mono border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            Object name cannot be changed after creation
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

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              handleInputChange('category', e.target.value as ObjectCategory)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="standard">Standard</option>
            <option value="custom">Custom</option>
            <option value="system">System</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Organization category for this object
          </p>
        </div>

        {/* Icon and Color */}
        <div className="grid grid-cols-2 gap-4">
          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <IconPicker
              value={formData.icon}
              onChange={(icon) => handleInputChange('icon', icon)}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <ColorPicker
              value={formData.color}
              onChange={(color) => handleInputChange('color', color)}
            />
          </div>
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
            disabled={updateObject.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateObject.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updateObject.isPending ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
