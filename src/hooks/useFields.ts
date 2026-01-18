import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldsAPI } from '@/lib/api/fields.api';
import type { FieldCreateRequest, FieldUpdateRequest } from '@/types/field.types';

// Query Keys
export const fieldsKeys = {
  all: ['fields'] as const,
  lists: () => [...fieldsKeys.all, 'list'] as const,
  list: (filters?: {
    category?: string;
    is_system_field?: boolean;
    page?: number;
    page_size?: number;
  }) => [...fieldsKeys.lists(), filters] as const,
  details: () => [...fieldsKeys.all, 'detail'] as const,
  detail: (fieldId: string) => [...fieldsKeys.details(), fieldId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch all fields with optional filters
 * @param params - Optional filters (category, is_system_field, pagination)
 */
export const useFields = (params?: {
  category?: string;
  is_system_field?: boolean;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: fieldsKeys.list(params),
    queryFn: () => fieldsAPI.list(params),
  });
};

/**
 * Fetch a single field by ID
 * @param fieldId - The field ID to fetch
 */
export const useField = (fieldId: string) => {
  return useQuery({
    queryKey: fieldsKeys.detail(fieldId),
    queryFn: () => fieldsAPI.getById(fieldId),
    enabled: !!fieldId, // Only run if fieldId exists
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new field
 *
 * Backend auto-generates:
 * - field_id: fld_xxxxxxxx (8 char hex)
 * - created_by: From JWT token
 */
export const useCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FieldCreateRequest) => fieldsAPI.create(data),
    onSuccess: () => {
      // Invalidate all field list queries
      queryClient.invalidateQueries({
        queryKey: fieldsKeys.lists(),
      });
    },
  });
};

/**
 * Update an existing field
 *
 * NOTE: name and type cannot be changed after creation (backend constraint)
 */
export const useUpdateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, data }: { fieldId: string; data: FieldUpdateRequest }) =>
      fieldsAPI.update(fieldId, data),
    onSuccess: (_, variables) => {
      // Invalidate the detail query for this specific field
      queryClient.invalidateQueries({
        queryKey: fieldsKeys.detail(variables.fieldId),
      });

      // Invalidate all list queries
      queryClient.invalidateQueries({
        queryKey: fieldsKeys.lists(),
      });
    },
  });
};

/**
 * Delete a field
 *
 * WARNING: CASCADE delete - removes all object-field relationships!
 */
export const useDeleteField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: string) => fieldsAPI.delete(fieldId),
    onSuccess: (_, fieldId) => {
      // Remove the detail query for this field
      queryClient.removeQueries({
        queryKey: fieldsKeys.detail(fieldId),
      });

      // Invalidate all list queries
      queryClient.invalidateQueries({
        queryKey: fieldsKeys.lists(),
      });

      // Also invalidate objects since field relationships are affected
      queryClient.invalidateQueries({
        queryKey: ['objects'],
      });
    },
  });
};
