# Task: Bidirectional Query

**Priority:** 🟡 Medium
**Estimated Time:** 1 gün
**Dependencies:** 03-related-records-view

---

## Objective

İlişki sorgularını her iki yönden de yapabilmek. Bir relationship tanımı her iki yönden de çalışır (Contact→Opportunities VE Opportunity→Contact).

---

## Backend API

### Endpoint
```
GET /api/relationship-records/records/{record_id}/related
```

### Query Parameters
```typescript
interface GetRelatedRecordsParams {
  relationship_id: string;  // Required - Which relationship to query
}
```

### Response
```json
{
  "links": [
    {
      "id": "lnk_abc12345",
      "relationship_id": "rel_contact_opportunity",
      "from_record_id": "rec_ali",
      "to_record_id": "rec_bigdeal",
      "relationship_metadata": {
        "role": "Decision Maker",
        "influence_level": "High"
      },
      "created_by": "usr_john",
      "created_at": "2024-01-15T10:00:00Z",

      // ⭐ Direction indicator
      "direction": "forward",  // "forward" or "reverse"

      // ⭐ Related record details
      "related_record": {
        "id": "rec_bigdeal",
        "object_id": "obj_opportunity",
        "fields": {
          "name": "Enterprise Deal",
          "amount": 50000,
          "stage": "Negotiation"
        }
      }
    }
  ],
  "relationship": {
    "id": "rel_contact_opportunity",
    "name": "contact_opportunity",
    "type": "1:N",
    "from_object_id": "obj_contact",
    "to_object_id": "obj_opportunity",
    "from_label": "Opportunities",     // "Contact's Opportunities"
    "to_label": "Contact"              // "Opportunity's Contact"
  }
}
```

**Response Fields:**
- `links` - Array of relationship-record links
- `direction` - "forward" (from→to) veya "reverse" (to→from)
- `related_record` - İlişkili record'un detayları
- `relationship` - Relationship bilgisi (labels için)

### Bidirectional Logic
⚠️ **Backend otomatik olarak bidirectional query yapar:**
```sql
-- Contact "Ali" için Opportunities sorgusu
WHERE (from_record_id = 'rec_ali' OR to_record_id = 'rec_ali')
  AND relationship_id = 'rel_contact_opportunity'

-- Returns:
-- 1. from_record_id = 'rec_ali' → direction: "forward"  (Ali → Opportunity)
-- 2. to_record_id = 'rec_ali'   → direction: "reverse"  (Opportunity → Ali)
```

**Backend Documentation:**
→ [GET /api/relationship-records/records/{record_id}/related](../../backend-docs/api/08-relationship-records/02-get-related-records.md)

---

## UI/UX Design

### Bidirectional Query Display

#### Scenario 1: Contact "Ali" → Opportunities
```
┌─────────────────────────────────────────────────┐
│  Contact: Ali Kaya                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Related Records                                │
│                                                 │
│  [Opportunities ▼]  ← Direction selector        │
│                                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ Enterprise Deal         →  Forward         │ │
│  │ Amount: $50,000                            │ │
│  │ Stage: Negotiation                         │ │
│  └────────────────────────────────────────────┘ │
│                                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ SMB Deal                →  Forward         │ │
│  │ Amount: $10,000                            │ │
│  │ Stage: Closed Won                          │ │
│  └────────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Scenario 2: Toggle to "Contact" (Reverse View)
```
┌─────────────────────────────────────────────────┐
│  Contact: Ali Kaya                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Related Records                                │
│                                                 │
│  [Contact ▼]  ← Direction changed               │
│                                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ Ali Kaya                ←  Reverse         │ │
│  │ Email: ali@example.com                     │ │
│  │ Phone: +90 555 123 4567                    │ │
│  └────────────────────────────────────────────┘ │
│                                                 │
│  💡 Showing reverse relationships              │
│  (Records where Ali is in "to_record_id")      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Direction Toggle Component
```
┌──────────────────────────────────┐
│  Viewing relationships:          │
│                                  │
│  ◉ Opportunities  (from)         │
│  ○ Contact        (to)           │
│                                  │
│  💡 One relationship definition  │
│     works in both directions     │
└──────────────────────────────────┘
```

### Direction Indicators
1. **Forward (→)** - `from_record_id` matches current record
   - Badge: `→ Forward` (Blue)
   - Example: Ali → Opportunity

