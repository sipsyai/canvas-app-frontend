# Task: Record Linking UI

**Priority:** 🟡 Medium
**Estimated Time:** 2 gün
**Dependencies:** 01-relationship-definition

---

## Objective

Record'ları tanımlı relationship'ler üzerinden birbirine bağlama (link), bağlantıları görüntüleme ve çözme (unlink) UI'ını oluşturmak. Junction table kullanılarak N:N ve 1:N ilişkileri desteklenir.

---

## Backend API

### Endpoints

#### 1. Link Records (Create)
```
POST /api/relationship-records
```

**Request Format:**
```json
{
  "relationship_id": "rel_contact_opportunity",
  "from_record_id": "rec_ali",
  "to_record_id": "rec_bigdeal",
  "relationship_metadata": {
    "role": "Decision Maker",
    "influence_level": "High"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "lnk_a1b2c3d4",
  "relationship_id": "rel_contact_opportunity",
  "from_record_id": "rec_ali",
  "to_record_id": "rec_bigdeal",
  "relationship_metadata": {
    "role": "Decision Maker",
    "influence_level": "High"
  },
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-18T10:00:00Z"
}
```

#### 2. Get Related Records
```
GET /api/relationship-records/records/{record_id}/related?relationship_id={relationship_id}
```

**Response (200 OK):**
```json
[
  {
    "id": "lnk_a1b2c3d4",
    "relationship_id": "rel_contact_opportunity",
    "from_record_id": "rec_ali",
    "to_record_id": "rec_bigdeal",
    "relationship_metadata": {
      "role": "Decision Maker"
    },
    "created_at": "2026-01-18T10:00:00Z",
    "created_by": "550e8400-e29b-41d4-a716-446655440000"
  }
]
```

#### 3. Unlink Records (Delete)
```
DELETE /api/relationship-records/{link_id}
```

**Response:** 204 No Content

**Backend Documentation:**
→ [POST /api/relationship-records](../../backend-docs/api/08-relationship-records/01-create-relationship-record.md)
→ [GET /api/relationship-records/records/{record_id}/related](../../backend-docs/api/08-relationship-records/02-get-related-records.md)
→ [DELETE /api/relationship-records/{link_id}](../../backend-docs/api/08-relationship-records/03-delete-relationship-record.md)

---

## UI/UX Design

### 1. Related Records Section (Record Detail Page)

