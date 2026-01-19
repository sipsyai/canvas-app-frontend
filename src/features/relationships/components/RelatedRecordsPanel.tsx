import { useState } from 'react';
import {
  useRelatedRecords,
  useDeleteRelationshipRecord,
} from '@/lib/hooks/useRelationships';
import { useRecords } from '@/features/records/hooks/useRecords';
import { Button } from '@/components/ui/Button';
import { LinkRecordsModal } from './LinkRecordsModal';
import { Plus, ExternalLink, Trash2, Link as LinkIcon } from 'lucide-react';
import type { Relationship } from '@/lib/api/relationships.api';

interface RelatedRecordsPanelProps {
  recordId: string;
  recordName: string;
  relationship: Relationship;
  currentObjectId: string;
}

export function RelatedRecordsPanel({
  recordId,
  recordName,
  relationship,
  currentObjectId,
}: RelatedRecordsPanelProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const isSource = relationship.from_object_id === currentObjectId;
  const targetObjectId = isSource ? relationship.to_object_id : relationship.from_object_id;
  const label = isSource ? relationship.from_label : relationship.to_label;

  const { data: links, isLoading } = useRelatedRecords(recordId, relationship.id);
  const { data: allTargetRecordsResponse } = useRecords({ objectId: targetObjectId });
  const allTargetRecords = allTargetRecordsResponse?.records || [];
  const deleteLinkMutation = useDeleteRelationshipRecord();

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to remove this link?')) return;

    try {
      await deleteLinkMutation.mutateAsync(linkId);
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const getRecordDisplayName = (recordId: string) => {
    const record = allTargetRecords?.find((r) => r.id === recordId);
    if (!record) return recordId;

    // Try to find a name-like field
    const nameField = Object.entries(record.data).find(([key]) =>
      key.toLowerCase().includes('name')
    );
    if (nameField) return String(nameField[1]);

    // Fall back to first field value
    const firstValue = Object.values(record.data)[0];
    return firstValue ? String(firstValue) : recordId;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">
            {label || 'Related Records'}
          </h3>
          <span className="text-sm text-gray-500">
            ({links?.length || 0})
          </span>
        </div>

        <Button
          size="sm"
          onClick={() => setIsLinkModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Link Record
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading related records...</div>
      ) : links && links.length > 0 ? (
        <div className="space-y-2">
          {links.map((link) => {
            const targetRecordId =
              link.from_record_id === recordId ? link.to_record_id : link.from_record_id;

            return (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {getRecordDisplayName(targetRecordId)}
                  </div>
                  {link.relationship_metadata?.notes && (
                    <div className="text-sm text-gray-500 mt-1">
                      {link.relationship_metadata.notes}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Linked on {new Date(link.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Navigate to the related record
                      window.location.href = `/objects/${targetObjectId}/records`;
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLink(link.id)}
                    disabled={deleteLinkMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <LinkIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p>No related records</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsLinkModalOpen(true)}
            className="mt-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Link First Record
          </Button>
        </div>
      )}

      {/* Link Records Modal */}
      {isLinkModalOpen && (
        <LinkRecordsModal
          relationshipId={relationship.id}
          fromRecordId={recordId}
          fromRecordName={recordName}
          toObjectId={targetObjectId}
          toObjectName={label || 'Record'}
          onClose={() => setIsLinkModalOpen(false)}
          onSuccess={() => {
            // Modal will close automatically
          }}
        />
      )}
    </div>
  );
}
