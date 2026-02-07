# Fields (Alan Yönetimi)

## Genel Bakış

Yeniden kullanılabilir alan tipleri kütüphanesi.

## Dosyalar

```
src/features/fields/
├── components/
│   ├── FieldCard.tsx       # Alan kartı
│   └── FilterChips.tsx     # Tip filtreleme
├── pages/
│   ├── FieldsListPage.tsx  # Alan listesi sayfası
│   └── CreateFieldPage.tsx # Alan oluşturma formu
└── hooks/
    └── useFields.ts        # useFields + useCreateField hooks
```

## Alan Tipleri

| Tip | Açıklama |
|-----|----------|
| `text` | Tek satır metin |
| `email` | E-posta adresi |
| `phone` | Telefon numarası |
| `number` | Sayısal değer |
| `date` | Tarih seçici |
| `datetime` | Tarih ve saat |
| `textarea` | Çok satırlı metin |
| `select` | Dropdown (options ile) |
| `multiselect` | Çoklu seçim |
| `checkbox` | Onay kutusu |
| `radio` | Radio butonları |
| `url` | URL/link |

## API Endpoints

```
GET    /api/fields          # Tüm alanları listele
POST   /api/fields          # Yeni alan oluştur
GET    /api/fields/{id}     # Alan detayı
PUT    /api/fields/{id}     # Alan güncelle
DELETE /api/fields/{id}     # Alan sil
```

## Field Yapısı

```typescript
interface Field {
  id: string;
  name: string;
  label: string;
  field_type: FieldType;
  options?: string[];      // select/multiselect için
  is_required: boolean;
  default_value?: string;
}
```

## Sayfalar

### CreateFieldPage (`/fields/create`)

Alan oluşturma formu. Alanlar:
- **Name** — API adı (snake_case, zorunlu)
- **Label** — Görünen ad (zorunlu)
- **Type** — Alan tipi (12 tip)
- **Category** — Kategori (Contact Info, Business, System, E-commerce, Address)
- **Description** — Opsiyonel açıklama

## Hooks

### useFields
Alan listesini çeker. `category` ve `is_system_field` parametreleri desteklenir.

### useCreateField
TanStack Query mutation hook. Alan oluşturulduktan sonra `['fields']` query'sini invalidate eder.

## UI Bileşenleri

### FieldCard

Alan kartı - tip ikonu, ad ve açıklama gösterir.

### FilterChips

Alan tipine göre filtreleme chip'leri.

## İlişkili Özellikler

- [Objects](objects.md) - Alanlarin nesnelere atanması
- [Records](records.md) - Alanların kayıtlarda kullanımı
