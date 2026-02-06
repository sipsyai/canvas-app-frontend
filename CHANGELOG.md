# Changelog

Bu dosya projedeki önemli değişiklikleri içerir.

Format: [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/)

## [Unreleased]

### Eklenen
- Dark mode tam destek
  - `src/stores/themeStore.ts` — Zustand tema store (light/dark/system, localStorage persist)
  - `src/components/ui/ThemeToggle.tsx` — React Aria tema toggle butonu (Sun/Moon/Monitor)
  - Header'a ThemeToggle eklendi
  - Tüm UI primitives dark mode desteği (Input, Textarea, Select, MultiSelect, Checkbox, RadioGroup, Dialog, Table, Label)
  - Tüm feature component'ler dark mode desteği (~50 dosya)
  - `index.css` dark mode focus ring offset düzeltmesi
- Records DELETE fonksiyonalitesi
  - `DeleteRecordModal` - React Aria onay modalı
  - `useDeleteRecord` - TanStack Query mutation hook
- Records UPDATE fonksiyonalitesi
  - `EditRecordModal` - Pre-populated form ile düzenleme modalı
  - `useUpdateRecord` - TanStack Query mutation hook
- E2E test dosyası: `tests/records-crud.spec.ts` (14 test)
- Test data seed scripti: `scripts/seed-test-data.sh`
- Mode Switcher - Development/Applications mod geçişi
  - `src/stores/modeStore.ts` - Zustand store (localStorage persist)
  - `src/components/ui/ModeSwitcher.tsx` - React Aria TabList toggle
  - `src/features/apps/` - Applications mode feature
  - `/apps` route - Published apps grid görünümü
  - `/apps/:appId/*` route - App runtime (basePath desteği)
- Application Runtime UI - uygulamaya özel sidebar ve DataTable görünümü
  - `ApplicationLayout` - runtime shell component
  - `ApplicationHomePage` - uygulama ana sayfası
  - `ApplicationObjectPage` - object DataTable sayfası
- `src/lib/utils/icons.ts` - Lucide icon mapping utility
- Yeni route yapısı: `/applications/:appId/:objectId`
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
- `ApplicationsTable` - Actions kolonu kaldırıldı, satırlar tıklanabilir yapıldı, ChevronRight ikonu eklendi
- `ApplicationsListPage` - Kullanılmayan handler ve import'lar temizlendi
- `ApplicationObjectPage` - Delete ve Edit modal entegrasyonu
- `ApplicationLayout` - `basePath` prop eklendi (/applications vs /apps)
- `ApplicationHomePage` - Dynamic basePath navigation
- `Sidebar` - ModeSwitcher component + mode-based navigation
- UI bileşenleri React Aria'ya güncellendi (Button, Checkbox, Datepicker, Input, Label, MultiSelect, RadioGroup, Textarea)
- `src/features/auth/` - LoginForm ve RegisterForm iyileştirmeleri
- `src/features/fields/` - FieldsListPage güncellemeleri
- `src/features/records/` - DynamicFormField, useDynamicColumns, RecordsTablePage iyileştirmeleri
- `src/features/relationships/` - CreateRelationshipModal, LinkRecordsModal, RelatedRecordsPanel, RecordDetailPage, RelationshipsManagePage güncellemeleri
- `src/lib/api/client.ts` - API client iyileştirmeleri
- `docs/SUMMARY.md` - Dashboard ve Applications linkleri eklendi

### Düzeltilen
- Object-fields yönetim sayfası düzeltmeleri
- Tailwind 4 tema sistemi düzeltildi - `bg-primary` artık doğru çalışıyor
- UI bileşenlerinde hardcoded mavi renkler `primary` ile değiştirildi (9 bileşen)
- `stop.sh` scripti artık tüm dev server process'lerini durduruyor (port 5173/5174)

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
