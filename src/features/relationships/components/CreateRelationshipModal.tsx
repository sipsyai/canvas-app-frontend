/**
 * CreateRelationshipModal Component
 *
 * Modal for creating new relationships with Stitch design
 * - Relationship type selection with visual diagrams
 * - Schema visualization
 * - Field labels configuration
 */

import { useState } from 'react';
import { useCreateRelationship } from '@/lib/hooks/useRelationships';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { X, Box, ArrowRight, ArrowRightLeft, AlertCircle } from 'lucide-react';
import type { RelationshipType } from '@/lib/api/relationships.api';

interface CreateRelationshipModalProps {
  fromObjectId: string;
  fromObjectName: string;
  toObjectId: string;
  toObjectName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateRelationshipModal({
  fromObjectId,
  fromObjectName,
  toObjectId,
  toObjectName,
  onClose,
  onSuccess,
}: CreateRelationshipModalProps) {
  const [name, setName] = useState(
    `${fromObjectName}_${toObjectName}`.toLowerCase().replace(/\s+/g, '_')
  );
  const [type, setType] = useState<RelationshipType>('1:N');
  const [fromLabel, setFromLabel] = useState(toObjectName);
  const [toLabel, setToLabel] = useState(fromObjectName);

  const createMutation = useCreateRelationship();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        name,
        from_object_id: fromObjectId,
        to_object_id: toObjectId,
        type,
        from_label: fromLabel || undefined,
        to_label: toLabel || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create relationship:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Create Relationship
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Connect {fromObjectName} with {toObjectName}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="px-2" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Schema Visualization */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 text-center">
                Relationship Preview
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                    <Box className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      {fromObjectName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Source</p>
                </div>

                <div className="flex flex-col items-center">
                  {type === '1:N' ? (
                    <ArrowRight className="h-8 w-8 text-slate-400" />
                  ) : (
                    <ArrowRightLeft className="h-8 w-8 text-slate-400" />
                  )}
                  <span className="text-xs text-slate-400 mt-1">{type}</span>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                    <Box className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {toObjectName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Target</p>
                </div>
              </div>
            </div>

            {/* Relationship Name */}
            <div>
              <Label htmlFor="name">Relationship Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(value) => setName(value)}
                placeholder="e.g., contact_companies"
                isRequired
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Unique identifier for this relationship (lowercase, no spaces)
              </p>
            </div>

            {/* Relationship Type */}
            <div>
              <Label className="mb-3 block">Relationship Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('1:N')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    type === '1:N'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      One-to-Many
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    One {fromObjectName} can have many {toObjectName}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setType('N:N')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    type === 'N:N'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Many-to-Many
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Many {fromObjectName} ↔ Many {toObjectName}
                  </p>
                </button>
              </div>
            </div>

            {/* Labels */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromLabel">Label on {fromObjectName}</Label>
                <Input
                  id="fromLabel"
                  value={fromLabel}
                  onChange={(value) => setFromLabel(value)}
                  placeholder={`e.g., ${toObjectName}`}
                  className="mt-1.5"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Shown when viewing {fromObjectName} records
                </p>
              </div>

              <div>
                <Label htmlFor="toLabel">Label on {toObjectName}</Label>
                <Input
                  id="toLabel"
                  value={toLabel}
                  onChange={(value) => setToLabel(value)}
                  placeholder={`e.g., ${fromObjectName}`}
                  className="mt-1.5"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Shown when viewing {toObjectName} records
                </p>
              </div>
            </div>

            {/* Error Message */}
            {createMutation.isError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  Failed to create relationship. Please try again.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
                {createMutation.isPending ? 'Creating...' : 'Create Relationship'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
