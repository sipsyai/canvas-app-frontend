# 04. Objects Management

**Priority:** 🟡 Medium Priority
**Estimated Time:** 4-5 gün
**Dependencies:** 02-api-integration, 09-ui-components

## Overview

Object management sistemi. Object'lar veri tablolarını temsil eder (Contact, Company, Opportunity vb.). Salesforce'taki "Custom Objects" konseptine benzer.

## Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/objects` | POST | Create object |
| `/api/objects` | GET | List objects (pagination, filters) |
| `/api/objects/{object_id}` | GET | Get single object |
| `/api/objects/{object_id}` | PATCH | Update object |
| `/api/objects/{object_id}` | DELETE | Delete object (CASCADE!) |

## Object Properties

```typescript
interface Object {
  id: string;              // obj_abc12345
  name: string;            // Unique identifier (e.g., "contact")
  label: string;           // Singular name (e.g., "Contact")
  plural_name: string;     // Plural name (e.g., "Contacts")
  description?: string;    // Description
  icon?: string;           // Icon name (lucide icons)
  color?: string;          // Hex color (e.g., "#3B82F6")
  category?: string;       // Category (e.g., "CRM")
  views?: object;          // View configuration
  permissions?: object;    // Permission configuration
  created_by: string;
  created_at: string;
  updated_at?: string;
}
```

## Key Features

- ✅ Object CRUD operations
- ✅ Icon picker (Lucide icons)
- ✅ Color picker
- ✅ Category organization
- ✅ Card view + Table view
- ✅ Search by name/label
- ✅ CASCADE delete warning
- ✅ View configuration (optional)
- ✅ Permission management (optional)

## Page Structure

```
/objects
├── List Objects (Card View)
├── Create Object (Modal/Page)
├── Edit Object (Modal/Page)
└── Delete Object (Confirmation Dialog with Cascade Warning)
```

## Cascade Delete Behavior

⚠️ **CRITICAL:** Object silindiğinde şunlar CASCADE silinir:
- Tüm record'lar (data kayıtları)
- Tüm object-field ilişkileri
- Tüm relationship tanımları (bu object'i kullanan)
- İlgili relationship_records

## 🤖 Claude Code Prompt Template

Her task için prompt içerir. Detaylar task dosyalarında.

## Backend Documentation

**Complete API Reference:**
- [Objects API Overview](../../backend-docs/api/03-objects/README.md)
- [POST /api/objects](../../backend-docs/api/03-objects/01-create-object.md) - Create object
- [GET /api/objects](../../backend-docs/api/03-objects/02-list-objects.md) - List objects
- [GET /api/objects/{object_id}](../../backend-docs/api/03-objects/03-get-object.md) - Get single object
- [PATCH /api/objects/{object_id}](../../backend-docs/api/03-objects/04-update-object.md) - Update object
- [DELETE /api/objects/{object_id}](../../backend-docs/api/03-objects/05-delete-object.md) - Delete object

**Key Points from Backend:**
- Object ID auto-generated: `obj_xxxxxxxx` (8 char hex)
- CASCADE DELETE behavior:
  - Deletes ALL records in this object
  - Deletes ALL object-field relationships
  - Deletes ALL relationships involving this object
  - Deletes ALL relationship_records
- Filter params: `category`, `page`, `page_size`
- `views` and `permissions` fields are JSONB (flexible configuration)

## Next Steps

Bu task tamamlandıktan sonra:
→ **05-object-fields** (Add fields to objects)