2. **Reverse (←)** - `to_record_id` matches current record
   - Badge: `← Reverse` (Purple)
   - Example: Opportunity → Ali

---

## Technical Details

### File Structure
```
src/
├── features/
│   └── relationships/
│       ├── hooks/
│       │   └── useBidirectionalQuery.ts     ⭐ Bidirectional query hook
│       ├── components/
│       │   ├── DirectionToggle.tsx          ⭐ Direction selector
│       │   ├── DirectionBadge.tsx           ⭐ Forward/Reverse badge
│       │   └── BidirectionalView.tsx        ⭐ Main bidirectional view
│       └── types/
│           └── relationship.types.ts         ⭐ Direction types
└── lib/
    └── api/
        └── relationships.api.ts              ⭐ API calls
```

### Component Implementation

#### useBidirectionalQuery.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { getRelatedRecordsAPI } from '@/lib/api/relationships.api';

interface UseBidirectionalQueryParams {
  recordId: string;
  relationshipId: string;
  direction?: 'all' | 'forward' | 'reverse';  // Filter by direction
}

export const useBidirectionalQuery = ({
  recordId,
  relationshipId,
  direction = 'all'
}: UseBidirectionalQueryParams) => {
  return useQuery({
    queryKey: ['related-records', recordId, relationshipId, direction],
    queryFn: async () => {
      const response = await getRelatedRecordsAPI(recordId, relationshipId);

      // Filter by direction if specified
      if (direction !== 'all') {
        return {
          ...response,
          links: response.links.filter(link => link.direction === direction)
        };
      }

      return response;
    },
    enabled: !!recordId && !!relationshipId,
  });
};

// Example usage:
// const { data, isLoading } = useBidirectionalQuery({
//   recordId: 'rec_ali',
//   relationshipId: 'rel_contact_opportunity',
//   direction: 'forward'  // Only show forward relationships
// });
```

#### DirectionToggle.tsx
```typescript
import { useState } from 'react';
import { RadioGroup } from '@/components/ui/RadioGroup';

interface DirectionToggleProps {
  relationship: {
    from_label: string;  // "Opportunities"
    to_label: string;    // "Contact"
  };
  value: 'all' | 'forward' | 'reverse';
  onChange: (direction: 'all' | 'forward' | 'reverse') => void;
}

export const DirectionToggle = ({
  relationship,
  value,
  onChange
}: DirectionToggleProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        Viewing relationships:
      </h4>

      <RadioGroup value={value} onChange={onChange}>
        <RadioGroup.Option value="all">
          <div className="flex items-center gap-2">
            <span className="font-medium">All Relationships</span>
            <span className="text-xs text-gray-500">(both directions)</span>
          </div>
        </RadioGroup.Option>

        <RadioGroup.Option value="forward">
          <div className="flex items-center gap-2">
            <span className="font-medium">{relationship.from_label}</span>
            <span className="text-xs text-blue-600">→ Forward</span>
          </div>
        </RadioGroup.Option>

        <RadioGroup.Option value="reverse">
          <div className="flex items-center gap-2">
            <span className="font-medium">{relationship.to_label}</span>
            <span className="text-xs text-purple-600">← Reverse</span>
          </div>
        </RadioGroup.Option>
      </RadioGroup>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 One relationship definition works in both directions
        </p>
      </div>
    </div>
  );
};
```

#### DirectionBadge.tsx
```typescript
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface DirectionBadgeProps {
  direction: 'forward' | 'reverse';
}

export const DirectionBadge = ({ direction }: DirectionBadgeProps) => {
  if (direction === 'forward') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
        <ArrowRight className="w-3 h-3" />
        Forward
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
      <ArrowLeft className="w-3 h-3" />
      Reverse
    </span>
  );
};
```

#### BidirectionalView.tsx
```typescript
import { useState } from 'react';
import { useBidirectionalQuery } from '../hooks/useBidirectionalQuery';
import { DirectionToggle } from './DirectionToggle';
import { DirectionBadge } from './DirectionBadge';
import { RelatedRecordCard } from './RelatedRecordCard';

interface BidirectionalViewProps {
  recordId: string;
  relationshipId: string;
}

