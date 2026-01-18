import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { objectsAPI } from '@/lib/api/objects.api';
import type { ObjectCreateRequest, ObjectUpdateRequest } from '@/types/object.types';

// Query Keys
export const objectsKeys = {
  all: ['objects'] as const,
  lists: () => [...objectsKeys.all, 'list'] as const,
  list: (filters?: { category?: string; page?: number; page_size?: number }) =>
    [...objectsKeys.lists(), filters] as const,
  details: () => [...objectsKeys.all, 'detail'] as const,
  detail: (objectId: string) => [...objectsKeys.details(), objectId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch all objects with optional filters
 * @param params - Optional filters (category, pagination)
 */
export const useObjects = (params?: {
  category?: string;
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: objectsKeys.list(params),
    queryFn: () => objectsAPI.list(params),
  });
};

/**
 * Fetch a single object by ID
 * @param objectId - The object ID to fetch
 */
export const useObject = (objectId: string) => {
  return useQuery({
    queryKey: objectsKeys.detail(objectId),
    queryFn: () => objectsAPI.getById(objectId),
    enabled: !!objectId, // Only run if objectId exists
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new object
 *
 * Backend auto-generates:
 * - object_id: obj_xxxxxxxx (8 char hex)
 * - created_by: From JWT token
 */
export const useCreateObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ObjectCreateRequest) => objectsAPI.create(data),
    onSuccess: () => {
      // Invalidate all object list queries
      queryClient.invalidateQueries({
        queryKey: objectsKeys.lists(),
      });
    },
  });
};

/**
 * Update an existing object
 */
export const useUpdateObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectId, data }: { objectId: string; data: ObjectUpdateRequest }) =>
      objectsAPI.update(objectId, data),
    onSuccess: (_, variables) => {
      // Invalidate the detail query for this specific object
      queryClient.invalidateQueries({
        queryKey: objectsKeys.detail(variables.objectId),
      });

      // Invalidate all list queries
      queryClient.invalidateQueries({
        queryKey: objectsKeys.lists(),
      });

      // Invalidate related records lists since object metadata might affect them
      queryClient.invalidateQueries({
        queryKey: ['records', 'list', variables.objectId],
      });
    },
  });
};

/**
 * Delete an object
 *
 * WARNING: This will cascade delete all records associated with this object!
 */
export const useDeleteObject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (objectId: string) => objectsAPI.delete(objectId),
    onSuccess: (_, objectId) => {
      // Remove the detail query for this object
      queryClient.removeQueries({
        queryKey: objectsKeys.detail(objectId),
      });

      // Invalidate all list queries
      queryClient.invalidateQueries({
        queryKey: objectsKeys.lists(),
      });

      // Remove all records queries for this object (they're deleted)
      queryClient.removeQueries({
        queryKey: ['records', 'list', objectId],
      });

      // Invalidate all record searches for this object
      queryClient.invalidateQueries({
        queryKey: ['records', 'search', objectId],
      });
    },
  });
};
