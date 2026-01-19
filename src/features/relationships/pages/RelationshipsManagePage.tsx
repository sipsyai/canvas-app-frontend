import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useObjectRelationships,
  useDeleteRelationship,
} from '@/lib/hooks/useRelationships';
import { useObjects } from '@/features/objects/hooks/useObjects';
import { Button } from '@/components/ui/Button';
import { CreateRelationshipModal } from '../components/CreateRelationshipModal';
import { ArrowLeft, Plus, Trash2, ArrowRight, ArrowRightLeft } from 'lucide-react';
import type { Object as ObjectType } from '@/types/object.types';

export function RelationshipsManagePage() {
  const { objectId } = useParams<{ objectId: string }>();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTargetObjectId, setSelectedTargetObjectId] = useState<string>('');

  const { data: allObjects } = useObjects();
  const { data: relationships, isLoading } = useObjectRelationships(objectId);
  const deleteMutation = useDeleteRelationship();

  const currentObj = allObjects?.find((obj: ObjectType) => obj.id === objectId);
  const availableObjects = allObjects?.filter((obj: ObjectType) => obj.id !== objectId) || [];

  const handleDelete = async (relationshipId: string) => {
    if (!confirm('Are you sure you want to delete this relationship?')) return;

    try {
      await deleteMutation.mutateAsync(relationshipId);
    } catch (error) {
      console.error('Failed to delete relationship:', error);
    }
  };

  const handleCreateRelationship = (targetObjectId: string) => {
    setSelectedTargetObjectId(targetObjectId);
    setIsCreateModalOpen(true);
  };

  if (!currentObj) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-500">Object not found</p>
        </div>
      </div>
    );
  }

  const selectedTargetObject = allObjects?.find((obj) => obj.id === selectedTargetObjectId);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/objects/${objectId}/fields`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fields
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Relationships for {currentObj.name}
              </h1>
              <p className="text-gray-500 mt-1">
                Define how this object relates to other objects
              </p>
            </div>
          </div>
        </div>

        {/* Existing Relationships */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Existing Relationships</h2>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading relationships...</div>
          ) : relationships && relationships.length > 0 ? (
            <div className="space-y-3">
              {relationships.map((rel) => {
                const isSource = rel.from_object_id === objectId;
                const relatedObjectId = isSource ? rel.to_object_id : rel.from_object_id;
                const relatedObject = allObjects?.find((obj: ObjectType) => obj.id === relatedObjectId);
                const label = isSource ? rel.from_label : rel.to_label;

                return (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded font-medium text-sm">
                          {currentObj.name}
                        </div>

                        {rel.type === '1:N' ? (
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                        )}

                        <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded font-medium text-sm">
                          {relatedObject?.name || relatedObjectId}
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Type:</span> {rel.type}
                        </div>
                        {label && (
                          <div>
                            <span className="font-medium">Label:</span> {label}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rel.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No relationships defined yet
            </div>
          )}
        </div>

        {/* Create New Relationship */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Relationship</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select a target object to create a relationship with {currentObj.name}
          </p>

          {availableObjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableObjects.map((obj: ObjectType) => (
                <button
                  key={obj.id}
                  onClick={() => handleCreateRelationship(obj.id)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center text-xl"
                      style={{ backgroundColor: obj.color || '#6366f1' }}
                    >
                      {obj.icon || '📦'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{obj.name}</div>
                      <div className="text-xs text-gray-500">{obj.description}</div>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No other objects available to create relationships with
            </div>
          )}
        </div>
      </div>

      {/* Create Relationship Modal */}
      {isCreateModalOpen && selectedTargetObject && (
        <CreateRelationshipModal
          fromObjectId={objectId!}
          fromObjectName={currentObj.name}
          toObjectId={selectedTargetObjectId}
          toObjectName={selectedTargetObject.name}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedTargetObjectId('');
          }}
          onSuccess={() => {
            // Modal will close automatically
          }}
        />
      )}
    </div>
  );
}