export const BidirectionalView = ({
  recordId,
  relationshipId
}: BidirectionalViewProps) => {
  const [direction, setDirection] = useState<'all' | 'forward' | 'reverse'>('all');

  const { data, isLoading, isError } = useBidirectionalQuery({
    recordId,
    relationshipId,
    direction
  });

  if (isLoading) {
    return <div>Loading related records...</div>;
  }

  if (isError) {
    return <div>Error loading related records</div>;
  }

  return (
    <div className="space-y-6">
      {/* Direction Toggle */}
      <DirectionToggle
        relationship={data.relationship}
        value={direction}
        onChange={setDirection}
      />

      {/* Related Records */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Related {direction === 'forward'
            ? data.relationship.from_label
            : direction === 'reverse'
            ? data.relationship.to_label
            : 'Records'}
          <span className="ml-2 text-sm text-gray-500">
            ({data.links.length})
          </span>
        </h3>

        {data.links.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">
              No {direction === 'all' ? '' : direction} relationships found
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {data.links.map((link) => (
              <div key={link.id} className="relative">
                {/* Direction Badge */}
                <div className="absolute top-4 right-4">
                  <DirectionBadge direction={link.direction} />
                </div>

                {/* Related Record Card */}
                <RelatedRecordCard
                  record={link.related_record}
                  metadata={link.relationship_metadata}
                  linkId={link.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### relationships.api.ts
```typescript
import { apiClient } from './client';

export interface RelatedRecordsResponse {
  links: Array<{
    id: string;
    relationship_id: string;
    from_record_id: string;
    to_record_id: string;
    relationship_metadata?: Record<string, any>;
    created_by: string;
    created_at: string;
    direction: 'forward' | 'reverse';  // Backend provides this
    related_record: {
      id: string;
      object_id: string;
      fields: Record<string, any>;
    };
  }>;
  relationship: {
    id: string;
    name: string;
    type: '1:N' | 'N:N';
    from_object_id: string;
    to_object_id: string;
    from_label: string;
    to_label: string;
  };
}

export const getRelatedRecordsAPI = async (
  recordId: string,
  relationshipId: string
): Promise<RelatedRecordsResponse> => {
  const { data } = await apiClient.get<RelatedRecordsResponse>(
    `/api/relationship-records/records/${recordId}/related`,
    {
      params: {
        relationship_id: relationshipId
      }
    }
  );

  return data;
};
```

#### relationship.types.ts
```typescript
export type RelationshipDirection = 'forward' | 'reverse';

export interface RelationshipLink {
  id: string;
  relationship_id: string;
  from_record_id: string;
  to_record_id: string;
  relationship_metadata?: Record<string, any>;
  created_by: string;
  created_at: string;
  direction: RelationshipDirection;
  related_record: {
    id: string;
    object_id: string;
    fields: Record<string, any>;
  };
}

export interface Relationship {
  id: string;
  name: string;
  type: '1:N' | 'N:N';
  from_object_id: string;
  to_object_id: string;
  from_label: string;  // "Opportunities"
  to_label: string;    // "Contact"
  description?: string;
  created_by: string;
  created_at: string;
}

export interface RelatedRecordsData {
  links: RelationshipLink[];
  relationship: Relationship;
}
```

---

## Technical Explanation

### Bidirectional Relationships Nasıl Çalışır?

#### 1. Single Relationship Definition
```typescript
// Backend'de tek bir relationship tanımı
{
  id: "rel_contact_opportunity",
  from_object_id: "obj_contact",      // Contact
  to_object_id: "obj_opportunity",     // Opportunity
  from_label: "Opportunities",         // Contact'tan bakınca: "Opportunities"
  to_label: "Contact"                  // Opportunity'den bakınca: "Contact"
}
```

#### 2. Record Links (Both Directions)
```typescript
// Link 1: Ali → Enterprise Deal (Forward)
{
  from_record_id: "rec_ali",          // Contact: Ali
  to_record_id: "rec_bigdeal"         // Opportunity: Enterprise Deal
}

// Link 2: SMB Deal → Mehmet (Reverse - Mehmet is to_record)
{
  from_record_id: "rec_smbdeal",      // Opportunity: SMB Deal
  to_record_id: "rec_mehmet"          // Contact: Mehmet
}
```

#### 3. Query from Contact "Ali"
```sql
-- Backend automatically searches both directions
WHERE (from_record_id = 'rec_ali' OR to_record_id = 'rec_ali')
  AND relationship_id = 'rel_contact_opportunity'

-- Returns:
-- 1. rec_ali → rec_bigdeal (direction: "forward")
-- 2. rec_smbdeal → rec_mehmet is NOT returned (Ali not involved)
```

#### 4. Query from Opportunity "Enterprise Deal"
```sql
WHERE (from_record_id = 'rec_bigdeal' OR to_record_id = 'rec_bigdeal')
  AND relationship_id = 'rel_contact_opportunity'

-- Returns:
-- 1. rec_ali → rec_bigdeal (direction: "reverse" - Enterprise Deal is to_record)
```

### Direction Determination
Backend otomatik olarak direction belirler:
```python
# Backend logic (Python)
for link in links:
    if link.from_record_id == current_record_id:
        link.direction = "forward"
    else:
        link.direction = "reverse"
```

---

## Real-World Examples

### Example 1: Contact's Companies vs Company's Contacts

#### Contact "Ali" → Companies (Forward)
```typescript
// Query: GET /api/relationship-records/records/rec_ali/related?relationship_id=rel_contact_company

// Response:
{
  links: [
    {
      from_record_id: "rec_ali",
      to_record_id: "rec_acme_corp",
      direction: "forward",
      related_record: {
        fields: {
          name: "Acme Corp",
          industry: "Technology"
        }
      }
    }
  ],
  relationship: {
    from_label: "Companies",  // Ali's view
    to_label: "Contacts"      // Company's view
  }
}
```

#### Company "Acme Corp" → Contacts (Reverse)
```typescript
// Query: GET /api/relationship-records/records/rec_acme_corp/related?relationship_id=rel_contact_company

// Response:
{
  links: [
    {
      from_record_id: "rec_ali",
      to_record_id: "rec_acme_corp",
      direction: "reverse",     // ⭐ Same link, different direction!
      related_record: {
        fields: {
          name: "Ali Kaya",
          email: "ali@example.com"
        }
      }
    }
  ],
  relationship: {
    from_label: "Companies",
    to_label: "Contacts"      // Acme Corp's view
  }
}
```

### Example 2: Parent-Child Relationships (Self-Referencing)

#### Opportunity Hierarchy
```typescript
// Relationship: Opportunity → Sub-Opportunities
{
  from_object_id: "obj_opportunity",  // Same object
  to_object_id: "obj_opportunity",    // Same object
  from_label: "Sub-Opportunities",
  to_label: "Parent Opportunity"
}

// Query from "Main Deal":
// - Forward: Sub-opportunities (children)
// - Reverse: Parent opportunity
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `@tanstack/react-query` - API state management
- `axios` - HTTP client
- `lucide-react` - Icons (ArrowRight, ArrowLeft)

### UI Components (To Be Built)
- `RadioGroup` component (React Aria)
- `RelatedRecordCard` component (from 03-related-records-view)

---

## Acceptance Criteria

- [ ] Bidirectional query çalışıyor (Contact→Company VE Company→Contact)
- [ ] Direction toggle component çalışıyor
- [ ] Forward/Reverse badge gösteriliyor
- [ ] Direction filter çalışıyor (all/forward/reverse)
- [ ] Backend otomatik olarak direction belirliyor
- [ ] Tek relationship tanımı her iki yönden sorgulanabiliyor
- [ ] Self-referencing relationships destekleniyor (Parent-Child)
- [ ] Empty state gösteriliyor (no relationships)
- [ ] Loading state çalışıyor
- [ ] Error handling doğru çalışıyor

---

## Testing Checklist

### Manual Testing
- [ ] Contact "Ali" → Opportunities → Forward badge görünüyor
- [ ] Opportunity "Big Deal" → Contact → Reverse badge görünüyor
- [ ] Direction toggle → Filter çalışıyor
- [ ] "All" seçimi → Hem forward hem reverse gösteriliyor
- [ ] "Forward" seçimi → Sadece forward gösteriliyor
- [ ] "Reverse" seçimi → Sadece reverse gösteriliyor
- [ ] Self-referencing relationship → Parent/Child ayrımı
- [ ] Empty state → No relationships mesajı

### Test Data
```typescript
// Test relationship
const testRelationship = {
  id: "rel_contact_opportunity",
  from_object_id: "obj_contact",
  to_object_id: "obj_opportunity",
  from_label: "Opportunities",
  to_label: "Contact"
};

// Test links
const testLinks = [
  {
    id: "lnk_1",
    from_record_id: "rec_ali",
    to_record_id: "rec_bigdeal",
    direction: "forward"  // Ali → Big Deal
  },
  {
    id: "lnk_2",
    from_record_id: "rec_smbdeal",
    to_record_id: "rec_ali",
    direction: "reverse"  // SMB Deal → Ali
  }
];
```

---

## Code Examples

### Complete Bidirectional Query Flow
```typescript
// 1. User opens Contact "Ali"
// 2. Select relationship: "Opportunities"
// 3. Backend query: GET /api/relationship-records/records/rec_ali/related?relationship_id=rel_contact_opportunity
// 4. Backend returns links where (from_record_id = 'rec_ali' OR to_record_id = 'rec_ali')
// 5. Backend sets direction: "forward" or "reverse"
// 6. Frontend displays with direction badges
// 7. User toggles to "reverse only" → Filter applied
```

### Direction Toggle Usage
```typescript
const MyComponent = () => {
  const [direction, setDirection] = useState<'all' | 'forward' | 'reverse'>('all');

  const { data } = useBidirectionalQuery({
    recordId: 'rec_ali',
    relationshipId: 'rel_contact_opportunity',
    direction  // Filtered in frontend
  });

  return (
    <div>
      <DirectionToggle
        relationship={data.relationship}
        value={direction}
        onChange={setDirection}
      />

      {data.links.map(link => (
        <div key={link.id}>
          <DirectionBadge direction={link.direction} />
          <RelatedRecordCard record={link.related_record} />
        </div>
      ))}
    </div>
  );
};
```

### Self-Referencing Example
```typescript
// Opportunity → Sub-Opportunities (same object)
const opportunityHierarchy = {
  from_object_id: "obj_opportunity",
  to_object_id: "obj_opportunity",
  from_label: "Sub-Opportunities",
  to_label: "Parent Opportunity"
};

// Query from "Main Deal":
const { data } = useBidirectionalQuery({
  recordId: 'rec_main_deal',
  relationshipId: 'rel_opportunity_hierarchy'
});

// Results:
// - Forward: Sub-opportunities (children)
// - Reverse: Parent opportunity
```

---

## Resources

### Backend Documentation
- [GET /api/relationship-records/records/{record_id}/related](../../backend-docs/api/08-relationship-records/02-get-related-records.md) - Bidirectional query endpoint
- [Relationship-Records Overview](../../backend-docs/api/08-relationship-records/README.md) - Complete API overview
- [Relationships Overview](../../backend-docs/api/06-relationships/README.md) - Relationship types

### Frontend Libraries
- [TanStack Query Docs](https://tanstack.com/query/latest) - Data fetching
- [React Aria RadioGroup](https://react-spectrum.adobe.com/react-aria/RadioGroup.html) - Accessible radio group

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Bidirectional Query task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/07-relationships/04-bidirectional-query.md

Requirements:
1. Create src/features/relationships/hooks/useBidirectionalQuery.ts - TanStack Query hook for bidirectional queries with direction filter
2. Create src/features/relationships/components/DirectionToggle.tsx - Radio group for selecting direction (all/forward/reverse)
3. Create src/features/relationships/components/DirectionBadge.tsx - Badge showing → Forward or ← Reverse
4. Create src/features/relationships/components/BidirectionalView.tsx - Main component combining all features
5. Update src/lib/api/relationships.api.ts - Add getRelatedRecordsAPI function
6. Update src/features/relationships/types/relationship.types.ts - Add direction types

CRITICAL REQUIREMENTS:
- Backend automatically provides direction field ("forward" or "reverse")
- One relationship definition works in both directions
- Direction toggle filters results in frontend (all/forward/reverse)
- Forward badge: Blue with → arrow (ArrowRight icon)
- Reverse badge: Purple with ← arrow (ArrowLeft icon)
- Support self-referencing relationships (e.g., Parent-Child)
- Show relationship labels based on direction (from_label vs to_label)
- Empty state for no relationships
- Loading and error states

BIDIRECTIONAL LOGIC:
- Contact "Ali" → Query returns links where (from_record_id = 'rec_ali' OR to_record_id = 'rec_ali')
- Backend sets direction: "forward" if from_record_id matches, "reverse" if to_record_id matches
- Frontend displays appropriate label: from_label for forward, to_label for reverse

Follow the exact code examples and file structure provided in the task file.
```

---

**Status:** 🟡 Pending
**Next Task:** 05-link-records.md
