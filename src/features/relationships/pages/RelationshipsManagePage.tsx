/**
 * RelationshipsManagePage Component
 *
 * Manage object relationships with Stitch design
 * - Table view of existing relationships
 * - Schema visualization with object pills
 * - Create new relationship section
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useObjectRelationships,
  useDeleteRelationship,
} from '@/lib/hooks/useRelationships';
import { useObjects } from '@/features/objects/hooks/useObjects';
import { useNavigationStore } from '@/stores/navigationStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { CreateRelationshipModal } from '../components/CreateRelationshipModal';
import {
  Plus,
  Trash2,
  ArrowRight,
  ArrowRightLeft,
  LinkIcon,
  MoreHorizontal,
  Box,
  Clock,
} from 'lucide-react';
import type { Object as ObjectType } from '@/types/object.types';

export function RelationshipsManagePage() {
  const { objectId } = useParams<{ objectId: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigationStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTargetObjectId, setSelectedTargetObjectId] = useState<string>('');

  const { data: allObjects } = useObjects();
  const { data: relationships, isLoading } = useObjectRelationships(objectId);
  const deleteMutation = useDeleteRelationship();

  const currentObj = allObjects?.find((obj: ObjectType) => obj.id === objectId);
  const availableObjects = allObjects?.filter((obj: ObjectType) => obj.id !== objectId) || [];

  // Update breadcrumbs
  useEffect(() => {
    if (currentObj) {
      setBreadcrumbs([
        { label: 'Objects', href: '/objects' },
        { label: currentObj.label || currentObj.name, href: `/objects/${objectId}/fields` },
        { label: 'Relationships' },
      ]);
    }
  }, [currentObj, objectId, setBreadcrumbs]);

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

  // Loading state
  if (!currentObj && !isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <p className="text-red-700 dark:text-red-400">Object not found</p>
        </div>
      </div>
    );
  }

  const selectedTargetObject = allObjects?.find((obj) => obj.id === selectedTargetObjectId);
  const objectLabel = currentObj?.label || currentObj?.name || objectId;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-white dark:bg-surface-dark shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
            <LinkIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Relationships
              </h1>
              <Badge variant="purple">{relationships?.length || 0} defined</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Define how {objectLabel} connects to other objects in your system.
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} disabled={availableObjects.length === 0}>
          <Plus className="h-5 w-5" />
          New Relationship
        </Button>
      </div>

      {/* Existing Relationships Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Existing Relationships
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded" />
                ))}
              </div>
            </div>
          ) : relationships && relationships.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Relationship
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Schema
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Labels
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {relationships.map((rel) => {
                    const isSource = rel.from_object_id === objectId;
                    const relatedObjectId = isSource ? rel.to_object_id : rel.from_object_id;
                    const relatedObject = allObjects?.find(
                      (obj: ObjectType) => obj.id === relatedObjectId
                    );
                    const fromLabel = isSource ? rel.from_label : rel.to_label;
                    const toLabel = isSource ? rel.to_label : rel.from_label;

                    return (
                      <tr
                        key={rel.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Relationship Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <LinkIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {rel.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Created {new Date(rel.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="px-6 py-4">
                          <Badge variant={rel.type === '1:N' ? 'blue' : 'purple'}>
                            {rel.type === '1:N' ? 'One-to-Many' : 'Many-to-Many'}
                          </Badge>
                        </td>

                        {/* Schema Visualization */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                              <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {currentObj?.name}
                              </span>
                            </div>

                            {rel.type === '1:N' ? (
                              <ArrowRight className="h-5 w-5 text-slate-400 shrink-0" />
                            ) : (
                              <ArrowRightLeft className="h-5 w-5 text-slate-400 shrink-0" />
                            )}

                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                              <Box className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                {relatedObject?.name || relatedObjectId}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Labels */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                            {fromLabel && (
                              <div>
                                <span className="text-slate-400">From:</span> {fromLabel}
                              </div>
                            )}
                            {toLabel && (
                              <div>
                                <span className="text-slate-400">To:</span> {toLabel}
                              </div>
                            )}
                            {!fromLabel && !toLabel && (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="px-2">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleDelete(rel.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <LinkIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Relationships Yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Create relationships to connect {objectLabel} with other objects in your system.
              </p>
              {availableObjects.length > 0 && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create First Relationship
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Objects Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Connect to Objects
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select an object to create a new relationship with {objectLabel}
          </p>
        </CardHeader>
        <CardContent>
          {availableObjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableObjects.map((obj: ObjectType) => (
                <button
                  key={obj.id}
                  onClick={() => handleCreateRelationship(obj.id)}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                      style={{ backgroundColor: obj.color || '#6366f1' }}
                    >
                      {obj.icon || '📦'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {obj.label || obj.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {obj.description || 'No description'}
                      </div>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <Plus className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Box className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p>No other objects available to create relationships with.</p>
              <Button
                variant="secondary"
                onClick={() => navigate('/objects')}
                className="mt-4"
              >
                Create New Object
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Relationship Modal */}
      {isCreateModalOpen && selectedTargetObject && (
        <CreateRelationshipModal
          fromObjectId={objectId!}
          fromObjectName={currentObj?.name || ''}
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

      {/* New Relationship Modal (when clicking header button without target) */}
      {isCreateModalOpen && !selectedTargetObject && availableObjects.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Select Target Object
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose which object to connect with {objectLabel}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {availableObjects.map((obj: ObjectType) => (
                  <button
                    key={obj.id}
                    onClick={() => handleCreateRelationship(obj.id)}
                    className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: obj.color || '#6366f1' }}
                    >
                      {obj.icon || '📦'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {obj.label || obj.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {obj.description || 'No description'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
