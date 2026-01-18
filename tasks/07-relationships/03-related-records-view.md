# Task: Related Records View

**Priority:** 🟡 Medium
**Estimated Time:** 1.5 gün
**Dependencies:** 02-record-linking-ui

---

## Objective

Bir record'un detay sayfasında, ilişkili olduğu diğer record'ları relationship type'larına göre gruplandırılmış şekilde göstermek.

---

## Backend API

### Endpoint
```
GET /api/relationship-records/records/{record_id}/related
```

### Request Format

**Path Parameters:**
- `record_id` - Record ID (rec_xxxxxxxx)

**Query Parameters:**
- `relationship_id` - Relationship ID (rel_xxxxxxxx) **[ZORUNLU]**

### Response
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
  },
  {
    "id": "lnk_b2c3d4e5",
    "relationship_id": "rel_contact_opportunity",
    "from_record_id": "rec_ali",
    "to_record_id": "rec_mediumdeal",
    "relationship_metadata": {
      "role": "Influencer"
    },
    "created_at": "2026-01-18T11:00:00Z",
    "created_by": "550e8400-e29b-41d4-a716-446655440000"
  }
]
```

**Response Fields:**
- `id` - Link ID (lnk_xxxxxxxx)
- `relationship_id` - Relationship ID
- `from_record_id` - Source record ID
- `to_record_id` - Target record ID
- `relationship_metadata` - İlişkiye özel metadata (opsiyonel)
- `created_at` - Bağlantı oluşturulma zamanı
- `created_by` - Bağlantıyı oluşturan kullanıcı UUID

### Error Responses
- `422 Unprocessable Entity` - relationship_id eksik
- `401 Unauthorized` - Authentication hatası

**Backend Documentation:**
→ [GET /api/relationship-records/records/{record_id}/related](../../backend-docs/api/08-relationship-records/02-get-related-records.md)

---

## UI/UX Design

### Layout - Related Records Panel (Sidebar)
```
┌────────────────────────────────────────────────────────────┐
│  Record Detail: Ali (Contact)                              │
│  ┌──────────────────────┬──────────────────────────────┐  │
│  │                      │  Related Records             │  │
│  │  Main Details        │  ┌────────────────────────┐  │  │
│  │  ┌────────────┐      │  │ 📋 Opportunities (3)   │  │  │
│  │  │ Name: Ali  │      │  │ [+ Add New]            │  │  │
│  │  │ Email: ... │      │  ├────────────────────────┤  │  │
│  │  └────────────┘      │  │ ⚡ Big Deal            │  │  │
│  │                      │  │ Role: Decision Maker   │  │  │
│  │  Fields              │  │ [View] [Unlink]        │  │  │
│  │  ...                 │  ├────────────────────────┤  │  │
│  │                      │  │ 💼 Medium Deal         │  │  │
│  │                      │  │ Role: Influencer       │  │  │
│  │                      │  │ [View] [Unlink]        │  │  │
│  │                      │  └────────────────────────┘  │  │
│  │                      │                              │  │
│  │                      │  ┌────────────────────────┐  │  │
│  │                      │  │ 🏢 Organizations (1)   │  │  │
│  │                      │  │ [+ Add New]            │  │  │
│  │                      │  ├────────────────────────┤  │  │
│  │                      │  │ 🏢 Acme Corp           │  │  │
│  │                      │  │ Position: Manager      │  │  │
│  │                      │  │ [View] [Unlink]        │  │  │
│  │                      │  └────────────────────────┘  │  │
│  │                      │                              │  │
│  │                      │  ┌────────────────────────┐  │  │
│  │                      │  │ 🏷️ Product Categories  │  │  │
│  │                      │  │ (0) [+ Add New]        │  │  │
│  │                      │  └────────────────────────┘  │  │
│  └──────────────────────┴──────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Relationship Group Card
```
┌────────────────────────────────────┐
│ 📋 Opportunities (3)     [+ Add]   │
├────────────────────────────────────┤
│ ⚡ Big Deal                         │
│ Role: Decision Maker               │
│ Amount: $500,000                   │
│ [View] [Unlink]                    │
├────────────────────────────────────┤
│ 💼 Medium Deal                     │
│ Role: Influencer                   │
│ Amount: $100,000                   │
│ [View] [Unlink]                    │
├────────────────────────────────────┤
│ 🔥 Small Deal                      │
│ Role: Sponsor                      │
│ Amount: $25,000                    │
│ [View] [Unlink]                    │
└────────────────────────────────────┘
```

