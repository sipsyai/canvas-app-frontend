import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { objectsAPI } from '@/lib/api/objects.api';
import type { ObjectCreateRequest, ObjectUpdateRequest } from '@/types/object.types';

/**
 * Query key factory for objects
 */
export const objectKeys = {
  all: ['objects'] as const,
  lists: () => [...objectKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...objectKeys.lists(), filters] as const,
  details: () => [...objectKeys.all, 'detail'] as const,
  detail: (id: string) => [...objectKeys.details(), id] as const,
};

/**
 * Hook to fetch all objects
 */
export function useObjects(params?: { category?: string }) {
  return useQuery({
    queryKey: objectKeys.list(params),
    queryFn: () => objectsAPI.list(params),
  });
}

/**
 * Hook to fetch a single object by ID
 */
export function useObject(objectId: string) {
  return useQuery({
    queryKey: objectKeys.detail(objectId),
    queryFn: () => objectsAPI.getById(objectId),
    enabled: !!objectId,
  });
}

/**
 * Hook to create a new object
 */
export function useCreateObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ObjectCreateRequest) => objectsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectKeys.lists() });
    },
  });
}

/**
 * Hook to update an object
 */
export function useUpdateObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ObjectUpdateRequest }) =>
      objectsAPI.update(id, data),
    onSuccess: (updatedObject) => {
      queryClient.setQueryData(objectKeys.detail(updatedObject.id), updatedObject);
      queryClient.invalidateQueries({ queryKey: objectKeys.lists() });
    },
  });
}

/**
 * Hook to delete an object
 */
export function useDeleteObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (objectId: string) => objectsAPI.delete(objectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectKeys.lists() });
    },
  });
}
