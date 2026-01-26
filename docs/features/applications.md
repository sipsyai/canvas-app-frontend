# Applications (Uygulama Yönetimi)

## Genel Bakış

Uygulama tanımlama ve yönetimi. Şablonlardan uygulama oluşturma ve yapılandırma.

## Dosyalar

```
src/features/applications/
├── components/
│   ├── ApplicationsTable.tsx         # Uygulama listesi tablosu
│   ├── ApplicationsTableEmpty.tsx    # Boş durum
│   ├── ApplicationsTableSkeleton.tsx # Yükleme iskeleti
│   ├── TemplateSelector.tsx          # Şablon seçici
│   └── ConfigEditor.tsx              # Yapılandırma editörü
├── pages/
│   ├── ApplicationsListPage.tsx      # Liste sayfası
│   ├── CreateApplicationPage.tsx     # Oluşturma sayfası
│   ├── ApplicationDetailPage.tsx     # Detay sayfası
│   └── EditApplicationPage.tsx       # Düzenleme sayfası
├── hooks/
│   └── useApplications.ts            # Uygulama API hook'ları
└── constants/
    └── templates.ts                  # Uygulama şablonları
```

## API Endpoints

```
GET    /api/applications          # Tüm uygulamaları listele
POST   /api/applications          # Yeni uygulama oluştur
GET    /api/applications/{id}     # Uygulama detayı
PUT    /api/applications/{id}     # Uygulama güncelle
DELETE /api/applications/{id}     # Uygulama sil
```

## Application Yapısı

```typescript
interface Application {
  id: string;
  name: string;
  description?: string;
  template: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
```

## Şablonlar

| Şablon | Açıklama |
|--------|----------|
| `blank` | Boş uygulama |
| `crm` | Müşteri ilişkileri yönetimi |
| `inventory` | Envanter takibi |
| `project` | Proje yönetimi |

## UI Bileşenleri

### ApplicationsTable

TanStack Table ile uygulama listesi.

### TemplateSelector

Görsel şablon seçici kartları.

### ConfigEditor

JSON yapılandırma editörü.

## İlişkili Özellikler

- [Objects](objects.md) - Uygulama nesneleri
- [Dashboard](dashboard.md) - Uygulama istatistikleri
