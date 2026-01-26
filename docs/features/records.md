# Records (Kayıt CRUD)

## Genel Bakış

Her nesne için dinamik kayıt oluşturma, okuma, güncelleme ve silme.

## Dosyalar

```
src/features/records/
├── components/
│   ├── DynamicFormField.tsx  # Dinamik form alanı
│   ├── DeleteRecordModal.tsx # Silme onay modalı
│   └── EditRecordModal.tsx   # Düzenleme modalı
├── pages/
│   └── RecordsTablePage.tsx  # Kayıt tablosu
└── hooks/
    ├── useDynamicColumns.tsx # Dinamik tablo kolonları
    ├── useDeleteRecord.ts    # Delete mutation hook
    └── useUpdateRecord.ts    # Update mutation hook
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

## Mutation Hooks

### useDeleteRecord

Kayıt silme işlemi için TanStack Query mutation hook'u.

```typescript
const { mutate: deleteRecord, isPending } = useDeleteRecord(objectSlug);

// Kullanım
deleteRecord(recordId, {
  onSuccess: () => {
    // Başarılı silme sonrası
  }
});
```

### useUpdateRecord

Kayıt güncelleme işlemi için TanStack Query mutation hook'u.

```typescript
const { mutate: updateRecord, isPending } = useUpdateRecord(objectSlug);

// Kullanım
updateRecord({ id: recordId, data: formData }, {
  onSuccess: () => {
    // Başarılı güncelleme sonrası
  }
});
```

## Modal Bileşenleri

### DeleteRecordModal

Silme işlemi için onay modalı. React Aria `Modal` ve `Dialog` bileşenleri kullanır.

```typescript
<DeleteRecordModal
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  record={selectedRecord}
  objectSlug={objectSlug}
/>
```

### EditRecordModal

Kayıt düzenleme modalı. Form, seçilen kaydın mevcut değerleri ile pre-populated olarak açılır.

```typescript
<EditRecordModal
  isOpen={isEditOpen}
  onClose={() => setIsEditOpen(false)}
  record={selectedRecord}
  objectSlug={objectSlug}
  fields={objectFields}
/>
```

## İlişkili Özellikler

- [Objects](objects.md) - Kayıt yapısı tanımı
- [Relationships](relationships.md) - İlişkili kayıtlar
