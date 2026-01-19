import { useState } from 'react';
import { useCreateRelationshipRecord } from '@/lib/hooks/useRelationships';
import { useRecords } from '@/features/records/hooks/useRecords';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Search } from 'lucide-react';
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
  const [metadata, setMetadata] = useState<Record<string, any>>({});

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
      alert('Please select a record to link');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Link Records</h2>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-700">
            Linking <span className="font-semibold">{fromRecordName}</span> to a{' '}
            <span className="font-semibold">{toObjectName}</span> record
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search */}
          <div>
            <Label>Search {toObjectName} Records</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${toObjectName}...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Record List */}
          <div>
            <Label>Select Record to Link</Label>
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading records...</div>
              ) : filteredRecords && filteredRecords.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <label
                      key={record.id}
                      className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedRecordId === record.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="record"
                        value={record.id}
                        checked={selectedRecordId === record.id}
                        onChange={(e) => setSelectedRecordId(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {getRecordDisplayName(record)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {Object.entries(record.data)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {searchQuery
                    ? 'No records found matching your search'
                    : `No ${toObjectName} records available`}
                </div>
              )}
            </div>
          </div>

          {/* Optional Metadata */}
          <div>
            <Label>Relationship Notes (Optional)</Label>
            <textarea
              value={metadata.notes || ''}
              onChange={(e) => setMetadata({ ...metadata, notes: e.target.value })}
              placeholder="Add any notes about this relationship..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-20"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
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

          {/* Error Message */}
          {createLinkMutation.isError && (
            <div className="text-sm text-red-600">
              Failed to link records. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
