/**
 * RecordsTableToolbar Component
 *
 * Toolbar with search, filters, and actions
 */

import { Search, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RecordsTableToolbarProps {
  objectId?: string;
  totalRecords: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh?: () => void;
  onAddRecord?: () => void;
}

export const RecordsTableToolbar = ({
  totalRecords,
  searchQuery,
  onSearchChange,
  onRefresh,
  onAddRecord,
}: RecordsTableToolbarProps) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-white border border-gray-200 rounded-lg">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {totalRecords} {totalRecords === 1 ? 'record' : 'records'}
        </span>

        {onRefresh && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        )}

        {onAddRecord && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAddRecord}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        )}
      </div>
    </div>
  );
};