### Mini Table View (Alternative)
```
┌────────────────────────────────────────────────────────┐
│ 📋 Opportunities (3)                         [+ Add]   │
├──────────────────┬──────────────┬─────────────────────┤
│ Name             │ Role         │ Amount     │ Actions │
├──────────────────┼──────────────┼─────────────────────┤
│ ⚡ Big Deal      │ Decision     │ $500,000   │ [•••]   │
│ 💼 Medium Deal   │ Influencer   │ $100,000   │ [•••]   │
│ 🔥 Small Deal    │ Sponsor      │ $25,000    │ [•••]   │
└──────────────────┴──────────────┴─────────────────────┘
```

### States
- **Loading** - Skeleton loaders
- **Empty** - "No {relationship_name} found" + [+ Add New] button
- **Populated** - Mini cards/table with records
- **Error** - Error mesajı + retry button

### UI Components
1. **RelatedRecordsPanel**
   - Tüm relationship gruplarını listeler
   - Her grup collapsible (açılıp kapanabilir)
   - Sticky position (sidebar)

2. **RelationshipGroup**
   - Relationship type başlığı + count badge
   - [+ Add New] button
   - Related records listesi

3. **RelatedRecordCard** (Mini Card)
   - Record başlığı (primary field)
   - 2-3 önemli field göster
   - Relationship metadata (role, status, etc.)
   - [View] [Unlink] buttons

4. **RelatedRecordsTable** (Alternative)
   - Tabular format
   - 3-4 columns
   - Actions dropdown [View, Unlink, Edit Link]

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── relationships/
│       ├── components/
│       │   ├── RelatedRecordsPanel.tsx       ⭐ Main panel
│       │   ├── RelationshipGroup.tsx         ⭐ Group by relationship
│       │   ├── RelatedRecordCard.tsx         ⭐ Mini card
│       │   └── RelatedRecordsTable.tsx       ⭐ Table view
│       ├── hooks/
│       │   ├── useRelatedRecords.ts          ⭐ Fetch related records
│       │   └── useUnlinkRecord.ts            ⭐ Unlink mutation
│       └── types/
│           └── relationship.types.ts         ⭐ TypeScript types
└── lib/
    └── api/
        └── relationship-records.api.ts       ⭐ API calls
```

### Component Implementation

#### RelatedRecordsPanel.tsx
```typescript
import { useRelatedRecords } from '../hooks/useRelatedRecords';
import { RelationshipGroup } from './RelationshipGroup';

interface RelatedRecordsPanelProps {
  recordId: string;
  tableId: string;
}

export const RelatedRecordsPanel = ({ recordId, tableId }: RelatedRecordsPanelProps) => {
  // Fetch all relationships for this table
  const { data: relationships = [] } = useRelationships(tableId);

  return (
    <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto sticky top-0 h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          İlişkili Kayıtlar
        </h2>

        <div className="space-y-4">
          {relationships.map((relationship) => (
            <RelationshipGroup
              key={relationship.id}
              recordId={recordId}
              relationship={relationship}
            />
          ))}
        </div>

        {relationships.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Bu tabloda henüz ilişki tanımlanmamış</p>
          </div>
        )}
      </div>
    </aside>
  );
};
```

#### RelationshipGroup.tsx
```typescript
import { useState } from 'react';
import { useRelatedRecords } from '../hooks/useRelatedRecords';
import { RelatedRecordCard } from './RelatedRecordCard';
import { Button } from '@/components/ui/Button';
import { ChevronDown, Plus } from 'lucide-react';

interface RelationshipGroupProps {
  recordId: string;
  relationship: Relationship;
}

