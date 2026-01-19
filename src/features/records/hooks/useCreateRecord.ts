import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsAPI } from '@/lib/api/records.api';

export const useCreateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordsAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['records', data.object_id],
      });
    },
  });
};
