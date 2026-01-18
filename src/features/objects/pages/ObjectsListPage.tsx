import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ObjectsTable } from '../components/ObjectsTable';
import { useObjects } from '@/hooks/useObjects';
import { ObjectsTableSkeleton } from '../components/ObjectsTableSkeleton';
import { ObjectsTableEmpty } from '../components/ObjectsTableEmpty';
import { Plus } from 'lucide-react';

export const ObjectsListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: objects, isLoading, isError, error } = useObjects({
    category: categoryFilter || undefined,
  });

  // Client-side filtering for search
  const filteredObjects = objects?.filter((object) => {
    const matchesSearch =
      !search ||
      object.name.toLowerCase().includes(search.toLowerCase()) ||
      object.label.toLowerCase().includes(search.toLowerCase()) ||
      object.description?.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  }) ?? [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Objects</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Create Object
          </Button>
        </div>
        <ObjectsTableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {(error as any)?.message || 'Failed to load objects'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Objects</h1>
          <p className="text-gray-600 mt-1">
            Manage your data objects and their configurations
          </p>
        </div>
        <Button onClick={() => navigate('/objects/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Object
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="🔍 Search by name, label, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-4">
          <select
            value={categoryFilter ?? ''}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="standard">Standard</option>
            <option value="custom">Custom</option>
            <option value="system">System</option>
          </select>

          {/* Stats */}
          <div className="flex items-center gap-6 ml-auto text-sm text-gray-600">
            <div>
              Total: <span className="font-semibold">{objects?.length || 0}</span>
            </div>
            <div>
              Filtered: <span className="font-semibold">{filteredObjects.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredObjects.length === 0 ? (
        <ObjectsTableEmpty onCreateClick={() => navigate('/objects/create')} />
      ) : (
        <ObjectsTable objects={filteredObjects} />
      )}
    </div>
  );
};