export const RelationshipGroup = ({ recordId, relationship }: RelationshipGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch related records for this specific relationship
  const { data: relatedRecords = [], isLoading } = useRelatedRecords({
    recordId,
    relationshipId: relationship.id,
  });

  const handleAddNew = () => {
    // Open AddRelatedRecordModal
    console.log('Add new related record');
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isExpanded ? 'transform rotate-0' : 'transform -rotate-90'
            }`}
          />
          <span className="font-medium text-sm text-gray-900">
            {relationship.relationship_name}
          </span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {relatedRecords.length}
          </span>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleAddNew();
          }}
        >
          <Plus className="w-4 h-4" />
          Ekle
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {isLoading && (
            <div className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}

          {!isLoading && relatedRecords.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">
                Henüz bağlı {relationship.relationship_name.toLowerCase()} yok
              </p>
              <Button size="sm" variant="outline" onClick={handleAddNew} className="mt-2">
                <Plus className="w-4 h-4 mr-1" />
                İlk kaydı ekle
              </Button>
            </div>
          )}

          {!isLoading && relatedRecords.map((link) => (
            <RelatedRecordCard
              key={link.id}
              link={link}
              relationship={relationship}
              currentRecordId={recordId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

#### RelatedRecordCard.tsx
```typescript
import { useNavigate } from 'react-router-dom';
import { useUnlinkRecord } from '../hooks/useUnlinkRecord';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Unlink } from 'lucide-react';

interface RelatedRecordCardProps {
  link: RelationshipRecord;
  relationship: Relationship;
  currentRecordId: string;
}

export const RelatedRecordCard = ({
  link,
  relationship,
  currentRecordId
}: RelatedRecordCardProps) => {
  const navigate = useNavigate();
  const { mutate: unlinkRecord, isPending } = useUnlinkRecord();

  // Determine which record is the "other" one
  const relatedRecordId = link.from_record_id === currentRecordId
    ? link.to_record_id
    : link.from_record_id;

  // Fetch the actual record data (you'll need useRecord hook)
  const { data: record } = useRecord(relatedRecordId);

  const handleView = () => {
    navigate(`/records/${relatedRecordId}`);
  };

  const handleUnlink = () => {
    if (window.confirm('Bu bağlantıyı kaldırmak istediğinizden emin misiniz?')) {
      unlinkRecord(link.id);
    }
  };

  if (!record) {
    return (
      <div className="p-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Get primary field value (first field in record.data)
  const primaryFieldValue = Object.values(record.data)[0] as string;

  return (
    <div className="p-3 hover:bg-gray-50 transition-colors">
      {/* Record Title */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-900">
          {primaryFieldValue || 'Untitled'}
        </h4>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleView}
            title="Görüntüle"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleUnlink}
            disabled={isPending}
            title="Bağlantıyı kaldır"
          >
            <Unlink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Relationship Metadata */}
      {link.relationship_metadata && (
        <div className="space-y-1">
          {Object.entries(link.relationship_metadata).map(([key, value]) => (
            <div key={key} className="text-xs text-gray-600">
              <span className="font-medium capitalize">{key}:</span>{' '}
              <span>{value as string}</span>
            </div>
          ))}
        </div>
      )}

      {/* Additional Fields (2-3 important ones) */}
      <div className="mt-2 space-y-1">
        {Object.entries(record.data)
          .slice(1, 3) // Skip first (primary), show next 2
          .map(([fieldId, value]) => (
            <div key={fieldId} className="text-xs text-gray-500">
              {String(value)}
            </div>
          ))}
      </div>
    </div>
  );
};
```

#### RelatedRecordsTable.tsx
```typescript
import { useRelatedRecords } from '../hooks/useRelatedRecords';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { DropdownMenu } from '@/components/ui/DropdownMenu';

interface RelatedRecordsTableProps {
  recordId: string;
  relationshipId: string;
}

