import apiClient from './client';
import type { Object, ObjectCreateRequest, ObjectUpdateRequest } from '@/types/object.types';

interface ListObjectsParams {
  category?: string;
  page?: number;
  page_size?: number;
}

export const objectsAPI = {
  create: async (data: ObjectCreateRequest): Promise<Object> => {
    const response = await apiClient.post<Object>('/api/objects', data);
    return response.data;
  },

  list: async (params?: ListObjectsParams): Promise<Object[]> => {
    const response = await apiClient.get<Object[]>('/api/objects', { params });
    return response.data;
  },

  getById: async (objectId: string): Promise<Object> => {
    const response = await apiClient.get<Object>(`/api/objects/${objectId}`);
    return response.data;
  },

  update: async (objectId: string, data: ObjectUpdateRequest): Promise<Object> => {
    const response = await apiClient.patch<Object>(`/api/objects/${objectId}`, data);
    return response.data;
  },

  delete: async (objectId: string): Promise<void> => {
    await apiClient.delete(`/api/objects/${objectId}`);
  },
};
