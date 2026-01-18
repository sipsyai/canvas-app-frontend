import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { objectFieldsApi } from '@/lib/api/object-fields.api';
import type {
  ObjectFieldCreateRequest,
  ObjectFieldUpdateRequest,
} from '@/types/object-field.types';

/**
 * Query key factory for object-fields
 */
export const objectFieldKeys = {
  all: ['object-fields'] as const,
  lists: () => [...objectFieldKeys.all, 'list'] as const,
  list: (objectId: string) => [...objectFieldKeys.lists(), objectId] as const,
  details: () => [...objectFieldKeys.all, 'detail'] as const,
  detail: (id: string) => [...objectFieldKeys.details(), id] as const,
};

/**
 * Hook to fetch all fields for a specific object
 */
export function useObjectFields(objectId: string) {
  return useQuery({
    queryKey: objectFieldKeys.list(objectId),
    queryFn: () => objectFieldsApi.listByObject(objectId),
    enabled: !!objectId,
  });
}

/**
 * Hook to fetch a single object-field by ID
 */
export function useObjectField(objectFieldId: string) {
  return useQuery({
    queryKey: objectFieldKeys.detail(objectFieldId),
    queryFn: () => objectFieldsApi.getById(objectFieldId),
    enabled: !!objectFieldId,
  });
}

/**
 * Hook to create a new object-field (attach field to object)
 */
export function useCreateObjectField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ObjectFieldCreateRequest) => objectFieldsApi.create(data),
    onSuccess: (newObjectField) => {
      // Invalidate the list query for this object
      queryClient.invalidateQueries({
        queryKey: objectFieldKeys.list(newObjectField.object_id),
      });

      // Invalidate all lists to be safe
      queryClient.invalidateQueries({
        queryKey: objectFieldKeys.lists(),
      });
    },
  });
}

/**
 * Hook to update an object-field
 */
export function useUpdateObjectField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ObjectFieldUpdateRequest }) =>
      objectFieldsApi.update(id, data),
    onSuccess: (updatedObjectField) => {
      // Update the detail cache
      queryClient.setQueryData(
        objectFieldKeys.detail(updatedObjectField.id),
        updatedObjectField
      );

      // Invalidate the list query for this object
      queryClient.invalidateQueries({
        queryKey: objectFieldKeys.list(updatedObjectField.object_id),
      });
    },
  });
}

/**
 * Hook to delete an object-field (remove field from object)
 */
export function useDeleteObjectField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (objectFieldId: string) => objectFieldsApi.delete(objectFieldId),
    onSuccess: (_, objectFieldId) => {
      // Invalidate all lists since we don't know which object this belonged to
      queryClient.invalidateQueries({
        queryKey: objectFieldKeys.lists(),
      });

      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: objectFieldKeys.detail(objectFieldId),
      });
    },
  });
}

/**
 * Hook to bulk update field order
 */
export function useBulkUpdateFieldOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ id: string; display_order: number; object_id: string }>) => {
      // Extract object_id from first update (all should belong to same object)
      const objectId = updates[0]?.object_id;

      return objectFieldsApi.bulkUpdateOrder(
        updates.map(({ id, display_order }) => ({ id, display_order }))
      ).then(() => objectId);
    },
    onSuccess: (objectId) => {
      if (objectId) {
        // Invalidate the list query for this object
        queryClient.invalidateQueries({
          queryKey: objectFieldKeys.list(objectId),
        });
      }
    },
  });
}
