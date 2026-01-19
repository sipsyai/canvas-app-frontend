import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRelationship,
  getObjectRelationships,
  deleteRelationship,
  type CreateRelationshipRequest,
} from '@/lib/api/relationships.api';
import {
  createRelationshipRecord,
  getRelatedRecords,
  deleteRelationshipRecord,
  type CreateRelationshipRecordRequest,
} from '@/lib/api/relationship-records.api';

// ========================================
// RELATIONSHIP DEFINITIONS
// ========================================

/**
 * Get all relationships for an object
 */
export function useObjectRelationships(objectId: string | undefined) {
  return useQuery({
    queryKey: ['relationships', 'object', objectId],
    queryFn: () => getObjectRelationships(objectId!),
    enabled: !!objectId,
  });
}

/**
 * Create a relationship definition
 */
export function useCreateRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRelationshipRequest) => createRelationship(data),
    onSuccess: (_, variables) => {
      // Invalidate relationships for both objects
      queryClient.invalidateQueries({
        queryKey: ['relationships', 'object', variables.from_object_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['relationships', 'object', variables.to_object_id],
      });
    },
  });
}

/**
 * Delete a relationship definition
 */
export function useDeleteRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relationshipId: string) => deleteRelationship(relationshipId),
    onSuccess: () => {
      // Invalidate all relationship queries
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
      queryClient.invalidateQueries({ queryKey: ['relationship-records'] });
    },
  });
}

// ========================================
// RELATIONSHIP RECORDS (LINKS)
// ========================================

/**
 * Get related records for a record via a relationship
 */
export function useRelatedRecords(
  recordId: string | undefined,
  relationshipId: string | undefined
) {
  return useQuery({
    queryKey: ['relationship-records', recordId, relationshipId],
    queryFn: () => getRelatedRecords(recordId!, relationshipId!),
    enabled: !!recordId && !!relationshipId,
  });
}

/**
 * Link two records via a relationship
 */
export function useCreateRelationshipRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRelationshipRecordRequest) =>
      createRelationshipRecord(data),
    onSuccess: (_, variables) => {
      // Invalidate related records for both records
      queryClient.invalidateQueries({
        queryKey: [
          'relationship-records',
          variables.from_record_id,
          variables.relationship_id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'relationship-records',
          variables.to_record_id,
          variables.relationship_id,
        ],
      });
    },
  });
}

/**
 * Unlink two records (delete relationship record)
 */
export function useDeleteRelationshipRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => deleteRelationshipRecord(linkId),
    onSuccess: () => {
      // Invalidate all relationship-records queries
      queryClient.invalidateQueries({ queryKey: ['relationship-records'] });
    },
  });
}
