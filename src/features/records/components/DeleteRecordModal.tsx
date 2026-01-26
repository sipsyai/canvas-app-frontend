/**
 * DeleteRecordModal Component
 *
 * Confirmation modal for deleting a record.
 * Uses React Aria Modal and Dialog for accessibility.
 */

import { Modal, Dialog, Heading } from 'react-aria-components';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DeleteRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  recordName?: string;
}

export function DeleteRecordModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  recordName,
}: DeleteRecordModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable={!isDeleting}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog
        className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-md w-full mx-4 p-6 outline-none"
        aria-label="Delete record confirmation"
      >
        {({ close }) => (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <Heading
                slot="title"
                className="text-xl font-semibold text-slate-900 dark:text-white"
              >
                Delete Record
              </Heading>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete{' '}
              {recordName ? (
                <span className="font-medium text-slate-900 dark:text-white">
                  "{recordName}"
                </span>
              ) : (
                'this record'
              )}
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onPress={close}
                isDisabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onPress={onConfirm}
                isDisabled={isDeleting}
                loading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </Modal>
  );
}
