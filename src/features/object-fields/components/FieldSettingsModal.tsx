import { useState, useEffect, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { useUpdateObjectField } from '../hooks/useObjectFields';
import type { ObjectField } from '@/types/object-field.types';

interface FieldSettingsModalProps {
  objectField: ObjectField;
  isOpen: boolean;
  onClose: () => void;
}

export function FieldSettingsModal({ objectField, isOpen, onClose }: FieldSettingsModalProps) {
  const { mutate: updateObjectField, isPending } = useUpdateObjectField();

  const [formData, setFormData] = useState({
    is_required: objectField.is_required,
    is_visible: objectField.is_visible,
    is_readonly: objectField.is_readonly,
  });

  // Reset form when objectField changes
  useEffect(() => {
    setFormData({
      is_required: objectField.is_required,
      is_visible: objectField.is_visible,
      is_readonly: objectField.is_readonly,
    });
  }, [objectField]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    updateObjectField(
      {
        id: objectField.id,
        data: formData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-surface-dark p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Field Settings</h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-slate-700"
            disabled={isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field Info */}
          <div className="rounded-lg bg-gray-50 dark:bg-surface-dark-alt p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400">Field ID</div>
            <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
              {objectField.field_id}
            </div>
          </div>

          {/* Is Required */}
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Required</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                This field must have a value
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.is_required}
              onChange={(e) =>
                setFormData({ ...formData, is_required: e.target.checked })
              }
              className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          {/* Is Visible */}
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Visible</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                Show this field in forms and views
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.is_visible}
              onChange={(e) =>
                setFormData({ ...formData, is_visible: e.target.checked })
              }
              className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          {/* Is Read Only */}
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Read Only</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                Prevent editing this field
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.is_readonly}
              onChange={(e) =>
                setFormData({ ...formData, is_readonly: e.target.checked })
              }
              className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
