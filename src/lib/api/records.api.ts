/**
 * Records API Client
 *
 * Backend endpoints for record management
 */

import apiClient from './client';
import type {
  DataRecord,
  RecordListResponse,
  RecordCreateRequest,
  RecordUpdateRequest,
} from '@/types/record.types';

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
  /**
   * Create a new record
   *
   * @endpoint POST /api/records
   */
  create: async (data: RecordCreateRequest): Promise<DataRecord> => {
    const response = await apiClient.post<DataRecord>('/api/records', data);
    return response.data;
  },

  /**
   * Get records for an object (with pagination)
   *
   * @endpoint GET /api/records?object_id={id}
   */
  list: async (params: ListRecordsParams): Promise<RecordListResponse> => {
    const response = await apiClient.get<RecordListResponse>('/api/records', {
      params: {
        object_id: params.object_id,
        page: params.page ?? 1,
        page_size: params.page_size ?? 50,
      },
    });
    return response.data;
  },

  /**
   * Get a single record by ID
   *
   * @endpoint GET /api/records/{record_id}
   */
  getById: async (recordId: string): Promise<DataRecord> => {
    const response = await apiClient.get<DataRecord>(`/api/records/${recordId}`);
    return response.data;
  },

  /**
   * Update a record (MERGE behavior!)
   *
   * IMPORTANT: Backend MERGES data, does NOT overwrite!
   * Only send changed fields, not all fields.
   *
   * @endpoint PATCH /api/records/{record_id}
   */
  update: async (recordId: string, data: RecordUpdateRequest): Promise<DataRecord> => {
    const response = await apiClient.patch<DataRecord>(`/api/records/${recordId}`, data);
    return response.data;
  },

  /**
   * Delete a record
   *
   * @endpoint DELETE /api/records/{record_id}
   */
  delete: async (recordId: string): Promise<void> => {
    await apiClient.delete(`/api/records/${recordId}`);
  },

  /**
   * Search records by primary_value
   *
   * @endpoint GET /api/records/search?object_id={id}&q={query}
   */
  search: async (params: SearchRecordsParams): Promise<RecordListResponse> => {
    const response = await apiClient.get<RecordListResponse>('/api/records/search', {
      params: {
        object_id: params.object_id,
        q: params.q,
        page: params.page ?? 1,
        page_size: params.page_size ?? 50,
      },
    });
    return response.data;
  },
};
