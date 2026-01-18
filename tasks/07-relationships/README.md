# 07. Relationships

**Priority:** 🟡 Medium Priority
**Estimated Time:** 4-5 gün
**Dependencies:** 06-records-table

## Overview

Object ilişkileri (1:N, N:N) ve record linking. Salesforce'taki "Lookup" ve "Master-Detail" konseptine benzer.

## Backend Endpoints

### Relationships
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/relationships` | POST | Create relationship |
| `/api/relationships/objects/{object_id}` | GET | Get object relationships |
| `/api/relationships/{relationship_id}` | DELETE | Delete relationship (CASCADE!) |

### Relationship-Records
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/relationship-records` | POST | Link records |
| `/api/relationship-records/records/{record_id}/related?relationship_id={id}` | GET | Get related records |
| `/api/relationship-records/{link_id}` | DELETE | Unlink records |

## Relationship Types

### 1:N (One-to-Many)
**Example:** Contact → Opportunities
- 1 Contact has many Opportunities
- 1 Opportunity belongs to 1 Contact

### N:N (Many-to-Many)
**Example:** Opportunity ↔ Products
- 1 Opportunity has many Products
- 1 Product belongs to many Opportunities

## Relationship Structure

```typescript
interface Relationship {
  id: string;               // rel_abc12345
  name: string;             // "contact_opportunity"
  type: "1:N" | "N:N";      // Relationship type
  from_object_id: string;   // obj_contact
  to_object_id: string;     // obj_opportunity
  from_label: string;       // "Opportunities" (shown in Contact)
  to_label: string;         // "Contact" (shown in Opportunity)
  description?: string;
  created_by: string;
  created_at: string;
}
```

## Relationship-Record (Link)

```typescript
interface RelationshipRecord {
  id: string;                     // lnk_abc12345
  relationship_id: string;        // rel_contact_opportunity
  from_record_id: string;         // rec_ali (Contact)
  to_record_id: string;           // rec_bigdeal (Opportunity)
  relationship_metadata?: {       // Optional metadata
    role: "Decision Maker",
    influence_level: "High"
  };
  created_by: string;
  created_at: string;
}
```

## Key Features

- ✅ Define relationships between objects
- ✅ Link records (drag-drop or search)
- ✅ View related records
- ✅ Relationship metadata (junction data)
- ✅ Bidirectional query
- ✅ Unlink records
- ✅ CASCADE delete warning

## Bidirectional Query

⚠️ Backend query bidirectional:
```typescript
// Contact "Ali" → Get related Opportunities
getRelatedRecords("rec_ali", "rel_contact_opportunity")

// Returns links where:
// from_record_id = "rec_ali" OR to_record_id = "rec_ali"
```

## Backend Documentation

**Relationships API:**
- [Relationships API Overview](../../backend-docs/api/06-relationships/README.md)
- [POST /api/relationships](../../backend-docs/api/06-relationships/01-create-relationship.md) - Create relationship
- [GET /api/relationships/objects/{object_id}](../../backend-docs/api/06-relationships/02-get-object-relationships.md) - Get object relationships
- [DELETE /api/relationships/{relationship_id}](../../backend-docs/api/06-relationships/03-delete-relationship.md) - Delete relationship

**Relationship-Records API:**
- [Relationship-Records API Overview](../../backend-docs/api/08-relationship-records/README.md)
- [POST /api/relationship-records](../../backend-docs/api/08-relationship-records/01-create-relationship-record.md) - Link records
- [GET /api/relationship-records/records/{record_id}/related](../../backend-docs/api/08-relationship-records/02-get-related-records.md) - Get related records
- [DELETE /api/relationship-records/{link_id}](../../backend-docs/api/08-relationship-records/03-delete-relationship-record.md) - Unlink records

**Key Points from Backend:**
- Relationship ID: `rel_xxxxxxxx` (8 char hex)
- Link ID: `lnk_xxxxxxxx` (8 char hex)
- Bidirectional query: Returns links where record is EITHER `from_record_id` OR `to_record_id`
- CASCADE DELETE: Deleting relationship removes ALL relationship_records
- `relationship_metadata` field (JSONB) for junction table data
- Query requires `relationship_id` parameter for getting related records

## Next Steps

Bu task tamamlandıktan sonra:
→ **08-applications** (App management)
→ **10-advanced-features** (Kanban, React Flow)
