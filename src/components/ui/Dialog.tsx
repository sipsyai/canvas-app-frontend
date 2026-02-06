import { type ReactNode } from 'react';
import {
  Dialog as AriaDialog,
  Modal,
  ModalOverlay,
  Heading,
} from 'react-aria-components';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const dialogVariants = cva(
  'relative bg-white dark:bg-surface-dark rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col',
  {
    variants: {
      size: {
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface DialogProps extends VariantProps<typeof dialogVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size,
  className,
}: DialogProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
      className={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
        'flex items-center justify-center p-4',
        'data-[entering]:animate-in data-[entering]:fade-in',
        'data-[exiting]:animate-out data-[exiting]:fade-out'
      )}
    >
      <Modal
        className={cn(
          'data-[entering]:animate-in data-[entering]:zoom-in-95',
          'data-[exiting]:animate-out data-[exiting]:zoom-out-95'
        )}
      >
        <AriaDialog className={cn(dialogVariants({ size }), className)}>
          {({ close }) => (
            <>
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <Heading
                    slot="title"
                    className="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    {title}
                  </Heading>
                  <button
                    onClick={() => close()}
                    className={cn(
                      'rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700',
                      'transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                    )}
                    aria-label="Close dialog"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {children}
              </div>

              {/* Actions */}
              {actions && (
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-surface-dark-alt">
                  {actions}
                </div>
              )}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