```
┌────────────────────────────────────────────────┐
│  Contact: Ali Yılmaz                           │
│  ─────────────────────────────────────────────│
│                                                │
│  📋 Opportunities (3)          [+ Link]        │
│  ┌──────────────────────────────────────────┐ │
│  │ ⚡ BigDeal               $50,000    [×]   │ │
│  │    Role: Decision Maker                   │ │
│  │                                            │ │
│  │ 🎯 MediumDeal            $25,000    [×]   │ │
│  │    Role: Influencer                       │ │
│  │                                            │ │
│  │ 🔥 SmallDeal             $10,000    [×]   │ │
│  │    Role: Evaluator                        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  📦 Products (2)               [+ Link]        │
│  ┌──────────────────────────────────────────┐ │
│  │ 💼 Enterprise License    $5,000     [×]   │ │
│  │ 🛠️ Professional Support  $2,000     [×]   │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### 2. Link Records Dialog

```
┌───────────────────────────────────────────────┐
│  Link Opportunity to Contact                  │
│  ────────────────────────────────────────────│
│                                               │
│  Contact: Ali Yılmaz                          │
│                                               │
│  Select Opportunities to link:                │
│  ┌─────────────────────────────────────────┐ │
│  │ 🔍 Search opportunities...               │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  Available (5):                               │
│  ┌─────────────────────────────────────────┐ │
│  │ □ SuperDeal        $100,000    Stage: 3  │ │
│  │ □ NewDeal          $75,000     Stage: 2  │ │
│  │ □ ProspectDeal     $40,000     Stage: 1  │ │
│  │ □ TestDeal         $15,000     Stage: 2  │ │
│  │ □ FutureDeal       $90,000     Stage: 1  │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  Relationship Metadata (Optional):            │
│  ┌─────────────────────────────────────────┐ │
│  │ Role:                                    │ │
│  │ [Decision Maker ▼]                       │ │
│  │                                          │ │
│  │ Influence Level:                         │ │
│  │ [High ▼]                                 │ │
│  │                                          │ │
│  │ Notes:                                   │ │
│  │ [                                      ] │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  [Cancel]              [Link 3 Records]       │
└───────────────────────────────────────────────┘
```

### 3. Bulk Link Operations

```
┌───────────────────────────────────────────────┐
│  Bulk Link Products to Category               │
│  ────────────────────────────────────────────│
│                                               │
│  Category: Electronics                        │
│                                               │
│  □ Select All (10 available)                  │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ ☑ Laptop Pro          $1,200             │ │
│  │ ☑ Wireless Mouse      $25                │ │
│  │ ☑ Mechanical Keyboard $89                │ │
│  │ □ Office Chair        $299               │ │
│  │ □ Desk Lamp          $45                 │ │
│  │ ☑ USB-C Cable        $15                 │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  3 items selected                             │
│                                               │
│  [Cancel]                    [Link Selected]  │
└───────────────────────────────────────────────┘
```

### 4. Drag-and-Drop Linking (Optional)

```
┌────────────────────────────────────────────────┐
│  Products                   Categories         │
│  ─────────────────────────────────────────────│
│                                                │
│  📱 Phone                → 📂 Electronics      │
│  (drag to link)            (drop here)         │
│                                                │
│  💼 Laptop               → 📂 Office           │
│  🖱️ Mouse                                      │
│  ⌨️ Keyboard             → 📂 Accessories      │
│                                                │
└────────────────────────────────────────────────┘
```

### UI States

1. **Empty State** - No linked records
   ```
   No opportunities linked yet.
   [+ Link Opportunity]
   ```

2. **Loading State** - Fetching related records
   ```
   Loading related records...
   [Spinner animation]
   ```

3. **Linked State** - Display linked records with unlink button

4. **Linking State** - Dialog open, searching records

5. **Unlinking Confirmation** - "Are you sure you want to unlink?"

---

## Technical Details

### File Structure

```
src/
├── features/
│   └── relationships/
│       ├── components/
│       │   ├── LinkRecordsDialog.tsx           ⭐ Link records modal
│       │   ├── LinkedRecordsList.tsx           ⭐ Display linked records
│       │   ├── RelatedRecordsSection.tsx       ⭐ Section container
│       │   ├── RecordSearchSelector.tsx        ⭐ Searchable record picker
│       │   ├── BulkLinkDialog.tsx              ⭐ Bulk link operations
│       │   └── UnlinkConfirmDialog.tsx         ⭐ Unlink confirmation
│       ├── hooks/
│       │   ├── useLinkRecords.ts               ⭐ Link mutation hook
│       │   ├── useUnlinkRecord.ts              ⭐ Unlink mutation hook
│       │   ├── useRelatedRecords.ts            ⭐ Get related records query
│       │   └── useBulkLinkRecords.ts           ⭐ Bulk link hook
│       └── types/
│           └── relationship-record.types.ts    ⭐ TypeScript types
├── lib/
│   └── api/
│       └── relationship-records.api.ts         ⭐ API calls
└── components/
    └── ui/
        ├── SearchInput.tsx                     ⭐ Search component
        └── ConfirmDialog.tsx                   ⭐ Confirmation dialog