export const RelatedRecordsTable = ({
  recordId,
  relationshipId
}: RelatedRecordsTableProps) => {
  const { data: relatedRecords = [], isLoading } = useRelatedRecords({
    recordId,
    relationshipId,
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={4}>
                <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && relatedRecords.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                No related records found
              </TableCell>
            </TableRow>
          )}

          {!isLoading && relatedRecords.map((link) => (
            <TableRow key={link.id}>
              <TableCell className="font-medium">
                {/* Record name */}
              </TableCell>
              <TableCell>
                {link.relationship_metadata?.role || '-'}
              </TableCell>
              <TableCell>
                {new Date(link.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenu.Item onClick={() => {}}>View</DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => {}}>Unlink</DropdownMenu.Item>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

#### useRelatedRecords.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getRelatedRecordsAPI } from '@/lib/api/relationship-records.api';

interface UseRelatedRecordsParams {
  recordId: string;
  relationshipId: string;
}

export const useRelatedRecords = ({
  recordId,
  relationshipId
}: UseRelatedRecordsParams) => {
  return useQuery({
    queryKey: ['related-records', recordId, relationshipId],
    queryFn: () => getRelatedRecordsAPI(recordId, relationshipId),
    enabled: !!recordId && !!relationshipId,
  });
};
```

#### useUnlinkRecord.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRelationshipRecordAPI } from '@/lib/api/relationship-records.api';

export const useUnlinkRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => deleteRelationshipRecordAPI(linkId),
    onSuccess: () => {
      // Invalidate related records queries
      queryClient.invalidateQueries({ queryKey: ['related-records'] });
    },
  });
};
```

#### relationship-records.api.ts
```typescript
import { apiClient } from './client';
import type { RelationshipRecord } from '../types';

/**
 * Get all related records for a specific relationship
 */
export const getRelatedRecordsAPI = async (
  recordId: string,
  relationshipId: string
): Promise<RelationshipRecord[]> => {
  const { data } = await apiClient.get<RelationshipRecord[]>(
    `/relationship-records/records/${recordId}/related`,
    {
      params: { relationship_id: relationshipId },
    }
  );

  return data;
};

/**
 * Delete a relationship record (unlink)
 */
export const deleteRelationshipRecordAPI = async (
  linkId: string
): Promise<void> => {
  await apiClient.delete(`/relationship-records/${linkId}`);
};
```

#### relationship.types.ts
```typescript
export interface RelationshipRecord {
  id: string; // lnk_xxxxxxxx
  relationship_id: string; // rel_xxxxxxxx
  from_record_id: string; // rec_xxxxxxxx
  to_record_id: string; // rec_xxxxxxxx
  relationship_metadata?: Record<string, any>;
  created_at: string;
  created_by: string;
}

export interface Relationship {
  id: string; // rel_xxxxxxxx
  workspace_id: string;
  relationship_name: string;
  from_table_id: string;
  to_table_id: string;
  relationship_type: 'one_to_one' | 'one_to_many' | 'many_to_many';
  metadata_fields?: Record<string, any>;
  created_at: string;
  created_by: string;
}
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - API state management
- `react-router-dom` - Navigation
- `lucide-react` - Icons

### New Hooks Needed
- `useRelationships` - Fetch all relationships for a table
- `useRelatedRecords` - Fetch related records for a relationship
- `useUnlinkRecord` - Delete relationship record
- `useRecord` - Fetch single record data

---

## Acceptance Criteria

- [ ] RelatedRecordsPanel sidebar'da çalışıyor
- [ ] Her relationship type ayrı grup olarak gösteriliyor
- [ ] Her grup collapsible (açılıp kapanabilir)
- [ ] Related records count badge gösteriliyor
- [ ] Mini card view çalışıyor (record name + metadata)
- [ ] [View] button → record detail sayfasına redirect
- [ ] [Unlink] button → confirmation + delete
- [ ] [+ Add New] button → AddRelatedRecordModal açıyor
- [ ] Empty state çalışıyor ("No records found")
- [ ] Loading state (skeleton loader)
- [ ] Error handling
- [ ] Real-time invalidation (unlink sonrası liste güncellensin)

---

## Testing Checklist

### Manual Testing
- [ ] Contact'ın Opportunities'leri görünüyor
- [ ] Product'ın Categories'leri görünüyor
- [ ] Unlink çalışıyor (link siliniyor)
- [ ] View button → doğru record'a redirect
- [ ] Empty state → "No records" mesajı
- [ ] Loading state → skeleton loader
- [ ] Collapse/expand çalışıyor
- [ ] Count badge doğru sayı gösteriyor

### Test Scenarios

**Scenario 1: Contact → Opportunities**
```
1. Contact record aç (Ali)
2. Related Records Panel'i aç
3. "Opportunities" grubunu görüntüle
4. 3 opportunity görünmeli
5. Her birinde role metadata olmalı
6. [View] button → opportunity detayına gitsin
7. [Unlink] button → confirmation + sil
```

**Scenario 2: Product → Categories**
```
1. Product record aç (iPhone 15)
2. Related Records Panel'i aç
3. "Categories" grubunu görüntüle
4. 2 category görünmeli (Electronics, Smartphones)
5. [+ Add New] → category seçim modalı açılsın
```

---

## Code Examples

### Complete Flow
```typescript
// 1. User opens record detail page
// 2. RelatedRecordsPanel fetches all relationships for table
// 3. For each relationship:
//    - Fetch related records (GET /api/relationship-records/records/{id}/related)
//    - Display in RelationshipGroup
// 4. User clicks [View] → navigate to related record
// 5. User clicks [Unlink] → DELETE /api/relationship-records/{link_id}
// 6. User clicks [+ Add New] → open AddRelatedRecordModal
```

### Query Key Strategy
```typescript
// Query keys for proper invalidation
const queryKeys = {
  relationships: (tableId: string) => ['relationships', tableId],
  relatedRecords: (recordId: string, relationshipId: string) =>
    ['related-records', recordId, relationshipId],
  record: (recordId: string) => ['record', recordId],
};

// After unlinking, invalidate
queryClient.invalidateQueries({
  queryKey: ['related-records', recordId]
});
```

### Example: Contact's Opportunities
```typescript
// Contact record: rec_ali
// Relationship: rel_contact_opportunity
// Opportunities: [rec_bigdeal, rec_mediumdeal, rec_smalldeal]

const { data: relatedRecords } = useRelatedRecords({
  recordId: 'rec_ali',
  relationshipId: 'rel_contact_opportunity',
});

// Returns:
// [
//   { id: 'lnk_1', to_record_id: 'rec_bigdeal', metadata: { role: 'Decision Maker' } },
//   { id: 'lnk_2', to_record_id: 'rec_mediumdeal', metadata: { role: 'Influencer' } },
//   { id: 'lnk_3', to_record_id: 'rec_smalldeal', metadata: { role: 'Sponsor' } },
// ]
```

### Example: Product's Categories
```typescript
// Product record: rec_iphone15
// Relationship: rel_product_category (many-to-many)
// Categories: [rec_electronics, rec_smartphones]

const { data: relatedRecords } = useRelatedRecords({
  recordId: 'rec_iphone15',
  relationshipId: 'rel_product_category',
});

// Returns:
// [
//   { id: 'lnk_4', to_record_id: 'rec_electronics', metadata: {} },
//   { id: 'lnk_5', to_record_id: 'rec_smartphones', metadata: {} },
// ]
```

---

## Resources

### Backend Documentation
- [GET /api/relationship-records/records/{record_id}/related](../../backend-docs/api/08-relationship-records/02-get-related-records.md) - Get related records
- [DELETE /api/relationship-records/{link_id}](../../backend-docs/api/08-relationship-records/03-delete-relationship-record.md) - Unlink record

### Frontend Libraries
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Router Docs](https://reactrouter.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Related Records View task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/07-relationships/03-related-records-view.md

Requirements:
1. Create src/features/relationships/components/RelatedRecordsPanel.tsx - Main sidebar panel
2. Create src/features/relationships/components/RelationshipGroup.tsx - Collapsible group by relationship
3. Create src/features/relationships/components/RelatedRecordCard.tsx - Mini card view
4. Create src/features/relationships/components/RelatedRecordsTable.tsx - Table view alternative
5. Create src/features/relationships/hooks/useRelatedRecords.ts - Fetch related records hook
6. Create src/features/relationships/hooks/useUnlinkRecord.ts - Unlink mutation hook
7. Update src/lib/api/relationship-records.api.ts - Add getRelatedRecordsAPI, deleteRelationshipRecordAPI
8. Create src/features/relationships/types/relationship.types.ts - TypeScript definitions

CRITICAL REQUIREMENTS:
- GET /api/relationship-records/records/{record_id}/related?relationship_id={id}
- Group related records by relationship type
- Each group is collapsible with count badge
- Show 2-3 important fields in mini card
- Display relationship_metadata (role, status, etc.)
- [View] button → navigate to related record
- [Unlink] button → confirmation + delete link
- [+ Add New] button → open modal (to be implemented later)
- Empty state: "No {relationship_name} found"
- Loading state: skeleton loaders
- Real-time invalidation after unlink

UI DESIGN:
- Sidebar panel (w-96, sticky, overflow-y-auto)
- Collapsible relationship groups
- Mini cards with primary field + metadata
- Quick actions: [View] [Unlink]
- Use Lucide icons: ChevronDown, Plus, ExternalLink, Unlink

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 04-relationship-metadata-editor.md
