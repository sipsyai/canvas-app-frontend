# Mimari Genel Bakış

Canvas App Frontend mimarisi hakkında özet bilgi.

## Tech Stack

- **React 19** - UI framework
- **Vite 6 + SWC** - Build aracı (hızlı)
- **TypeScript 5.7** - Tip güvenliği
- **Tailwind CSS 4** - Styling
- **TanStack Query v5** - Server state
- **Zustand** - Client state
- **React Aria** - Erişilebilir UI bileşenleri

## Mimari Kararlar

### Feature-Based Organization

Her özellik kendi klasöründe:

```
features/
├── auth/           # Kimlik doğrulama
├── fields/         # Alan yönetimi
├── objects/        # Nesne yönetimi
├── records/        # Kayıt CRUD
├── relationships/  # İlişkiler
└── applications/   # Uygulama koleksiyonları
```

### State Management

| State Tipi | Çözüm |
|------------|-------|
| Server state | TanStack Query |
| Client state | Zustand |
| Form state | React Hook Form |
| URL state | React Router |

### Component Architecture

1. **UI Components** (`components/ui/`) - React Aria tabanlı
2. **Feature Components** (`features/*/components/`) - Özellik spesifik
3. **Layout Components** (`components/layout/`) - Sayfa düzeni

## Detaylı Bilgi

- [Tech Stack Detayları](tech-stack.md)
- [Proje Yapısı](project-structure.md)
