/**
 * RelatedRecordsPanel Component
 *
 * Panel for displaying and managing related records with Stitch design
 * - List of linked records
 * - Link/unlink functionality
 * - Quick navigation to related records
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useRelatedRecords,
  useDeleteRelationshipRecord,
} from '@/lib/hooks/useRelationships';
import { useRecords } from '@/features/records/hooks/useRecords';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { LinkRecordsModal } from './LinkRecordsModal';
import {
  Plus,
  ExternalLink,
  Trash2,
  Link as LinkIcon,
  User,
  Calendar,
} from 'lucide-react';
import type { Relationship } from '@/lib/api/relationships.api';

interface RelatedRecordsPanelProps {
  recordId: string;
  recordName: string;
  relationship: Relationship;
  currentObjectId: string;
  getRecordDetailUrl?: (objectId: string, recordId: string) => string;
}

export function RelatedRecordsPanel({
  recordId,
  recordName,
  relationship,
  currentObjectId,
  getRecordDetailUrl,
}: RelatedRecordsPanelProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const navigate = useNavigate();

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

  const getRecordDisplayName = (targetRecordId: string) => {
    const record = allTargetRecords?.find((r) => r.id === targetRecordId);
    if (!record) return targetRecordId;

    // Try to find a name-like field
    const nameField = Object.entries(record.data).find(([key]) =>
      key.toLowerCase().includes('name')
    );
    if (nameField) return String(nameField[1]);

    // Fall back to first field value
    const firstValue = Object.values(record.data)[0];
    return firstValue ? String(firstValue) : targetRecordId;
  };

  const handleNavigateToRecord = (targetRecordId: string) => {
    const url = getRecordDetailUrl
      ? getRecordDetailUrl(targetObjectId, targetRecordId)
      : `/objects/${targetObjectId}/records/${targetRecordId}`;
    navigate(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <LinkIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {label || 'Related Records'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {relationship.type === '1:N' ? 'One-to-Many' : 'Many-to-Many'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">{links?.length || 0}</Badge>
          <Button size="sm" onClick={() => setIsLinkModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Link
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              ))}
            </div>
          </div>
        ) : links && links.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {links.map((link) => {
              const targetRecordId =
                link.from_record_id === recordId ? link.to_record_id : link.from_record_id;

              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => handleNavigateToRecord(targetRecordId)}
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                        {getRecordDisplayName(targetRecordId)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3 w-3" />
                        Linked {new Date(link.created_at).toLocaleDateString()}
                        {link.relationship_metadata?.notes && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="truncate">{link.relationship_metadata.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2"
                      onClick={() => handleNavigateToRecord(targetRecordId)}
                      title="View Record"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteLink(link.id)}
                      disabled={deleteLinkMutation.isPending}
                      title="Unlink Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <LinkIcon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              No {label?.toLowerCase() || 'related records'} linked yet
            </p>
            <Button size="sm" variant="secondary" onClick={() => setIsLinkModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Link First Record
            </Button>
          </div>
        )}
      </CardContent>

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
    </Card>
  );
}
