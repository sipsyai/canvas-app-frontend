import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsAPI } from '@/lib/api/records.api';

interface DeleteRecordOptions {
  objectId: string;
}

export const useDeleteRecord = ({ objectId }: DeleteRecordOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) => recordsAPI.delete(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['records', objectId],
      });
    },
  });
};