```

### Component Implementation

#### LinkRecordsDialog.tsx

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLinkRecords } from '../hooks/useLinkRecords';
import { useRecordsQuery } from '@/features/records/hooks/useRecordsQuery';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const linkRecordsSchema = z.object({
  selectedRecords: z.array(z.string()).min(1, 'Select at least one record'),
  metadata: z.object({
    role: z.string().optional(),
    influence_level: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

type LinkRecordsFormData = z.infer<typeof linkRecordsSchema>;

interface LinkRecordsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  relationshipId: string;
  relationshipName: string;
  sourceRecordId: string;
  sourceRecordName: string;
  targetObjectId: string;
  targetObjectName: string;
}

export const LinkRecordsDialog = ({
  isOpen,
  onClose,
  relationshipId,
  relationshipName,
  sourceRecordId,
  sourceRecordName,
  targetObjectId,
  targetObjectName,
}: LinkRecordsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<LinkRecordsFormData>({
    resolver: zodResolver(linkRecordsSchema),
  });

  // Fetch available records to link
  const { data: availableRecords, isLoading } = useRecordsQuery({
    objectId: targetObjectId,
    filters: {},
    page: 1,
    pageSize: 50,
  });

  const { mutate: linkRecords, isPending } = useLinkRecords({
    onSuccess: () => {
      onClose();
      setSelectedRecords([]);
    },
  });

  const filteredRecords = availableRecords?.records.filter((record) =>
    JSON.stringify(record.data).toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleRecord = (recordId: string) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const onSubmit = (data: LinkRecordsFormData) => {
    linkRecords({
      relationshipId,
      links: selectedRecords.map(recordId => ({
        from_record_id: sourceRecordId,
        to_record_id: recordId,
        relationship_metadata: data.metadata,
      })),
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Link ${targetObjectName} to ${sourceRecordName}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search {targetObjectName}
          </label>
          <SearchInput
            placeholder={`Search ${targetObjectName.toLowerCase()}...`}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        {/* Available Records List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Available ({filteredRecords.length})
            </label>
            <button
              type="button"
              onClick={() => setSelectedRecords(filteredRecords.map(r => r.id))}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Select All
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No records found</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredRecords.map((record) => (
                  <label
                    key={record.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedRecords.includes(record.id)}
                      onChange={() => toggleRecord(record.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {record.data.fld_name || record.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Object.entries(record.data)
                          .filter(([key]) => key !== 'fld_name')
                          .slice(0, 2)
                          .map(([_, value]) => String(value))
                          .join(' • ')}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Relationship Metadata */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Relationship Metadata (Optional)
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Role</label>
              <Select {...register('metadata.role')}>
                <option value="">Select role...</option>
                <option value="Decision Maker">Decision Maker</option>
                <option value="Influencer">Influencer</option>
                <option value="Evaluator">Evaluator</option>
                <option value="Gatekeeper">Gatekeeper</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Influence Level</label>
              <Select {...register('metadata.influence_level')}>
                <option value="">Select level...</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Notes</label>
              <Input
                type="text"
                placeholder="Add notes..."
                {...register('metadata.notes')}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || selectedRecords.length === 0}
            loading={isPending}
          >
            {isPending
              ? 'Linking...'
              : `Link ${selectedRecords.length} Record${selectedRecords.length !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
```

#### LinkedRecordsList.tsx

```typescript
import { useState } from 'react';
import { useRelatedRecords } from '../hooks/useRelatedRecords';
import { useUnlinkRecord } from '../hooks/useUnlinkRecord';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';

interface LinkedRecordsListProps {
  recordId: string;
  relationshipId: string;
  relationshipLabel: string;
  onAddClick: () => void;
}

export const LinkedRecordsList = ({
  recordId,
  relationshipId,
  relationshipLabel,
  onAddClick,
}: LinkedRecordsListProps) => {
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const { data: relatedRecords, isLoading } = useRelatedRecords({
    recordId,
    relationshipId,
  });

  const { mutate: unlinkRecord, isPending: isUnlinking } = useUnlinkRecord({
    onSuccess: () => {
      setUnlinkingId(null);
    },
  });

  const handleUnlink = (linkId: string) => {
    unlinkRecord({ linkId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {relationshipLabel} ({relatedRecords?.length || 0})
        </h3>
        <Button onClick={onAddClick} size="sm">
          + Link
        </Button>
      </div>

      {/* Empty State */}
      {!relatedRecords || relatedRecords.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-600 mb-3">No {relationshipLabel.toLowerCase()} linked yet.</p>
          <Button onClick={onAddClick} variant="secondary" size="sm">
            + Link {relationshipLabel}
          </Button>
        </div>
      ) : (
        /* Linked Records List */
        <div className="space-y-2">
          {relatedRecords.map((link) => (
            <div
              key={link.id}
              className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">⚡</span>
                  <h4 className="font-medium text-gray-900 truncate">
                    {link.related_record.data.fld_name || link.to_record_id}
                  </h4>
                </div>

                {/* Display relationship metadata */}
                {link.relationship_metadata && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(link.relationship_metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                      >
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Record data preview */}
                <div className="text-sm text-gray-500 mt-1">
                  {Object.entries(link.related_record.data)
                    .filter(([key]) => key !== 'fld_name')
                    .slice(0, 2)
                    .map(([key, value]) => `${key.replace('fld_', '')}: ${value}`)
                    .join(' • ')}
                </div>
              </div>

              {/* Unlink Button */}
              <button
                onClick={() => setUnlinkingId(link.id)}
                className="ml-3 text-gray-400 hover:text-red-600 transition-colors"
                title="Unlink"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Unlink Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!unlinkingId}
        onClose={() => setUnlinkingId(null)}
        onConfirm={() => unlinkingId && handleUnlink(unlinkingId)}
        title="Unlink Record"
        message="Are you sure you want to unlink this record? This action cannot be undone."
        confirmText="Unlink"
        confirmVariant="danger"
        isLoading={isUnlinking}
      />
    </div>
  );
};
```

#### RelatedRecordsSection.tsx

```typescript
import { useState } from 'react';
import { useObjectRelationships } from '../hooks/useObjectRelationships';
import { LinkedRecordsList } from './LinkedRecordsList';
import { LinkRecordsDialog } from './LinkRecordsDialog';
import { Spinner } from '@/components/ui/Spinner';

interface RelatedRecordsSectionProps {
  recordId: string;
  objectId: string;
  recordName: string;
}

export const RelatedRecordsSection = ({
  recordId,
  objectId,
  recordName,
}: RelatedRecordsSectionProps) => {
  const [linkDialogState, setLinkDialogState] = useState<{
    isOpen: boolean;
    relationship: any;
  }>({
    isOpen: false,
    relationship: null,
  });

  const { data: relationships, isLoading } = useObjectRelationships({ objectId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!relationships || relationships.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No relationships defined for this object.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Related Records</h2>

      {relationships.map((relationship) => (
        <LinkedRecordsList
          key={relationship.id}
          recordId={recordId}
          relationshipId={relationship.id}
          relationshipLabel={relationship.from_label}
          onAddClick={() => setLinkDialogState({ isOpen: true, relationship })}
        />
      ))}

      {/* Link Records Dialog */}
      {linkDialogState.relationship && (
        <LinkRecordsDialog
          isOpen={linkDialogState.isOpen}
          onClose={() => setLinkDialogState({ isOpen: false, relationship: null })}
          relationshipId={linkDialogState.relationship.id}
          relationshipName={linkDialogState.relationship.name}
          sourceRecordId={recordId}
          sourceRecordName={recordName}
          targetObjectId={linkDialogState.relationship.to_object_id}
          targetObjectName={linkDialogState.relationship.to_label}
        />
      )}
    </div>
  );
};
```

#### useLinkRecords.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { linkRecordsAPI } from '@/lib/api/relationship-records.api';
import { toast } from '@/utils/toast';

interface LinkRecordData {
  from_record_id: string;
  to_record_id: string;
  relationship_metadata?: Record<string, any>;
}

interface UseLinkRecordsParams {
  relationshipId: string;
  links: LinkRecordData[];
}

interface UseLinkRecordsOptions {
  onSuccess?: () => void;
}

export const useLinkRecords = (options?: UseLinkRecordsOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ relationshipId, links }: UseLinkRecordsParams) => {
      // Execute all link operations in parallel
      const promises = links.map(link =>
        linkRecordsAPI({
          relationship_id: relationshipId,
          ...link,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      // Invalidate related records queries
      variables.links.forEach(link => {
        queryClient.invalidateQueries({
          queryKey: ['related-records', link.from_record_id],
        });
        queryClient.invalidateQueries({
          queryKey: ['related-records', link.to_record_id],
        });
      });

      toast.success(
        `Successfully linked ${variables.links.length} record${variables.links.length !== 1 ? 's' : ''}`
      );
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to link records');
    },
  });
};
```

#### useUnlinkRecord.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unlinkRecordAPI } from '@/lib/api/relationship-records.api';
import { toast } from '@/utils/toast';

interface UseUnlinkRecordParams {
  linkId: string;
}

interface UseUnlinkRecordOptions {
  onSuccess?: () => void;
}

export const useUnlinkRecord = (options?: UseUnlinkRecordOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId }: UseUnlinkRecordParams) => {
      await unlinkRecordAPI(linkId);
    },
    onSuccess: () => {
      // Invalidate all related records queries
      queryClient.invalidateQueries({
        queryKey: ['related-records'],
      });

      toast.success('Record unlinked successfully');
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to unlink record');
    },
  });
};
```

#### useRelatedRecords.ts

```typescript
import { useQuery } from '@tanstack/react-query';
import { getRelatedRecordsAPI } from '@/lib/api/relationship-records.api';

interface UseRelatedRecordsParams {
  recordId: string;
  relationshipId: string;
  enabled?: boolean;
}

export const useRelatedRecords = ({
  recordId,
  relationshipId,
  enabled = true,
}: UseRelatedRecordsParams) => {
  return useQuery({
    queryKey: ['related-records', recordId, relationshipId],
    queryFn: () => getRelatedRecordsAPI(recordId, relationshipId),
    enabled: enabled && !!recordId && !!relationshipId,
    staleTime: 30000, // 30 seconds
  });
};
```

#### relationship-records.api.ts

```typescript
import { apiClient } from './client';

export interface RelationshipRecord {
  id: string;
  relationship_id: string;
  from_record_id: string;
  to_record_id: string;
  relationship_metadata?: Record<string, any>;
  created_at: string;
  created_by: string;
  related_record?: any; // The actual linked record data
}

export interface CreateRelationshipRecordRequest {
  relationship_id: string;
  from_record_id: string;
  to_record_id: string;
  relationship_metadata?: Record<string, any>;
}

/**
 * Link two records
 */
export const linkRecordsAPI = async (
  data: CreateRelationshipRecordRequest
): Promise<RelationshipRecord> => {
  const response = await apiClient.post<RelationshipRecord>(
    '/api/relationship-records',
    data
  );
  return response.data;
};

/**
 * Get related records
 * Returns all relationship_records where record_id is EITHER from_record_id OR to_record_id
 */
export const getRelatedRecordsAPI = async (
  recordId: string,
  relationshipId: string
): Promise<RelationshipRecord[]> => {
  const response = await apiClient.get<RelationshipRecord[]>(
    `/api/relationship-records/records/${recordId}/related`,
    {
      params: { relationship_id: relationshipId },
    }
  );
  return response.data;
};

/**
 * Unlink records
 */
export const unlinkRecordAPI = async (linkId: string): Promise<void> => {
  await apiClient.delete(`/api/relationship-records/${linkId}`);
};
```

#### relationship-record.types.ts

```typescript
export interface RelationshipRecord {
  id: string;                          // lnk_xxxxxxxx
  relationship_id: string;             // rel_xxxxxxxx
  from_record_id: string;              // rec_xxxxxxxx
  to_record_id: string;                // rec_xxxxxxxx
  relationship_metadata?: {
    role?: string;
    influence_level?: string;
    notes?: string;
    [key: string]: any;
  };
  created_at: string;
  created_by: string;
  related_record?: Record;             // Populated related record
}

export interface CreateRelationshipRecordRequest {
  relationship_id: string;
  from_record_id: string;
  to_record_id: string;
  relationship_metadata?: Record<string, any>;
}

export interface RelatedRecordsQueryParams {
  recordId: string;
  relationshipId: string;
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - API state management
- `react-hook-form` - Form management
- `zod` - Schema validation
- `axios` - HTTP client

### UI Components (To Be Built/Reused)
- `Dialog` component
- `Button` component
- `SearchInput` component
- `Checkbox` component
- `Select` component
- `ConfirmDialog` component
- `Spinner` component

---

## Acceptance Criteria

- [ ] Related records section görünüyor (record detail page)
- [ ] "Link" butonu çalışıyor → dialog açılıyor
- [ ] Dialog'da searchable record selector çalışıyor
- [ ] Multi-select ile birden fazla record seçilebiliyor
- [ ] Relationship metadata (role, notes) eklenebiliyor
- [ ] Link button ile record'lar bağlanıyor
- [ ] Başarılı link sonrası liste refresh oluyor
- [ ] Linked records doğru görünüyor (metadata ile)
- [ ] Unlink button çalışıyor (confirmation dialog)
- [ ] Unlink sonrası liste güncelleniyor
- [ ] Loading states çalışıyor (skeleton, spinner)
- [ ] Empty state görünüyor (hiç link yoksa)
- [ ] Error handling çalışıyor (toast notifications)
- [ ] Mobile responsive design

---

## Testing Checklist

### Manual Testing

**Link Records:**
- [ ] Dialog açılıyor
- [ ] Search ile record filtreleniyor
- [ ] Multi-select çalışıyor
- [ ] "Select All" butonu çalışıyor
- [ ] Metadata alanları dolduruluyor
- [ ] Link button disabled (seçim yoksa)
- [ ] Link button tıklanıyor → records bağlanıyor
- [ ] Success toast gösteriliyor
- [ ] Dialog kapanıyor
- [ ] Liste güncelleniyor

**Display Linked Records:**
- [ ] Linked records görünüyor
- [ ] Metadata tag'leri görünüyor (role, level)
- [ ] Record count doğru (Opportunities (3))
- [ ] Empty state görünüyor (link yoksa)
- [ ] Loading state görünüyor

**Unlink Records:**
- [ ] Unlink (×) butonu çalışıyor
- [ ] Confirmation dialog açılıyor
- [ ] "Cancel" butonu kapanıyor
- [ ] "Unlink" butonu unlinking yapıyor
- [ ] Success toast gösteriliyor
- [ ] Liste güncelleniyor

**Edge Cases:**
- [ ] Network error → error toast
- [ ] Empty search results → "No records found"
- [ ] Already linked record → duplicate check (optional)
- [ ] Bidirectional query çalışıyor (from/to her iki yönde)

---

## Code Examples

### Complete Link Flow

```typescript
// 1. User clicks "Link Opportunity" button
// 2. LinkRecordsDialog opens
// 3. User searches and selects 3 opportunities
// 4. User adds metadata (role: "Decision Maker")
// 5. User clicks "Link 3 Records"
// 6. useLinkRecords mutation executes
// 7. API calls: POST /api/relationship-records (x3)
// 8. Query invalidation → related records refetch
// 9. Success toast displayed
// 10. Dialog closes
// 11. Linked records appear in list
```

### Bidirectional Query Example

```typescript
// Contact (rec_ali) ↔ Opportunity (rec_bigdeal)
// Link: from_record_id = rec_ali, to_record_id = rec_bigdeal

// Query from Contact side:
getRelatedRecords("rec_ali", "rel_contact_opportunity")
// Returns: [link] (from_record_id matches)

// Query from Opportunity side:
getRelatedRecords("rec_bigdeal", "rel_contact_opportunity")
// Returns: [link] (to_record_id matches)

// Backend handles bidirectional query automatically
```

### Bulk Link Example

```typescript
const { mutate: linkRecords } = useLinkRecords();

// Link 3 products to Electronics category
linkRecords({
  relationshipId: 'rel_product_category',
  links: [
    {
      from_record_id: 'rec_electronics',
      to_record_id: 'rec_laptop',
    },
    {
      from_record_id: 'rec_electronics',
      to_record_id: 'rec_mouse',
    },
    {
      from_record_id: 'rec_electronics',
      to_record_id: 'rec_keyboard',
    },
  ],
});
```

---

## Use Cases

### 1. Link Contact to Opportunity (CRM)

```typescript
// Contact: Ali Yılmaz (rec_ali)
// Opportunity: BigDeal ($50,000)

linkRecords({
  relationship_id: 'rel_contact_opportunity',
  from_record_id: 'rec_ali',
  to_record_id: 'rec_bigdeal',
  relationship_metadata: {
    role: 'Decision Maker',
    influence_level: 'High',
  },
});

// Result: Ali is now linked to BigDeal with "Decision Maker" role
```

### 2. Link Product to Category (E-commerce)

```typescript
// Category: Electronics (rec_electronics)
// Product: Laptop Pro (rec_laptop)

linkRecords({
  relationship_id: 'rel_product_category',
  from_record_id: 'rec_electronics',
  to_record_id: 'rec_laptop',
});

// Result: Laptop Pro is now in Electronics category
```

### 3. Many-to-Many: Opportunity ↔ Products

```typescript
// Opportunity: BigDeal (rec_bigdeal)
// Products: Enterprise License, Professional Support

// Link 1:
linkRecords({
  relationship_id: 'rel_opportunity_product',
  from_record_id: 'rec_bigdeal',
  to_record_id: 'rec_enterprise_license',
  relationship_metadata: {
    quantity: 10,
    discount: '15%',
  },
});

// Link 2:
linkRecords({
  relationship_id: 'rel_opportunity_product',
  from_record_id: 'rec_bigdeal',
  to_record_id: 'rec_professional_support',
  relationship_metadata: {
    quantity: 5,
    discount: '10%',
  },
});

// Result: BigDeal has 2 products with junction metadata
```

---

## Resources

### Backend Documentation
- [POST /api/relationship-records](../../backend-docs/api/08-relationship-records/01-create-relationship-record.md)
- [GET /api/relationship-records/records/{record_id}/related](../../backend-docs/api/08-relationship-records/02-get-related-records.md)
- [DELETE /api/relationship-records/{link_id}](../../backend-docs/api/08-relationship-records/03-delete-relationship-record.md)
- [Relationship Records API Overview](../../backend-docs/api/08-relationship-records/README.md)

### Frontend Libraries
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hook Form Docs](https://react-hook-form.com/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Record Linking UI task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/07-relationships/02-record-linking-ui.md

Requirements:
1. Create src/features/relationships/components/LinkRecordsDialog.tsx - Modal for linking records with searchable selector
2. Create src/features/relationships/components/LinkedRecordsList.tsx - Display linked records with unlink button
3. Create src/features/relationships/components/RelatedRecordsSection.tsx - Container for all related records
4. Create src/features/relationships/hooks/useLinkRecords.ts - TanStack Query mutation for linking records
5. Create src/features/relationships/hooks/useUnlinkRecord.ts - TanStack Query mutation for unlinking
6. Create src/features/relationships/hooks/useRelatedRecords.ts - Query hook for fetching related records
7. Create src/lib/api/relationship-records.api.ts - API functions (linkRecordsAPI, getRelatedRecordsAPI, unlinkRecordAPI)
8. Create src/features/relationships/types/relationship-record.types.ts - TypeScript type definitions

CRITICAL REQUIREMENTS:
- Backend uses junction table (relationship_records)
- Support bidirectional queries (record can be from_record_id OR to_record_id)
- Allow relationship_metadata (JSONB) for junction data (role, notes, etc.)
- Multi-select records in link dialog
- Searchable record selector with filtering
- Bulk link operations (link multiple records at once)
- Unlink confirmation dialog before deleting
- Display relationship metadata as tags (role, influence_level)
- Loading states, empty states, error handling
- Query invalidation after link/unlink operations
- Mobile responsive design with Tailwind CSS 4

API Endpoints:
- POST /api/relationship-records (create link)
- GET /api/relationship-records/records/{record_id}/related?relationship_id={id} (get related)
- DELETE /api/relationship-records/{link_id} (unlink)

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** ../08-applications/ (App management)
