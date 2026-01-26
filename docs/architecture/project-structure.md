# Proje Yapısı

Canvas App Frontend klasör organizasyonu.

## Kök Dizin

```
canvas-app-frontend/
├── src/                    # Kaynak kod
├── docs/                   # Dokümantasyon
├── .claude/                # Claude Code yapılandırması
├── backend-docs/           # Backend API şemaları
├── tasks/                  # Görev dosyaları
├── public/                 # Statik dosyalar
├── index.html              # HTML giriş noktası
├── vite.config.ts          # Vite yapılandırması
├── tailwind.config.ts      # Tailwind yapılandırması
├── tsconfig.json           # TypeScript yapılandırması
└── package.json            # Bağımlılıklar
```

## src/ Yapısı

```
src/
├── app/                    # Uygulama başlatma
│   ├── App.tsx            # Ana bileşen
│   └── router.tsx         # Route tanımları
│
├── features/               # Özellik modülleri
│   ├── auth/              # Kimlik doğrulama
│   │   ├── components/    # Auth bileşenleri
│   │   ├── hooks/         # Auth hook'ları
│   │   └── pages/         # Auth sayfaları
│   ├── fields/            # Alan yönetimi
│   ├── objects/           # Nesne yönetimi
│   ├── records/           # Kayıt CRUD
│   ├── relationships/     # İlişki yönetimi
│   ├── applications/      # Uygulama koleksiyonları
│   ├── apps/              # Applications mode (published apps)
│   └── dashboard/         # Dashboard
│
├── components/             # Paylaşılan bileşenler
│   ├── ui/                # UI primitives (React Aria)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Select.tsx
│   │   └── ...
│   ├── layout/            # Düzen bileşenleri
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── common/            # Genel bileşenler
│
├── lib/                    # Yardımcı kütüphaneler
│   ├── api/               # API istemcisi
│   │   ├── client.ts      # Axios instance
│   │   └── *.api.ts       # API fonksiyonları
│   └── utils/             # Utility fonksiyonlar
│       └── cn.ts          # Class birleştirme
│
├── stores/                 # Zustand store'lar
│   ├── authStore.ts       # Auth state
│   └── modeStore.ts       # Mode state (development/applications)
│
├── hooks/                  # Global hook'lar
├── types/                  # TypeScript tipleri
└── index.css              # Global stiller
```

## Feature Modülü Yapısı

Her feature şu yapıyı takip eder:

```
features/[feature-name]/
├── components/            # Feature-specific bileşenler
│   ├── FeatureList.tsx
│   ├── FeatureCard.tsx
│   └── FeatureModal.tsx
├── hooks/                 # Feature hook'ları
│   └── useFeature.ts
├── pages/                 # Sayfa bileşenleri
│   ├── FeatureListPage.tsx
│   └── FeatureDetailPage.tsx
└── types/                 # Feature tipleri (opsiyonel)
```

## Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `src/lib/api/client.ts` | Axios instance ve interceptors |
| `src/app/router.tsx` | Route tanımları |
| `src/stores/authStore.ts` | Authentication state |
| `src/components/ui/*` | React Aria bileşenleri |

## İsimlendirme Kuralları

- **Bileşenler**: PascalCase (`Button.tsx`)
- **Hook'lar**: camelCase, `use` prefix (`useAuth.ts`)
- **API fonksiyonları**: camelCase (`getRecords.ts`)
- **Tipler**: PascalCase, `Types` suffix opsiyonel (`User`, `RecordTypes`)
