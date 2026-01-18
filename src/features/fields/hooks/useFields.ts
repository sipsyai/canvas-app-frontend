import { useQuery } from '@tanstack/react-query';
import { fieldsAPI } from '@/lib/api/fields.api';

interface UseFieldsParams {
  category?: string | null;
  is_system_field?: boolean;
}

export const useFields = (params?: UseFieldsParams) => {
  // Convert null to undefined for API call
  const apiParams = params ? {
    category: params.category ?? undefined,
    is_system_field: params.is_system_field,
  } : undefined;

  return useQuery({
    queryKey: ['fields', params],
    queryFn: () => fieldsAPI.list(apiParams),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
