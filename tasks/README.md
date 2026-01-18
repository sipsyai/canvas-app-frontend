# Canvas App Frontend - Development Tasks

Backend analizi tamamlandı. Toplam **34 endpoint** ve **8 ana API kategorisi** tespit edildi.

## 📊 Backend API Özeti

| API Kategorisi | Endpoint Sayısı | Durum |
|----------------|-----------------|-------|
| Authentication | 4 endpoints | ✅ Hazır |
| Fields API | 5 endpoints | ✅ Hazır |
| Objects API | 5 endpoints | ✅ Hazır |
| Object-Fields API | 5 endpoints | ✅ Hazır |
| Records API | 6 endpoints | ✅ Hazır |
| Relationships API | 3 endpoints | ✅ Hazır |
| Relationship-Records API | 3 endpoints | ✅ Hazır |
| Applications API | 4 endpoints | ✅ Hazır |

**Backend URL:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

---

## 🎯 Frontend Development Tasks

### Priority Levels
- 🔴 **High Priority** - Core functionality (Authentication, API setup)
- 🟡 **Medium Priority** - Main features (Fields, Objects, Records)
- 🟢 **Low Priority** - Advanced features (Kanban, React Flow)

---

## Task Klasörleri

### 1️⃣ Authentication (🔴 High Priority)
**Klasör:** `/tasks/01-authentication`
- Login sayfası ve JWT token yönetimi
- Register sayfası
- Protected routes
- Token expiry handling

**Bağımlılıklar:** Hiç yok (ilk başlanacak task)

---

### 2️⃣ API Integration (🔴 High Priority)
**Klasör:** `/tasks/02-api-integration`
- Axios client setup
- TanStack Query configuration
- Custom API hooks
- Error handling

**Bağımlılıklar:** Authentication

---

### 3️⃣ Fields Library (🟡 Medium Priority)
**Klasör:** `/tasks/03-fields-library`
- Field list page (tablo view)
- Create field form (12 farklı field type)
- Edit field form
- Delete field with confirmation

**Bağımlılıklar:** API Integration, UI Components

**Backend Endpoints:**
- `POST /api/fields` - Create field
- `GET /api/fields` - List fields
- `GET /api/fields/{field_id}` - Get field
- `PATCH /api/fields/{field_id}` - Update field
- `DELETE /api/fields/{field_id}` - Delete field

---

### 4️⃣ Objects Management (🟡 Medium Priority)
**Klasör:** `/tasks/04-objects-management`
- Object list page (card view)
- Create object form
- Edit object form (icon, color picker)
- Delete object with cascade warning

**Bağımlılıklar:** API Integration, UI Components

**Backend Endpoints:**
- `POST /api/objects` - Create object
- `GET /api/objects` - List objects
- `GET /api/objects/{object_id}` - Get object
- `PATCH /api/objects/{object_id}` - Update object
- `DELETE /api/objects/{object_id}` - Delete object

---

### 5️⃣ Object-Fields (🟡 Medium Priority)
**Klasör:** `/tasks/05-object-fields`
- Add field to object (drag-drop)
- Field ordering (display_order)
- Field validation rules
- Primary field selection

**Bağımlılıklar:** Fields Library, Objects Management

**Backend Endpoints:**
- `POST /api/object-fields` - Add field to object
- `GET /api/object-fields?object_id={id}` - List object fields
- `PATCH /api/object-fields/{id}` - Update object-field
- `DELETE /api/object-fields/{id}` - Remove field from object

---

### 6️⃣ Records Table (🟡 Medium Priority)
**Klasör:** `/tasks/06-records-table`
- Record table view (TanStack Table)
- Create record form (dynamic fields)
- Edit record form
- Delete record
- Search records
- Pagination

**Bağımlılıklar:** Object-Fields

**Backend Endpoints:**
- `POST /api/records` - Create record
- `GET /api/records?object_id={id}` - List records
- `GET /api/records/{record_id}` - Get record
- `PATCH /api/records/{record_id}` - Update record (MERGE)
- `DELETE /api/records/{record_id}` - Delete record
- `GET /api/records/search?object_id={id}&q={query}` - Search records

**Önemli:** JSONB `data` field'ı MERGE edilir, overwrite edilmez!

---

### 7️⃣ Relationships (🟡 Medium Priority)
**Klasör:** `/tasks/07-relationships`
- Relationship tanımlama (1:N, N:N)
- Record linking UI
- Related records view
- Bidirectional query handling

**Bağımlılıklar:** Records Table

**Backend Endpoints:**
- `POST /api/relationships` - Create relationship
- `GET /api/relationships/objects/{object_id}` - Get object relationships
- `DELETE /api/relationships/{relationship_id}` - Delete relationship
- `POST /api/relationship-records` - Link records
- `GET /api/relationship-records/records/{record_id}/related?relationship_id={id}` - Get related
- `DELETE /api/relationship-records/{link_id}` - Unlink records

---

### 8️⃣ Applications (🟡 Medium Priority)
**Klasör:** `/tasks/08-applications`
- Application list page
- Create application
- Publish application
- Application config editor

