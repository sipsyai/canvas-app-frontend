# 03. Fields Library

**Priority:** 🟡 Medium Priority
**Estimated Time:** 4-5 gün
**Dependencies:** 02-api-integration, 09-ui-components

## Overview

Field Library management sistemi. Field'lar form alanlarını temsil eder (email, phone, text, number vb.). Salesforce'taki "Custom Fields" konseptine benzer.

## Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fields` | POST | Create field |
| `/api/fields` | GET | List fields (pagination, filters) |
| `/api/fields/{field_id}` | GET | Get single field |
| `/api/fields/{field_id}` | PATCH | Update field |
| `/api/fields/{field_id}` | DELETE | Delete field (CASCADE!) |

## Tasks

1. **01-field-list-page.md** - Field list page with table view
2. **02-create-field-form.md** - Create field form (12 field types)
3. **03-edit-field-form.md** - Edit field form
4. **04-delete-field.md** - Delete field with cascade warning

## Field Types (12 Types)

```typescript
type FieldType =
  | "text"        // Single line text
  | "email"       // Email address
  | "phone"       // Phone number
  | "number"      // Number (integer/decimal)
  | "date"        // Date picker
  | "datetime"    // Date + Time picker
  | "textarea"    // Multi-line text
  | "select"      // Dropdown (single select)
  | "multiselect" // Multi-select dropdown
  | "checkbox"    // Boolean checkbox
  | "radio"       // Radio buttons
  | "url"         // URL
  | "file"        // File upload
```

## Key Features

- ✅ Field CRUD operations
- ✅ 12 different field types
- ✅ Category organization
- ✅ Field config (placeholder, min, max, options)
- ✅ System fields (non-deletable)
- ✅ Table view with search
- ✅ Pagination (50 per page)
- ✅ Cascade delete warning

## Page Structure

```
/fields
├── List Fields (Table View)
├── Create Field (Modal/Page)
├── Edit Field (Modal/Page)
└── Delete Field (Confirmation Dialog)
```

## UI/UX Design

### Fields List Page
```
┌─────────────────────────────────────────────────┐
│  Fields Library                    [+ New Field] │
├─────────────────────────────────────────────────┤
│  [Search...]  [Category: All ▼]  [Type: All ▼]  │
├─────────────────────────────────────────────────┤
│  Name       │ Label          │ Type    │ Actions│
│─────────────┼────────────────┼─────────┼────────│
│  email      │ Email Address  │ email   │ [Edit] │
│  phone      │ Phone Number   │ phone   │ [Edit] │
│  company    │ Company Name   │ text    │ [Edit] │
│  ...        │ ...            │ ...     │ ...    │
├─────────────────────────────────────────────────┤
│  Showing 1-50 of 150        [← Prev] [Next →]   │
└─────────────────────────────────────────────────┘
```

### Create Field Form
```
┌─────────────────────────────────┐
│  Create New Field               │
├─────────────────────────────────┤
│  Field Name * [________]        │
│  Display Label * [________]     │
│  Field Type * [Select ▼]       │
│    • text                       │
│    • email                      │
│    • phone                      │
│    • ...                        │
│                                 │
│  Category [________]            │
│  Description [________]         │
│                                 │
│  ┌─ Field Configuration ─────┐ │
│  │ Placeholder: [________]    │ │
│  │ Min Length:  [________]    │ │
│  │ Max Length:  [________]    │ │
│  │ Required: [✓]              │ │
│  │ Unique:   [✓]              │ │
│  └────────────────────────────┘ │
│                                 │
│  [Cancel]  [Create Field]       │
└─────────────────────────────────┘
```

## Technical Stack

- **Table:** TanStack Table v8
- **Forms:** React Hook Form + Zod
- **API:** TanStack Query (useFields hooks)
- **UI:** React Aria Components
- **Icons:** Lucide React

## Acceptance Criteria

- [ ] Fields list page shows all fields
- [ ] Search by name/label works
- [ ] Category filter works
- [ ] Type filter works
- [ ] Pagination works (50 per page)
- [ ] Create field form validates all fields
- [ ] Field type selector shows all 12 types
- [ ] Field config changes based on type
- [ ] Edit field updates successfully
- [ ] Delete field shows cascade warning
- [ ] System fields cannot be deleted
- [ ] Loading states work
- [ ] Error handling works

## Data Flow

```
User Action → Component
           ↓
React Hook Form (validation)
           ↓
useCreateField() mutation
           ↓
fieldsAPI.create()
           ↓
Axios → Backend POST /api/fields
           ↓
Response → Cache invalidation
           ↓
UI Update (optimistic or refetch)
```

## Backend Response Example

```json
{
  "id": "fld_abc12345",
  "name": "email",
  "label": "Email Address",
  "type": "email",
  "category": "Contact Info",
  "description": null,
  "is_system_field": false,
  "config": {
    "placeholder": "you@example.com",
    "validation": {
      "required": true,
      "unique": true
    }
  },
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-18T10:00:00Z",
  "updated_at": null
}
```

## Warning Messages

### Delete Field Warning
```
⚠️ Delete Field "Email Address"?

This field is used in 3 objects:
• Contact
• Lead
• Opportunity

Deleting this field will:
✓ Remove the field from all objects (CASCADE)
✓ Delete all field configurations
✓ Remove field data from existing records

This action cannot be undone.

[Cancel]  [Delete Field]
```

## Backend Documentation

**Complete API Reference:**
- [Fields API Overview](../../backend-docs/api/02-fields/README.md)
- [POST /api/fields](../../backend-docs/api/02-fields/01-create-field.md) - Create field
- [GET /api/fields](../../backend-docs/api/02-fields/02-list-fields.md) - List fields with filters
- [GET /api/fields/{field_id}](../../backend-docs/api/02-fields/03-get-field.md) - Get single field
- [PATCH /api/fields/{field_id}](../../backend-docs/api/02-fields/04-update-field.md) - Update field
- [DELETE /api/fields/{field_id}](../../backend-docs/api/02-fields/05-delete-field.md) - Delete field

**Key Points from Backend:**
- Field ID auto-generated: `fld_xxxxxxxx` (8 char hex)
- `created_by` auto-set from JWT token (user cannot override)
- `name` and `type` cannot be changed after creation
- DELETE operation is CASCADE - removes all object-field relationships!
- Filter params: `category`, `is_system_field`, `page`, `page_size`
- System fields (`is_system_field=true`) cannot be deleted

**Field Structure:**
```typescript
{
  id: "fld_a1b2c3d4",
  name: "email",          // Unique identifier (snake_case)
  label: "Email Address", // Display name
  type: "email",          // Field type (see 12 types above)
  description?: string,
  category?: string,      // Grouping (e.g., "Contact Info")
  is_global: boolean,     // Global field (all users)
  is_system_field: boolean, // System field (non-deletable)
  is_custom: boolean,     // Custom field (default: true)
  config: object,         // Type-specific config (validation, options)
  created_by: string,     // User UUID
  created_at: string,
  updated_at: string
}
```

## Next Steps

Bu task tamamlandıktan sonra:
→ **04-objects-management** (Object CRUD)
→ **05-object-fields** (Add fields to objects)
