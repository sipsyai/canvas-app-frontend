import { apiClient } from './client';
import type {
  ObjectField,
  ObjectFieldWithDetails,
  ObjectFieldCreateRequest,
  ObjectFieldUpdateRequest,
} from '@/types/object-field.types';

const BASE_PATH = '/api/object-fields';

/**
 * Object-Field API - Manages field-to-object relationships
 */
export const objectFieldsApi = {
  /**
   * Create a new object-field relationship (attach field to object)
   * POST /api/object-fields
   */
  create: async (data: ObjectFieldCreateRequest): Promise<ObjectField> => {
    const response = await apiClient.post<ObjectField>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Get all fields for a specific object (ordered by display_order)
   * GET /api/object-fields?object_id={object_id}
   */
  listByObject: async (objectId: string): Promise<ObjectFieldWithDetails[]> => {
    const response = await apiClient.get<ObjectFieldWithDetails[]>(BASE_PATH, {
      params: { object_id: objectId },
    });
    return response.data;
  },

  /**
   * Get a single object-field relationship
   * GET /api/object-fields/{object_field_id}
   */
  getById: async (objectFieldId: string): Promise<ObjectField> => {
    const response = await apiClient.get<ObjectField>(`${BASE_PATH}/${objectFieldId}`);
    return response.data;
  },

  /**
   * Update an object-field relationship (e.g., change display_order, is_required)
   * PATCH /api/object-fields/{object_field_id}
   */
  update: async (
    objectFieldId: string,
    data: ObjectFieldUpdateRequest
  ): Promise<ObjectField> => {
    const response = await apiClient.patch<ObjectField>(
      `${BASE_PATH}/${objectFieldId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete an object-field relationship (remove field from object)
   * DELETE /api/object-fields/{object_field_id}
   */
  delete: async (objectFieldId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${objectFieldId}`);
  },

  /**
   * Bulk update display_order for multiple object-fields
   * Helper function to reorder fields
   */
  bulkUpdateOrder: async (
    updates: Array<{ id: string; display_order: number }>
  ): Promise<void> => {
    await Promise.all(
      updates.map(({ id, display_order }) =>
        objectFieldsApi.update(id, { display_order })
      )
    );
  },
};
