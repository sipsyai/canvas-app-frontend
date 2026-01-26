/**
 * LinkRecordsModal Component
 *
 * Modal for linking records with Stitch design
 * - Search and filter available records
 * - Radio selection for single link
 * - Optional relationship notes
 */

import { useState } from 'react';
import { useCreateRelationshipRecord } from '@/lib/hooks/useRelationships';
import { useRecords } from '@/features/records/hooks/useRecords';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import {
  Search,
  X,
  Link as LinkIcon,
  User,
  AlertCircle,
  Check,
} from 'lucide-react';
import type { DataRecord } from '@/types/record.types';

interface LinkRecordsModalProps {
  relationshipId: string;
  fromRecordId: string;
  fromRecordName: string;
  toObjectId: string;
  toObjectName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LinkRecordsModal({
  relationshipId,
  fromRecordId,
  fromRecordName,
  toObjectId,
  toObjectName,
  onClose,
  onSuccess,
}: LinkRecordsModalProps) {
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});

  const { data: targetRecordsResponse, isLoading } = useRecords({ objectId: toObjectId });
  const targetRecords = targetRecordsResponse?.records || [];
  const createLinkMutation = useCreateRelationshipRecord();

  const filteredRecords = targetRecords?.filter((record) => {
    if (!searchQuery) return true;
    const recordName = Object.values(record.data).join(' ').toLowerCase();
    return recordName.includes(searchQuery.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRecordId) {
      return;
    }

    try {
      await createLinkMutation.mutateAsync({
        relationship_id: relationshipId,
        from_record_id: fromRecordId,
        to_record_id: selectedRecordId,
        relationship_metadata: metadata,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to link records:', error);
    }
  };

  const getRecordDisplayName = (record: DataRecord) => {
    // Try to find a name-like field
    const nameFields = Object.entries(record.data).find(([key]) =>
      key.toLowerCase().includes('name')
    );
    if (nameFields) return String(nameFields[1]);

    // Fall back to first field value
    const firstValue = Object.values(record.data)[0];
    return firstValue ? String(firstValue) : record.id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Link Records
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Connect {fromRecordName} to a {toObjectName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="px-2" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search */}
            <div>
              <Label className="mb-2 block">Search {toObjectName} Records</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${toObjectName}...`}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </div>

            {/* Record List */}
            <div>
              <Label className="mb-2 block">Select Record to Link</Label>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded" />
                      ))}
                    </div>
                  </div>
                ) : filteredRecords && filteredRecords.length > 0 ? (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredRecords.map((record) => (
                      <label
                        key={record.id}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                          selectedRecordId === record.id
                            ? 'bg-primary/5 dark:bg-primary/10'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            selectedRecordId === record.id
                              ? 'border-primary bg-primary'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {selectedRecordId === record.id && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <input
                          type="radio"
                          name="record"
                          value={record.id}
                          checked={selectedRecordId === record.id}
                          onChange={(e) => setSelectedRecordId(e.target.value)}
                          className="sr-only"
                        />
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate">
                            {getRecordDisplayName(record)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {Object.entries(record.data)
                              .slice(0, 2)
                              .map(([key, value]) => `${key}: ${String(value)}`)
                              .join(' • ')}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Search className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {searchQuery
                        ? 'No records found matching your search'
                        : `No ${toObjectName} records available`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Metadata */}
            <div>
              <Label className="mb-2 block">Relationship Notes (Optional)</Label>
              <Textarea
                value={(metadata.notes as string) || ''}
                onChange={(value) => setMetadata({ ...metadata, notes: value })}
                placeholder="Add any notes about this relationship..."
                rows={3}
              />
            </div>

            {/* Error Message */}
            {createLinkMutation.isError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  Failed to link records. Please try again.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLinkMutation.isPending || !selectedRecordId}
              >
                {createLinkMutation.isPending ? 'Linking...' : 'Link Records'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
