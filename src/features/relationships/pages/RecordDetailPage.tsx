import { useParams, useNavigate } from 'react-router-dom';
import { useRecord } from '@/features/records/hooks/useRecords';
import { useObjectRelationships } from '@/lib/hooks/useRelationships';
import { Button } from '@/components/ui/Button';
import { RelatedRecordsPanel } from '../components/RelatedRecordsPanel';
import { ArrowLeft, Edit } from 'lucide-react';

export function RecordDetailPage() {
  const { objectId, recordId } = useParams<{ objectId: string; recordId: string }>();
  const navigate = useNavigate();

  const { data: record, isLoading: isLoadingRecord } = useRecord(objectId!, recordId!);
  const { data: relationships, isLoading: isLoadingRelationships } =
    useObjectRelationships(objectId);

  const getRecordDisplayName = () => {
    if (!record) return 'Record';

    // Try to find a name-like field
    const nameField = Object.entries(record.data).find(([key]) =>
      key.toLowerCase().includes('name')
    );
    if (nameField) return String(nameField[1]);

    // Fall back to first field value
    const firstValue = Object.values(record.data)[0];
    return firstValue ? String(firstValue) : record.id;
  };

  if (isLoadingRecord || isLoadingRelationships) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12 text-gray-500">Loading record details...</div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-500">Record not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/objects/${objectId}/records`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Records
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {getRecordDisplayName()}
                </h1>
                <p className="text-gray-500 mt-1 text-sm">Record ID: {record.id}</p>
              </div>

              <Button
                onClick={() => {
                  // TODO: Implement edit functionality
                  alert('Edit functionality coming soon');
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Record
              </Button>
            </div>

            {/* Record Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(record.data).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 pb-3">
                  <div className="text-sm font-medium text-gray-500">{key}</div>
                  <div className="text-base text-gray-900 mt-1">
                    {value !== null && value !== undefined ? String(value) : '-'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
              Created: {new Date(record.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Related Records - Bidirectional Display */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Related Records</h2>

          {relationships && relationships.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {relationships.map((relationship) => (
                <RelatedRecordsPanel
                  key={relationship.id}
                  recordId={record.id}
                  recordName={getRecordDisplayName()}
                  relationship={relationship}
                  currentObjectId={objectId!}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500 mb-4">
                No relationships defined for this object
              </p>
              <Button
                variant="secondary"
                onClick={() => navigate(`/objects/${objectId}/relationships`)}
              >
                Define Relationships
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
