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

## Runtime View (Uygulama İçi Görünüm)

Uygulama açıldığında kendi sidebar'ı olan bir runtime view gösterilir.

### URL Yapısı

| URL | Açıklama |
|-----|----------|
| `/applications/:appId` | Uygulama ana sayfası |
| `/applications/:appId/:objectId` | Object DataTable görünümü |
| `/applications/:appId/edit` | Uygulama düzenleme |
| `/applications/:appId/details` | Uygulama detayları |

### Runtime Dosyaları

```
src/features/applications/
├── components/
│   └── ApplicationLayout.tsx      # Runtime shell + sidebar
├── pages/
│   ├── ApplicationHomePage.tsx    # Uygulama ana sayfası
│   └── ApplicationObjectPage.tsx  # Object DataTable sayfası
```

### Icon Utility

`src/lib/utils/icons.ts` - Object ikonlarını Lucide icon'larına map eder.

```typescript
import { getObjectIcon } from '@/lib/utils/icons';
const Icon = getObjectIcon('Target'); // Returns Target component
```

## Mode Switcher (Mod Geçişi)

Uygulama iki ana modda çalışır:

| Mod | URL | Açıklama |
|-----|-----|----------|
| Development | `/dashboard`, `/fields`, `/objects`, `/applications` | Builder araçları |
| Applications | `/apps`, `/apps/:appId/*` | Published app kullanımı |

### Mode Switcher UI

Sidebar üstünde toggle component ile mod değiştirme:

```
┌───────────┬─────────────┐
│Development│ Applications│  ← React Aria TabList
└───────────┴─────────────┘
```

### Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `src/stores/modeStore.ts` | Mode state (Zustand persist) |
| `src/components/ui/ModeSwitcher.tsx` | Toggle component |

### Applications Mode URL Yapısı

| URL | Açıklama |
|-----|----------|
| `/apps` | Published apps grid |
| `/apps/:appId` | App runtime home |
| `/apps/:appId/:objectId` | App object DataTable |

### Applications Mode Dosyaları

```
src/features/apps/
├── pages/
│   └── AppsHomePage.tsx      # Published apps grid
├── components/
│   └── AppCard.tsx           # Uygulama kartı
```

## İlişkili Özellikler

- [Objects](objects.md) - Uygulama nesneleri
- [Dashboard](dashboard.md) - Uygulama istatistikleri
