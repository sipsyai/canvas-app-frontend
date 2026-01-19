/**
 * RecordsTablePage Component
 *
 * Main page for displaying records table
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RecordsTable } from '../components/RecordsTable';
import { RecordsTableToolbar } from '../components/RecordsTableToolbar';
import { RecordsTableSkeleton } from '../components/RecordsTableSkeleton';
import { EmptyRecordsState } from '../components/EmptyRecordsState';
import { CreateRecordForm } from '../components/CreateRecordForm';
import { useRecords } from '../hooks/useRecords';
import { useObjectFields } from '../hooks/useObjectFields';
import { useTableState } from '../hooks/useTableState';
import { Button } from '@/components/ui/Button';
import type { DataRecord } from '@/types/record.types';

export const RecordsTablePage = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!objectId) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error: Object ID is missing</p>
        </div>
      </div>
    );
  }

  const [showCreateModal, setShowCreateModal] = useState(false);

  const tableState = useTableState({
    pageSize: 50,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

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

  // Sorting state for TanStack Table
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: tableState.sortBy,
      desc: tableState.sortOrder === 'desc',
    },
  ]);

  // Handle sorting change
  const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater;

    if (newSorting.length > 0) {
      tableState.setSortBy(newSorting[0].id);
      tableState.setSortOrder(newSorting[0].desc ? 'desc' : 'asc');
    }

    setSorting(newSorting);
  };

  // Handle row click
  const handleRowClick = (record: DataRecord) => {
    console.log('Row clicked:', record);
    // TODO: Open record detail modal or navigate to detail page
    // navigate(`/objects/${objectId}/records/${record.id}`);
  };

  // Handle edit record
  const handleEdit = (record: DataRecord) => {
    navigate(`/objects/${objectId}/records/${record.id}/edit`);
  };

  // Handle delete record
  const handleDelete = (record: DataRecord) => {
    // TODO: Show confirmation modal
    console.log('Delete record:', record.id);
  };

  // Handle add record
  const handleAddRecord = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    queryClient.invalidateQueries({ queryKey: ['records', objectId] });
  };

  // Handle view details (navigate to record detail page)
  const handleViewDetails = (record: DataRecord) => {
    navigate(`/objects/${objectId}/records/${record.id}`);
  };

  // Handle refresh
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
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Error loading records: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  // Empty state (no records)
  if (!recordsData || recordsData.records.length === 0) {
    return (
      <>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Records</h1>
            <p className="text-gray-600 mt-1">
              Manage your {objectId} records
            </p>
          </div>

          <EmptyRecordsState
            objectId={objectId}
            objectLabel={objectId}
            onAddRecord={handleAddRecord}
          />
        </div>

        {/* Create Record Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-6">Create New Record</h2>
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Records</h1>
        <p className="text-gray-600 mt-1">
          Manage your {objectId} records
        </p>
      </div>

      {/* Toolbar */}
      <RecordsTableToolbar
        objectId={objectId}
        totalRecords={recordsData.total}
        searchQuery={tableState.searchQuery}
        onSearchChange={tableState.setSearchQuery}
        onRefresh={handleRefresh}
        onAddRecord={handleAddRecord}
      />

      {/* Table */}
      {fields && (
        <RecordsTable
          fields={fields}
          records={recordsData.records}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          globalFilter={tableState.searchQuery}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {startRecord} - {endRecord} of {recordsData.total} records
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => tableState.setPage(tableState.page - 1)}
            disabled={tableState.page === 1}
            className="gap-2"
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
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Create New Record</h2>
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
