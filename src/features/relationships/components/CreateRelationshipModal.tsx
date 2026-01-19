import { useState } from 'react';
import { useCreateRelationship } from '@/lib/hooks/useRelationships';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RadioGroup } from '@/components/ui/RadioGroup';
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
  const [name, setName] = useState(`${fromObjectName}_${toObjectName}`.toLowerCase().replace(/\s+/g, '_'));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Create Relationship</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Relationship Name */}
          <div>
            <Label htmlFor="name">Relationship Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., contact_companies"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Unique identifier for this relationship
            </p>
          </div>

          {/* Relationship Type */}
          <div>
            <Label>Relationship Type</Label>
            <RadioGroup
              value={type}
              onChange={(value) => setType(value as RelationshipType)}
              options={[
                {
                  value: '1:N',
                  label: '1:N (One-to-Many)',
                  description: `One ${fromObjectName} can have many ${toObjectName}`,
                },
                {
                  value: 'N:N',
                  label: 'N:N (Many-to-Many)',
                  description: `Many ${fromObjectName} ↔ Many ${toObjectName}`,
                },
              ]}
            />
          </div>

          {/* Direction Visualization */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Relationship Direction:</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded font-medium">
                  {fromObjectName}
                </div>
                <p className="text-xs text-gray-500 mt-1">Source</p>
              </div>

              <div className="text-2xl text-gray-400">
                {type === '1:N' ? '→' : '↔'}
              </div>

              <div className="text-center">
                <div className="bg-green-100 text-green-700 px-3 py-2 rounded font-medium">
                  {toObjectName}
                </div>
                <p className="text-xs text-gray-500 mt-1">Target</p>
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromLabel">Label on {fromObjectName}</Label>
              <Input
                id="fromLabel"
                value={fromLabel}
                onChange={(e) => setFromLabel(e.target.value)}
                placeholder={`e.g., ${toObjectName}`}
              />
            </div>

            <div>
              <Label htmlFor="toLabel">Label on {toObjectName}</Label>
              <Input
                id="toLabel"
                value={toLabel}
                onChange={(e) => setToLabel(e.target.value)}
                placeholder={`e.g., ${fromObjectName}`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Relationship'}
            </Button>
          </div>

          {/* Error Message */}
          {createMutation.isError && (
            <div className="text-sm text-red-600">
              Failed to create relationship. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
