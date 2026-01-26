# Records (Kayıt CRUD)

## Genel Bakış

Her nesne için dinamik kayıt oluşturma, okuma, güncelleme ve silme.

## Dosyalar

```
src/features/records/
├── components/
│   └── DynamicFormField.tsx  # Dinamik form alanı
├── pages/
│   └── RecordsTablePage.tsx  # Kayıt tablosu
└── hooks/
    └── useDynamicColumns.tsx # Dinamik tablo kolonları
```

## API Endpoints

```
GET    /api/records/{object_slug}         # Kayıtları listele
POST   /api/records/{object_slug}         # Yeni kayıt
GET    /api/records/{object_slug}/{id}    # Kayıt detayı
PUT    /api/records/{object_slug}/{id}    # Kayıt güncelle
DELETE /api/records/{object_slug}/{id}    # Kayıt sil
```

## Record Yapısı

```typescript
interface Record {
  id: string;
  object_slug: string;
  data: Record<string, any>;  # Dinamik alan değerleri
  created_at: string;
  updated_at: string;
}
```

## Dinamik Form

`DynamicFormField` bileşeni alan tipine göre uygun input render eder:

| Field Type | Component |
|------------|-----------|
| text | TextField |
| textarea | TextArea |
| number | NumberField |
| date | DatePicker |
| boolean | Checkbox |
| select | Select |
| multiselect | MultiSelect |

## TanStack Table

`useDynamicColumns` hook'u nesnenin alanlarından tablo kolonları oluşturur.

```typescript
const columns = useDynamicColumns(objectFields);
```

## İlişkili Özellikler

- [Objects](objects.md) - Kayıt yapısı tanımı
- [Relationships](relationships.md) - İlişkili kayıtlar
