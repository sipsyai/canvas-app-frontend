import { useState } from 'react';
import { Object } from '@/types/object.types';
import { useDeleteObject } from '@/hooks/useObjects';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteObjectModalProps {
  object: Object;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteObjectModal = ({
  object,
  isOpen,
  onClose,
}: DeleteObjectModalProps) => {
  const [confirmText, setConfirmText] = useState('');
  const deleteObject = useDeleteObject();

  const handleDelete = async () => {
    try {
      await deleteObject.mutateAsync(object.id);
      onClose();
      // Optionally navigate away or show success toast
    } catch (error) {
      console.error('Failed to delete object:', error);
      // Show error toast
    }
  };

  if (!isOpen) return null;

  const isConfirmValid = confirmText === object.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-surface-dark rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Object</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-900">
                  CASCADE DELETE WARNING
                </p>
                <p className="text-sm text-red-700">
                  Deleting this object will permanently delete:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-2">
                  <li>All records associated with this object</li>
                  <li>All field definitions for this object</li>
                  <li>All relationships involving this object</li>
                </ul>
                <p className="text-sm font-semibold text-red-900 mt-3">
                  This action cannot be undone!
                </p>
              </div>
            </div>
          </div>

          {/* Object Info */}
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-surface-dark-alt">
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">You are about to delete:</p>
            <div className="space-y-1">
              <p className="font-medium text-gray-900 dark:text-white">{object.label}</p>
              <p className="font-mono text-sm text-gray-600 dark:text-slate-400">{object.name}</p>
              {object.description && (
                <p className="text-sm text-gray-500 dark:text-slate-400">{object.description}</p>
              )}
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Type <span className="font-mono font-bold">{object.name}</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono bg-white dark:bg-surface-dark dark:text-white"
              placeholder={object.name}
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-surface-dark-alt">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={deleteObject.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={!isConfirmValid || deleteObject.isPending}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {deleteObject.isPending ? 'Deleting...' : 'Delete Object'}
          </Button>
        </div>
      </div>
    </div>
  );
};
