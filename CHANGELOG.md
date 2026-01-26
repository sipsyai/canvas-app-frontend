# Changelog

Bu dosya projedeki önemli değişiklikleri içerir.

Format: [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/)

## [Unreleased]

### Eklenen
- `/ship` komutu eklendi - dokümantasyon güncelleme, changelog yazma ve commit işlemleri
- `.claude/rules/` klasörü - erişilebilirlik, bileşen, API ve TypeScript kuralları
- `docs/` klasörü - yapılandırılmış proje dokümantasyonu
- `src/features/dashboard/` - istatistik kartları ve son aktiviteler
- `src/components/layout/` - layout bileşenleri
- `src/stores/` - Zustand state yönetimi
- Yeni UI bileşenleri: Avatar, Badge, Card, Stepper, Tabs
- `docs/features/applications.md` - uygulama yönetimi dokümantasyonu
- `docs/features/dashboard.md` - dashboard dokümantasyonu

### Değiştirilen
- UI bileşenleri React Aria'ya güncellendi (Button, Checkbox, Datepicker, Input, Label, MultiSelect, RadioGroup, Textarea)
- `src/features/auth/` - LoginForm ve RegisterForm iyileştirmeleri
- `src/features/fields/` - FieldsListPage güncellemeleri
- `src/features/records/` - DynamicFormField, useDynamicColumns, RecordsTablePage iyileştirmeleri
- `src/features/relationships/` - CreateRelationshipModal, LinkRecordsModal, RelatedRecordsPanel, RecordDetailPage, RelationshipsManagePage güncellemeleri
- `src/lib/api/client.ts` - API client iyileştirmeleri
- `docs/SUMMARY.md` - Dashboard ve Applications linkleri eklendi

### Düzeltilen
- Object-fields yönetim sayfası düzeltmeleri

### Kaldırılan
- Eski dokümantasyon dosyaları kaldırıldı (docs/ klasörüne taşındı):
  - 00-FRONTEND-GUIDE.md
  - AUTHENTICATION_IMPLEMENTATION_SUMMARY.md
  - BACKEND_DOCS_UPDATE_SUMMARY.md
  - FRONTEND_TECHNOLOGY_RESEARCH.md
  - LOGIN_PAGE_FIXES.md
  - LOGIN_PAGE_SUMMARY.md
  - LOGIN_PAGE_TEST_REPORT.md
  - LOGIN_PAGE_VISUAL_ANALYSIS.md
  - PHASE4_TEST_REPORT.md
  - PLAYWRIGHT_TEST_RESULTS.md
  - SETUP_COMPLETE.md
  - TASK_SUMMARY.md

---

## [1.0.0] - 2026-01-26

### Eklenen
- İlk sürüm
- Authentication sistemi (login, register, logout)
- Fields yönetimi (alan kütüphanesi)
- Objects yönetimi (nesne tanımlama)
- Object-Fields junction (sürükle-bırak alan ekleme)
- Records CRUD işlemleri (dinamik form ve tablo)
- Relationships yönetimi (1:N, N:N ilişkiler)
- Applications yönetimi (uygulama tanımlama)
- Dashboard sayfası
- React Aria ile erişilebilir UI bileşenleri (WCAG 2.1 AA)
- Zustand ile state yönetimi
- TanStack Query ile API cache yönetimi
