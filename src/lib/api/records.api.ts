import apiClient from './client';
import type { Record, RecordCreateRequest, RecordUpdateRequest } from '@/types/record.types';

interface ListRecordsParams {
  object_id: string; // REQUIRED
  page?: number;
  page_size?: number;
}

interface SearchRecordsParams {
  object_id: string; // REQUIRED
  q: string;         // REQUIRED - Search query
  page?: number;
  page_size?: number;
}

export const recordsAPI = {
  create: async (data: RecordCreateRequest): Promise<Record> => {
    const response = await apiClient.post<Record>('/api/records', data);
    return response.data;
  },

  list: async (params: ListRecordsParams): Promise<Record[]> => {
    const response = await apiClient.get<Record[]>('/api/records', { params });
    return response.data;
  },

  getById: async (recordId: string): Promise<Record> => {
    const response = await apiClient.get<Record>(`/api/records/${recordId}`);
    return response.data;
  },

  update: async (recordId: string, data: RecordUpdateRequest): Promise<Record> => {
    // IMPORTANT: Backend merges data, doesn't overwrite!
    const response = await apiClient.patch<Record>(`/api/records/${recordId}`, data);
    return response.data;
  },

  delete: async (recordId: string): Promise<void> => {
    await apiClient.delete(`/api/records/${recordId}`);
  },

  search: async (params: SearchRecordsParams): Promise<Record[]> => {
    const response = await apiClient.get<Record[]>('/api/records/search', { params });
    return response.data;
  },
};