**Bağımlılıklar:** Objects Management, Relationships

**Backend Endpoints:**
- `POST /api/applications` - Create application
- `GET /api/applications` - List applications
- `POST /api/applications/{app_id}/publish` - Publish app
- `DELETE /api/applications/{app_id}` - Delete application

---

### 9️⃣ UI Components (🔴 High Priority)
**Klasör:** `/tasks/09-ui-components`
- Button component (React Aria)
- Input component (text, email, phone, number)
- Dialog component (modal)
- Table component (TanStack Table)
- Select component (dropdown)
- Checkbox component
- DatePicker component

**Bağımlılıklar:** React Aria Components setup

**Teknoloji:**
- React Aria Components 1.5
- Tailwind CSS 4
- class-variance-authority (variants)

---

### 🔟 Advanced Features (🟢 Low Priority)
**Klasör:** `/tasks/10-advanced-features`
- Kanban board view (dnd-kit)
- React Flow integration (workflow editor)
- Dark mode toggle
- Export/Import data

**Bağımlılıklar:** Tüm temel feature'lar

---

## 🚀 Önerilen Geliştirme Sırası

### Phase 1: Foundation (1-2 hafta)
1. ✅ Project setup (DONE)
2. 🟡 Authentication (01-authentication)
3. 🟡 API Integration (02-api-integration)
4. 🟡 UI Components (09-ui-components)

### Phase 2: Core Features (2-3 hafta)
5. 🟡 Fields Library (03-fields-library)
6. 🟡 Objects Management (04-objects-management)
7. 🟡 Object-Fields (05-object-fields)

### Phase 3: Data Management (2-3 hafta)
8. 🟡 Records Table (06-records-table)
9. 🟡 Relationships (07-relationships)
10. 🟡 Applications (08-applications)

### Phase 4: Advanced Features (1-2 hafta)
11. 🟢 Kanban Board
12. 🟢 React Flow Integration

---

## 📝 Task Dosya Formatı

Her task klasöründe:
- `README.md` - Klasör özeti
- `01-task-name.md` - Detaylı task açıklaması
  - **Objective:** Ne yapılacak
  - **Backend API:** Hangi endpoint'ler kullanılacak
  - **UI/UX:** Kullanıcı deneyimi
  - **Technical Details:** Teknik detaylar
  - **Dependencies:** Bağımlılıklar
  - **Acceptance Criteria:** Tamamlanma kriterleri
  - **Code Examples:** Kod örnekleri

---

## ⚠️ Backend Önemli Notlar

### Authentication
- Login endpoint **form-data** bekler (JSON değil!)
- `username` field'ına email gönderilmeli
- JWT token 1 saat geçerli
- Token expiry handling yapılmalı

### Records API
- `data` field'ı JSONB (dinamik)
- Update işlemi **MERGE** eder (overwrite etmez)
- Field ID'leri kullanılmalı (field name değil!)
- `primary_value` otomatik set edilir

### Query Parameters
- `object_id` zorunlu: `/api/records`, `/api/object-fields`
- `relationship_id` zorunlu: `/api/relationship-records/...`

### Cascade Deletes
- Field silindiğinde → object-field ilişkileri silinir
- Object silindiğinde → record'lar, object-fields, relationships silinir
- Relationship silindiğinde → relationship_records silinir

---

## 📚 Kaynaklar

### Backend Documentation (Local Copy)
- [API Documentation Index](../backend-docs/api/00-API-DOCUMENTATION-INDEX.md) - 34 endpoint overview
- [Frontend Developer Guide](../backend-docs/api/00-FRONTEND-GUIDE.md) - Complete frontend guide
- [Database Schema](../backend-docs/database/DATABASE_SCHEMA.md) - Database structure
- [ER Diagram](../backend-docs/database/DATABASE_ER_DIAGRAM.md) - Visual schema

### Backend API Categories
- [Authentication](../backend-docs/api/01-authentication/README.md) - Login, Register, JWT
- [Fields API](../backend-docs/api/02-fields/README.md) - Field CRUD
- [Objects API](../backend-docs/api/03-objects/README.md) - Object CRUD
- [Records API](../backend-docs/api/04-records/README.md) - Record CRUD + Search
- [Applications API](../backend-docs/api/05-applications/README.md) - App management
- [Relationships API](../backend-docs/api/06-relationships/README.md) - Object relationships
- [Object-Fields API](../backend-docs/api/07-object-fields/README.md) - Junction table
- [Relationship-Records API](../backend-docs/api/08-relationship-records/README.md) - Record linking

### Live Backend
- [Swagger UI](http://localhost:8000/docs) - Interactive API docs
- [ReDoc](http://localhost:8000/redoc) - Alternative API docs

### Frontend Documentation
- [Frontend Tech Stack Research](../FRONTEND_TECHNOLOGY_RESEARCH.md)

---

**Last Updated:** 2026-01-18
**Status:** ✅ Task organization complete
**Next Step:** Start with Phase 1 (Authentication)
