import apiClient from './client';
import type { DataRecord, RecordCreateRequest, RecordUpdateRequest } from '@/types/record.types';

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
  create: async (data: RecordCreateRequest): Promise<DataRecord> => {
    const response = await apiClient.post<DataRecord>('/api/records', data);
    return response.data;
  },

  list: async (params: ListRecordsParams): Promise<DataRecord[]> => {
    const response = await apiClient.get<DataRecord[]>('/api/records', { params });
    return response.data;
  },

  getById: async (recordId: string): Promise<DataRecord> => {
    const response = await apiClient.get<DataRecord>(`/api/records/${recordId}`);
    return response.data;
  },

  update: async (recordId: string, data: RecordUpdateRequest): Promise<DataRecord> => {
    // IMPORTANT: Backend merges data, doesn't overwrite!
    const response = await apiClient.patch<DataRecord>(`/api/records/${recordId}`, data);
    return response.data;
  },

  delete: async (recordId: string): Promise<void> => {
    await apiClient.delete(`/api/records/${recordId}`);
  },

  search: async (params: SearchRecordsParams): Promise<DataRecord[]> => {
    const response = await apiClient.get<DataRecord[]>('/api/records/search', { params });
    return response.data;
  },
};
