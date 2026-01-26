# Dashboard

## Genel Bakış

Ana sayfa dashboard'u - istatistikler, hızlı eylemler ve son aktiviteler.

## Dosyalar

```
src/features/dashboard/
├── components/
│   ├── StatsCard.tsx        # İstatistik kartı
│   ├── QuickActionCard.tsx  # Hızlı eylem kartı
│   └── ActivityTable.tsx    # Son aktiviteler tablosu
└── pages/
    └── DashboardPage.tsx    # Ana dashboard sayfası
```

## UI Bileşenleri

### StatsCard

İstatistik gösterimi için kart bileşeni.

```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}
```

### QuickActionCard

Hızlı erişim butonları.

```typescript
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
}
```

### ActivityTable

Son aktiviteler tablosu.

## Dashboard İstatistikleri

| İstatistik | Açıklama |
|------------|----------|
| Toplam Nesne | Tanımlı nesne sayısı |
| Toplam Alan | Alan kütüphanesindeki alan sayısı |
| Toplam Kayıt | Tüm kayıt sayısı |
| Toplam Uygulama | Uygulama sayısı |

## İlişkili Özellikler

- [Applications](applications.md) - Uygulama yönetimi
- [Objects](objects.md) - Nesne yönetimi
- [Records](records.md) - Kayıt işlemleri
