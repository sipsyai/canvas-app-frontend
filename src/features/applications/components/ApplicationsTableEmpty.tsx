import { Button } from '@/components/ui/Button';
import { Plus, AppWindow } from 'lucide-react';

interface ApplicationsTableEmptyProps {
  onCreateClick: () => void;
}

export const ApplicationsTableEmpty = ({ onCreateClick }: ApplicationsTableEmptyProps) => {
  return (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <AppWindow className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Get started by creating your first application. Applications allow you to organize objects and build
        custom no-code solutions.
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="w-4 h-4 mr-2" />
        Create Application
      </Button>
    </div>
  );
};
