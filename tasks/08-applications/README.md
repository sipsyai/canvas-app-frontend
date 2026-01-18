# 08. Applications

**Priority:** 🟡 Medium Priority
**Estimated Time:** 2-3 gün
**Dependencies:** 04-objects-management, 07-relationships

## Overview

No-code application management. Application'lar object, field ve relationship'lerin koleksiyonudur.

## Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/applications` | POST | Create application |
| `/api/applications` | GET | List applications |
| `/api/applications/{app_id}/publish` | POST | Publish application |
| `/api/applications/{app_id}` | DELETE | Delete application |

## Application Structure

```typescript
interface Application {
  id: string;              // app_abc12345
  name: string;            // "crm"
  label: string;           // "CRM"
  description?: string;    // "Customer Relationship Management"
  icon?: string;           // "briefcase"
  color?: string;          // "#3B82F6"
  is_published: boolean;   // false (draft) / true (published)
  config?: {               // App configuration
    modules: ["contacts", "opportunities", "companies"],
    objects: ["obj_contact", "obj_opportunity", "obj_company"],
    relationships: ["rel_contact_opportunity"]
  };
  published_at?: string;
  created_by: string;
  created_at: string;
}
```

## Key Features

- ✅ Application CRUD
- ✅ Publish/Unpublish
- ✅ App configuration (modules, objects, relationships)
- ✅ App marketplace view
- ✅ Clone application (optional)

## Application Status

**Draft** (is_published = false)
- Geliştirme aşamasında
- Sadece creator görebilir
- Değişiklik yapılabilir

**Published** (is_published = true)
- Production ready
- Tüm kullanıcılar görebilir
- published_at timestamp set edilir

## Next Steps

Bu task tamamlandıktan sonra:
→ **10-advanced-features** (Kanban board, React Flow)
