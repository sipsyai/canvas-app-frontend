# 06. Records Table

**Priority:** 🟡 Medium Priority
**Estimated Time:** 5-6 gün
**Dependencies:** 05-object-fields

## Overview

Dynamic record management. JSONB ile dinamik field değerleri, TanStack Table ile data table view.

## Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/records` | POST | Create record |
| `/api/records?object_id={id}` | GET | List records (pagination) |
| `/api/records/{record_id}` | GET | Get single record |
| `/api/records/{record_id}` | PATCH | Update record (MERGE!) |
| `/api/records/{record_id}` | DELETE | Delete record |
| `/api/records/search?object_id={id}&q={query}` | GET | Search records |

## Record Structure

```typescript
interface Record {
  id: string;              // rec_abc12345
  object_id: string;       // obj_contact
  data: {                  // JSONB - Dynamic field values
    fld_email: "ali@example.com",
    fld_phone: "+90 555 1234567",
    fld_company: "Acme Corp",
    // ... any field ID can be here
  };
  primary_value: string;   // Auto-set from primary field
  created_by: string;
  created_at: string;
  updated_at?: string;
  updated_by?: string;
}
```

## Key Features

- ✅ Dynamic table columns (based on object fields)
- ✅ TanStack Table v8 (sorting, filtering, pagination)
- ✅ Create record form (dynamic fields)
- ✅ Edit record form (inline or modal)
- ✅ Delete record confirmation
- ✅ Search records (by primary_value)
- ✅ Pagination (50 per page)
- ✅ Column visibility toggle
- ✅ Export to CSV (optional)

## CRITICAL: Update Behavior

⚠️ **Backend MERGE eder, OVERWRITE ETMEZ!**

```typescript
// Existing record data
{
  fld_email: "ali@example.com",
  fld_phone: "+90 555 1234567"
}

// Update request (ONLY changed fields)
{
  data: {
    fld_phone: "+90 555 9999999"  // Update phone
  }
}

// Result (MERGED)
{
  fld_email: "ali@example.com",    // PRESERVED
  fld_phone: "+90 555 9999999"     // UPDATED
}
```

## Dynamic Form Generation

Form field'ları object-field tanımlarına göre dinamik oluşturulur:
- Field type → Input component
- is_required → Required validation
- is_unique → Unique constraint check
- default_value → Initial form value
- validation_rules → Custom validation

## Backend Documentation

**Complete API Reference:**
- [Records API Overview](../../backend-docs/api/04-records/README.md)
- [POST /api/records](../../backend-docs/api/04-records/01-create-record.md) - Create record
- [GET /api/records](../../backend-docs/api/04-records/02-list-records.md) - List records (requires object_id)
- [GET /api/records/{record_id}](../../backend-docs/api/04-records/03-get-record.md) - Get single record
- [PATCH /api/records/{record_id}](../../backend-docs/api/04-records/04-update-record.md) - Update record (MERGE!)
- [DELETE /api/records/{record_id}](../../backend-docs/api/04-records/05-delete-record.md) - Delete record
- [GET /api/records/search](../../backend-docs/api/04-records/06-search-records.md) - Search records

**Key Points from Backend:**
- Record ID auto-generated: `rec_xxxxxxxx` (8 char hex)
- `data` field is JSONB - stores field values dynamically
- **CRITICAL:** Update uses MERGE, not overwrite!
- `primary_value` auto-calculated from primary field
- Query params:
  - `object_id` - **REQUIRED** for list and search
  - `q` - **REQUIRED** for search (query string)
  - `page`, `page_size` - Optional pagination
- Field IDs must be used as keys in `data` object (not field names!)

**Example MERGE behavior:**
```typescript
// Existing data
{ fld_name: "Ali", fld_email: "old@example.com" }

// Update request (only changed fields)
{ data: { fld_email: "new@example.com" } }

// Result (MERGED)
{ fld_name: "Ali", fld_email: "new@example.com" }
```

## Next Steps

Bu task tamamlandıktan sonra:
→ **07-relationships** (Link records)
