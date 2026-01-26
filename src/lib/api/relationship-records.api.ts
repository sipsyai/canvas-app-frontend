import { apiClient } from './client';

// ========================================
// TYPES
// ========================================

export interface RelationshipRecord {
  id: string;
  relationship_id: string;
  from_record_id: string;
  to_record_id: string;
  relationship_metadata: Record<string, any>;
  created_at: string;
  created_by: string;
}

export interface CreateRelationshipRecordRequest {
  relationship_id: string;
  from_record_id: string;
  to_record_id: string;
  relationship_metadata?: Record<string, any>;
}

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Link two records via a relationship
 * POST /api/relationship-records
 */
export async function createRelationshipRecord(
  data: CreateRelationshipRecordRequest
): Promise<RelationshipRecord> {
  const response = await apiClient.post<RelationshipRecord>(
    '/api/relationship-records',
    data
  );
  return response.data;
}

/**
 * Get related records for a record via a relationship (bidirectional)
 * GET /api/relationship-records/records/{record_id}/related?relationship_id=...
 */
export async function getRelatedRecords(
  recordId: string,
  relationshipId: string
): Promise<RelationshipRecord[]> {
  const response = await apiClient.get<RelationshipRecord[]>(
    `/api/relationship-records/records/${recordId}/related`,
    {
      params: { relationship_id: relationshipId },
    }
  );
  return response.data;
}

/**
 * Delete a relationship record (unlink)
 * DELETE /api/relationship-records/{link_id}
 */
export async function deleteRelationshipRecord(linkId: string): Promise<void> {
  await apiClient.delete(`/api/relationship-records/${linkId}`);
}
