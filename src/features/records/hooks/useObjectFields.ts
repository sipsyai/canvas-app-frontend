/**
 * useObjectFields Hook
 *
 * Fetch field definitions for an object (for dynamic column generation)
 */

import { useQuery } from '@tanstack/react-query';
import { objectFieldsApi } from '@/lib/api/object-fields.api';

export const useObjectFields = (objectId: string) => {
  return useQuery({
    queryKey: ['object-fields', objectId],
    queryFn: () => objectFieldsApi.listByObject(objectId),
    enabled: !!objectId,
    staleTime: 60000, // 1 minute (fields rarely change)
  });
};
