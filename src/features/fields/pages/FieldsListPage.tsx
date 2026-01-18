import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FieldsTable } from '../components/FieldsTable';
import { useFields } from '../hooks/useFields';
import { FieldsTableSkeleton } from '../components/FieldsTableSkeleton';
import { FieldsTableEmpty } from '../components/FieldsTableEmpty';
import { Plus } from 'lucide-react';

export const FieldsListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [systemOnlyFilter, setSystemOnlyFilter] = useState(false);

  const { data: fields, isLoading, isError, error } = useFields({
    category: categoryFilter,
    is_system_field: systemOnlyFilter || undefined,
  });

  // Client-side filtering for search and type
  const filteredFields = fields?.filter((field) => {
    const matchesSearch =
      !search ||
      field.name.toLowerCase().includes(search.toLowerCase()) ||
      field.label.toLowerCase().includes(search.toLowerCase());

    const matchesType = !typeFilter || field.type === typeFilter;

    return matchesSearch && matchesType;
  }) ?? [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Fields Library</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Create Field
          </Button>
        </div>
        <FieldsTableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {(error as any)?.message || 'Failed to load fields'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fields Library</h1>
        <Button onClick={() => navigate('/fields/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Field
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="🔍 Search by name or label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Dropdowns and Checkbox */}
        <div className="flex gap-4">
          <select
            value={categoryFilter ?? ''}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="System">System</option>
            <option value="Contact Info">Contact Info</option>
            <option value="Business">Business</option>
            <option value="Address">Address</option>
          </select>

          <select
            value={typeFilter ?? ''}
            onChange={(e) => setTypeFilter(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="datetime">DateTime</option>
            <option value="textarea">Textarea</option>
            <option value="select">Select</option>
            <option value="multiselect">Multi-Select</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="url">URL</option>
          </select>

          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
            <input
              type="checkbox"
              checked={systemOnlyFilter}
              onChange={(e) => setSystemOnlyFilter(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">System Fields Only</span>
          </label>
        </div>
      </div>

      {/* Table */}
      {filteredFields.length === 0 ? (
        <FieldsTableEmpty onCreateClick={() => navigate('/fields/create')} />
      ) : (
        <FieldsTable fields={filteredFields} />
      )}
    </div>
  );
};
