/**
 * useRecords Hook
 *
 * Fetch records for an object with pagination
 */

import { useQuery } from '@tanstack/react-query';
import { recordsAPI } from '@/lib/api/records.api';

interface UseRecordsParams {
  objectId: string;
  page?: number;
  pageSize?: number;
}

export const useRecords = ({ objectId, page = 1, pageSize = 50 }: UseRecordsParams) => {
  return useQuery({
    queryKey: ['records', objectId, page, pageSize],
    queryFn: () =>
      recordsAPI.list({
        object_id: objectId,
        page,
        page_size: pageSize,
      }),
    enabled: !!objectId,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * useRecord Hook
 *
 * Fetch a single record by ID
 */
export const useRecord = (objectId: string, recordId: string) => {
  return useQuery({
    queryKey: ['record', objectId, recordId],
    queryFn: () => recordsAPI.getById(recordId),
    enabled: !!objectId && !!recordId,
    staleTime: 30000, // 30 seconds
  });
};
