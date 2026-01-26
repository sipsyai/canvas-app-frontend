import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsAPI } from '@/lib/api/records.api';
import type { RecordUpdateRequest, DataRecord } from '@/types/record.types';

interface UpdateRecordParams {
  recordId: string;
  data: RecordUpdateRequest;
}

interface UseUpdateRecordOptions {
  objectId: string;
}

export const useUpdateRecord = ({ objectId }: UseUpdateRecordOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: UpdateRecordParams) =>
      recordsAPI.update(recordId, data),
    onSuccess: (updatedRecord: DataRecord) => {
      // Invalidate records list
      queryClient.invalidateQueries({
        queryKey: ['records', objectId],
      });
      // Update single record cache if exists
      queryClient.setQueryData(['record', updatedRecord.id], updatedRecord);
    },
  });
};
