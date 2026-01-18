import apiClient from './client';
import type { Field, FieldCreateRequest, FieldUpdateRequest } from '@/types/field.types';

interface ListFieldsParams {
  category?: string;
  is_system_field?: boolean; // Backend uses 'is_system_field', not 'is_system'
  page?: number;
  page_size?: number;
}

export const fieldsAPI = {
  /**
   * Create new field
   * Backend Docs: /backend-docs/api/02-fields/01-create-field.md
   *
   * Field ID auto-generated: fld_xxxxxxxx (8 char hex)
   * created_by auto-set from JWT token
   */
  create: async (data: FieldCreateRequest): Promise<Field> => {
    const response = await apiClient.post<Field>('/api/fields', data);
    return response.data;
  },

  /**
   * List all fields (with optional filters)
   * Backend Docs: /backend-docs/api/02-fields/02-list-fields.md
   *
   * Supports pagination and filtering by category/is_system_field
   */
  list: async (params?: ListFieldsParams): Promise<Field[]> => {
    const response = await apiClient.get<Field[]>('/api/fields', { params });
    return response.data;
  },

  /**
   * Get single field by ID
   * Backend Docs: /backend-docs/api/02-fields/03-get-field.md
   */
  getById: async (fieldId: string): Promise<Field> => {
    const response = await apiClient.get<Field>(`/api/fields/${fieldId}`);
    return response.data;
  },

  /**
   * Update field
   * Backend Docs: /backend-docs/api/02-fields/04-update-field.md
   *
   * Note: name and type cannot be changed after creation
   */
  update: async (fieldId: string, data: FieldUpdateRequest): Promise<Field> => {
    const response = await apiClient.patch<Field>(`/api/fields/${fieldId}`, data);
    return response.data;
  },

  /**
   * Delete field
   * Backend Docs: /backend-docs/api/02-fields/05-delete-field.md
   *
   * WARNING: CASCADE delete - removes all object-field relationships!
   */
  delete: async (fieldId: string): Promise<void> => {
    await apiClient.delete(`/api/fields/${fieldId}`);
  },
};
