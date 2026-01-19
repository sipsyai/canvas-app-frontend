import { apiClient } from './client';

// ========================================
// TYPES
// ========================================

export type RelationshipType = '1:N' | 'N:N';

export interface Relationship {
  id: string;
  name: string;
  from_object_id: string;
  to_object_id: string;
  type: RelationshipType;
  from_label: string | null;
  to_label: string | null;
  created_at: string;
  created_by: string;
}

export interface CreateRelationshipRequest {
  name: string;
  from_object_id: string;
  to_object_id: string;
  type: RelationshipType;
  from_label?: string;
  to_label?: string;
}

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Create a new relationship between two objects
 * POST /api/relationships
 */
export async function createRelationship(
  data: CreateRelationshipRequest
): Promise<Relationship> {
  const response = await apiClient.post<Relationship>('/api/relationships', data);
  return response.data;
}

/**
 * Get all relationships for an object (as source or target)
 * GET /api/relationships/objects/{object_id}
 */
export async function getObjectRelationships(
  objectId: string
): Promise<Relationship[]> {
  const response = await apiClient.get<Relationship[]>(
    `/api/relationships/objects/${objectId}`
  );
  return response.data;
}

/**
 * Delete a relationship definition
 * DELETE /api/relationships/{relationship_id}
 */
export async function deleteRelationship(
  relationshipId: string
): Promise<void> {
  await apiClient.delete(`/api/relationships/${relationshipId}`);
}
