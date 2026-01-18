# 05. Object-Fields

**Priority:** 🟡 Medium Priority
**Estimated Time:** 3-4 gün
**Dependencies:** 03-fields-library, 04-objects-management

## Overview

Object-Fields junction table. Field'ları object'lere bağlama, sıralama, validation rules.

## Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/object-fields` | POST | Add field to object |
| `/api/object-fields?object_id={id}` | GET | List object fields |
| `/api/object-fields/{object_field_id}` | GET | Get single object-field |
| `/api/object-fields/{object_field_id}` | PATCH | Update object-field config |
| `/api/object-fields/{object_field_id}` | DELETE | Remove field from object |

## Object-Field Properties

```typescript
interface ObjectField {
  id: string;                 // obf_abc12345
  object_id: string;          // obj_contact
  field_id: string;           // fld_email
  display_order: number;      // 0, 1, 2, ...
  is_required: boolean;       // Required field?
  is_unique: boolean;         // Unique constraint?
  is_primary_field: boolean;  // Primary field (displayed in record title)
  default_value?: any;        // Default value
  validation_rules?: object;  // Custom validation rules
  created_at: string;
  updated_at?: string;
}
```

## Key Features

- ✅ Add field to object (drag-drop from field library)
- ✅ Field ordering (display_order) with drag-drop
- ✅ Primary field selection (only one per object)
- ✅ Required/Unique/Default value configuration
- ✅ Custom validation rules
- ✅ Field preview in object form
- ✅ Remove field from object

## UI Design

### Object Fields Page
```
┌─────────────────────────────────────────────────┐
│  Contact Object                    [+ Add Field] │
├─────────────────────────────────────────────────┤
│  Fields (drag to reorder)                       │
│                                                  │
│  ☰ Email Address         [Primary] [Required]   │
│  ☰ Phone Number          [Required]             │
│  ☰ Company Name          [Optional]             │
│  ☰ Job Title             [Optional]             │
│                                                  │
│  [Available Fields from Library]                │
│  • First Name (text)                            │
│  • Last Name (text)                             │
│  • Address (textarea)                           │
│  ...                                             │
└─────────────────────────────────────────────────┘
```

## Primary Field

**Önemli:** Her object'in **TEK BİR** primary field'ı olabilir.
- Primary field, record'un title'ında gösterilir
- `primary_value` otomatik olarak primary field'ın değeridir
- Örnek: Contact → Email primary field → "ali@example.com"

## Next Steps

Bu task tamamlandıktan sonra:
→ **06-records-table** (Record CRUD with dynamic fields)
