import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsAPI } from '@/lib/api/records.api';
import type { RecordCreateRequest, RecordUpdateRequest } from '@/types/record.types';

// Query Keys
export const recordsKeys = {
  all: ['records'] as const,
  lists: () => [...recordsKeys.all, 'list'] as const,
  list: (objectId: string, filters?: { page?: number; page_size?: number }) =>
    [...recordsKeys.lists(), objectId, filters] as const,
  details: () => [...recordsKeys.all, 'detail'] as const,
  detail: (recordId: string) => [...recordsKeys.details(), recordId] as const,
  searches: () => [...recordsKeys.all, 'search'] as const,
  search: (objectId: string, query: string, filters?: { page?: number; page_size?: number }) =>
    [...recordsKeys.searches(), objectId, query, filters] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch records for a specific object
 * @param objectId - The object ID to fetch records for
 * @param params - Optional pagination params
 */
export const useRecords = (
  objectId: string,
  params?: { page?: number; page_size?: number }
) => {
  return useQuery({
    queryKey: recordsKeys.list(objectId, params),
    queryFn: () => recordsAPI.list({ object_id: objectId, ...params }),
    enabled: !!objectId, // Only run if objectId exists
  });
};

/**
 * Fetch a single record by ID
 * @param recordId - The record ID to fetch
 */
export const useRecord = (recordId: string) => {
  return useQuery({
    queryKey: recordsKeys.detail(recordId),
    queryFn: () => recordsAPI.getById(recordId),
    enabled: !!recordId, // Only run if recordId exists
  });
};

/**
 * Search records within an object
 * @param objectId - The object ID to search within
 * @param query - Search query string
 * @param params - Optional pagination params
 */
export const useSearchRecords = (
  objectId: string,
  query: string,
  params?: { page?: number; page_size?: number }
) => {
  return useQuery({
    queryKey: recordsKeys.search(objectId, query, params),
    queryFn: () => recordsAPI.search({ object_id: objectId, q: query, ...params }),
    enabled: !!objectId && !!query, // Only run if both objectId and query exist
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new record
 */
export const useCreateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordCreateRequest) => recordsAPI.create(data),
    onSuccess: (newRecord) => {
      // Invalidate the list query for this object
      queryClient.invalidateQueries({
        queryKey: recordsKeys.list(newRecord.object_id),
      });

      // Also invalidate all lists to be safe
      queryClient.invalidateQueries({
        queryKey: recordsKeys.lists(),
      });
    },
  });
};

/**
 * Update an existing record
 */
export const useUpdateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: RecordUpdateRequest }) =>
      recordsAPI.update(recordId, data),
    onSuccess: (updatedRecord, variables) => {
      // Invalidate the detail query for this specific record
      queryClient.invalidateQueries({
        queryKey: recordsKeys.detail(variables.recordId),
      });

      // Invalidate the list query for this object
      queryClient.invalidateQueries({
        queryKey: recordsKeys.list(updatedRecord.object_id),
      });

      // Invalidate all lists to catch any other views
      queryClient.invalidateQueries({
        queryKey: recordsKeys.lists(),
      });
    },
  });
};

/**
 * Delete a record
 */
export const useDeleteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) => recordsAPI.delete(recordId),
    onSuccess: (_, recordId) => {
      // Remove the detail query for this record
      queryClient.removeQueries({
        queryKey: recordsKeys.detail(recordId),
      });

      // Invalidate all list queries
      queryClient.invalidateQueries({
        queryKey: recordsKeys.lists(),
      });

      // Invalidate all search queries
      queryClient.invalidateQueries({
        queryKey: recordsKeys.searches(),
      });
    },
  });
};
