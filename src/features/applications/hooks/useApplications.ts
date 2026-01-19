import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, CreateApplicationData, UpdateApplicationData } from '@/lib/api/applications.api';

// Query keys
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
};

// List applications
export function useApplications(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: applicationKeys.list(params || {}),
    queryFn: () => applicationsApi.list(params),
  });
}

// Get single application
export function useApplication(appId: string) {
  return useQuery({
    queryKey: applicationKeys.detail(appId),
    queryFn: () => applicationsApi.get(appId),
    enabled: !!appId,
  });
}

// Create application
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationData) => applicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

// Update application
export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, data }: { appId: string; data: UpdateApplicationData }) =>
      applicationsApi.update(appId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(variables.appId) });
    },
  });
}

// Publish application
export function usePublishApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => applicationsApi.publish(appId),
    onSuccess: (_, appId) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(appId) });
    },
  });
}

// Delete application
export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => applicationsApi.delete(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}
