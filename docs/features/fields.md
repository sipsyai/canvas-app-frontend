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
│   └── FieldsListPage.tsx  # Alan listesi sayfası
└── hooks/ (opsiyonel)
```

## Alan Tipleri

| Tip | Açıklama |
|-----|----------|
| `text` | Tek satır metin |
| `textarea` | Çok satırlı metin |
| `number` | Sayısal değer |
| `date` | Tarih seçici |
| `boolean` | Checkbox |
| `select` | Dropdown (options ile) |
| `multiselect` | Çoklu seçim |
| `lookup` | İlişkisel alan |

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

## UI Bileşenleri

### FieldCard

Alan kartı - tip ikonu, ad ve açıklama gösterir.

### FilterChips

Alan tipine göre filtreleme chip'leri.

## İlişkili Özellikler

- [Objects](objects.md) - Alanlarin nesnelere atanması
- [Records](records.md) - Alanların kayıtlarda kullanımı
