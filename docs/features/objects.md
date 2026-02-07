# Objects (Nesne Yönetimi)

## Genel Bakış

Nesneler, kayıtların yapısını tanımlar. Her nesne bir veya daha fazla alan içerir.

## Dosyalar

```
src/features/objects/
├── components/
│   ├── ObjectCard.tsx      # Nesne kartı
│   ├── IconPicker.tsx      # İkon seçici (dark mode destekli)
│   └── ColorPicker.tsx     # Renk seçici
├── pages/
│   ├── ObjectsListPage.tsx     # Nesne listesi (dark mode destekli)
│   ├── CreateObjectPage.tsx    # Nesne oluşturma (dark mode destekli)
│   └── EditObjectPage.tsx      # Nesne düzenleme (dark mode destekli)
└── hooks/ (opsiyonel)

src/features/object-fields/
├── components/
│   └── AttachedFieldsList.tsx  # Atanmış alanlar
└── pages/
    └── ObjectFieldsManagePage.tsx  # Alan atama sayfası
```

## API Endpoints

```
GET    /api/objects              # Tüm nesneler
POST   /api/objects              # Yeni nesne
GET    /api/objects/{slug}       # Nesne detayı
PUT    /api/objects/{slug}       # Nesne güncelle
DELETE /api/objects/{slug}       # Nesne sil

# Object-Fields Junction
GET    /api/objects/{slug}/fields    # Nesneye atanmış alanlar
POST   /api/object-fields            # Alan ata
PUT    /api/object-fields/{id}       # Sıralama güncelle
DELETE /api/object-fields/{id}       # Alan çıkar
```

## Object Yapısı

```typescript
interface Object {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}
```

## Object-Field İlişkisi

```typescript
interface ObjectField {
  id: string;
  object_id: string;
  field_id: string;
  order: number;
  is_required: boolean;
  is_visible: boolean;
  field: Field;  // İlişkili alan bilgisi
}
```

## Drag & Drop Sıralama

`@dnd-kit` ile alanların sıralaması değiştirilebilir.

## İlişkili Özellikler

- [Fields](fields.md) - Alan kütüphanesi
- [Records](records.md) - Nesne tabanlı kayıtlar
