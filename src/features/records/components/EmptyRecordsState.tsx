/**
 * EmptyRecordsState Component
 *
 * Displayed when there are no records for an object
 */

import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyRecordsStateProps {
  objectId?: string;
  objectLabel?: string;
  onAddRecord?: () => void;
}

export const EmptyRecordsState = ({
  objectLabel = 'object',
  onAddRecord,
}: EmptyRecordsStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Records Yet
        </h3>

        <p className="text-gray-600 mb-6">
          Create your first record to get started with your {objectLabel}.
        </p>

        {onAddRecord && (
          <Button
            variant="primary"
            onClick={onAddRecord}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First Record
          </Button>
        )}
      </div>
    </div>
  );
};
