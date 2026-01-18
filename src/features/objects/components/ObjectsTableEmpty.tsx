import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

interface ObjectsTableEmptyProps {
  onCreateClick: () => void;
}

export const ObjectsTableEmpty = ({ onCreateClick }: ObjectsTableEmptyProps) => {
  return (
    <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-gray-400 mb-4">
        <svg
          className="mx-auto h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No objects found</h3>
      <p className="text-gray-500 mb-6">
        Get started by creating your first object.
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="w-4 h-4 mr-2" />
        Create Object
      </Button>
    </div>
  );
};
