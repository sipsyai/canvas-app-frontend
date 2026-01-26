/**
 * RecordsTablePage Component
 *
 * Main page for displaying records table with Stitch design
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Plus, Download, Users, Search, Filter, SortAsc, Columns } from 'lucide-react';
import { RecordsTable } from '../components/RecordsTable';
import { RecordsTableSkeleton } from '../components/RecordsTableSkeleton';
import { EmptyRecordsState } from '../components/EmptyRecordsState';
import { CreateRecordForm } from '../components/CreateRecordForm';
import { useRecords } from '../hooks/useRecords';
import { useObjectFields } from '../hooks/useObjectFields';
import { useTableState } from '../hooks/useTableState';
import { useObject } from '@/features/objects/hooks/useObjects';
import { useNavigationStore } from '@/stores/navigationStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { DataRecord } from '@/types/record.types';

export const RecordsTablePage = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setBreadcrumbs } = useNavigationStore();

  if (!objectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">Error: Object ID is missing</p>
        </div>
      </div>
    );
  }

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tableState = useTableState({
    pageSize: 50,
    sortBy: '',
    sortOrder: 'desc',
  });

  // Fetch object details
  const { data: object } = useObject(objectId);

  // Fetch object fields (for dynamic columns)
  const {
    data: fields,
    isLoading: fieldsLoading,
    error: fieldsError,
  } = useObjectFields(objectId);

  // Fetch records
  const {
    data: recordsData,
    isLoading: recordsLoading,
    error: recordsError,
  } = useRecords({
    objectId,
    page: tableState.page,
    pageSize: tableState.pageSize,
  });

  // Update breadcrumbs
  useEffect(() => {
    if (object) {
      setBreadcrumbs([
        { label: 'Objects', href: '/objects' },
        { label: object.label },
      ]);
    }
  }, [object, setBreadcrumbs]);

  // Sorting state for TanStack Table (start with no sorting)
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
    if (newSorting.length > 0) {
      tableState.setSortBy(newSorting[0].id);
      tableState.setSortOrder(newSorting[0].desc ? 'desc' : 'asc');
    }
    setSorting(newSorting);
  };

  const handleRowClick = (record: DataRecord) => {
    navigate(`/objects/${objectId}/records/${record.id}`);
  };

  const handleEdit = (record: DataRecord) => {
    navigate(`/objects/${objectId}/records/${record.id}/edit`);
  };

  const handleDelete = (record: DataRecord) => {
    console.log('Delete record:', record.id);
  };

  const handleAddRecord = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    queryClient.invalidateQueries({ queryKey: ['records', objectId] });
  };

  const handleViewDetails = (record: DataRecord) => {
    navigate(`/objects/${objectId}/records/${record.id}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['records', objectId] });
    queryClient.invalidateQueries({ queryKey: ['object-fields', objectId] });
  };

  // Loading state
  if (fieldsLoading || recordsLoading) {
    return <RecordsTableSkeleton />;
  }

  // Error state
  if (fieldsError || recordsError) {
    const error = fieldsError || recordsError;
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">
            Error loading records: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  const objectLabel = object?.label || objectId;

  // Empty state
  if (!recordsData || recordsData.records.length === 0) {
    return (
      <>
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Page Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {objectLabel}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Manage and track your {objectLabel.toLowerCase()} records.
                </p>
              </div>
            </div>
            <Button onClick={handleAddRecord}>
              <Plus className="h-5 w-5" />
              Add Record
            </Button>
          </div>

          <EmptyRecordsState
            objectId={objectId}
            objectLabel={objectLabel}
            onAddRecord={handleAddRecord}
          />
        </div>

        {/* Create Record Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                Create New Record
              </h2>
              <CreateRecordForm
                objectId={objectId}
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  const totalPages = Math.ceil(recordsData.total / tableState.pageSize);
  const startRecord = (tableState.page - 1) * tableState.pageSize + 1;
  const endRecord = Math.min(tableState.page * tableState.pageSize, recordsData.total);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {objectLabel}
              </h1>
              <Badge variant="blue">{recordsData.total} records</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage and track your {objectLabel.toLowerCase()} records.
            </p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddRecord}>
            <Plus className="h-5 w-5" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="flex flex-col bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px]">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs group">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400 dark:text-slate-200"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Button variant="secondary" size="sm">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="secondary" size="sm">
              <SortAsc className="h-4 w-4" />
              Sort
            </Button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
            <Button variant="secondary" size="sm" className="px-2">
              <Columns className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        {fields && (
          <div className="flex-1 overflow-x-auto">
            <RecordsTable
              fields={fields}
              records={recordsData.records}
              sorting={sorting}
              onSortingChange={handleSortingChange}
              globalFilter={searchQuery}
              onRowClick={handleRowClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-surface-dark">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {startRecord} - {endRecord} of {recordsData.total} records
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => tableState.setPage(tableState.page - 1)}
              disabled={tableState.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={tableState.page === pageNum ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => tableState.setPage(pageNum)}
                    className="min-w-[2.5rem]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => tableState.setPage(tableState.page + 1)}
              disabled={tableState.page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Create Record Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              Create New Record
            </h2>
            <CreateRecordForm
              objectId={objectId}
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
