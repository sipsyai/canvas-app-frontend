# Relationships (İlişki Yönetimi)

## Genel Bakış

Nesneler arası ilişki tanımlama ve yönetimi. 1:N ve N:N ilişkileri destekler.

## Dosyalar

```
src/features/relationships/
├── components/
│   ├── CreateRelationshipModal.tsx  # İlişki oluşturma
│   ├── LinkRecordsModal.tsx         # Kayıt bağlama
│   └── RelatedRecordsPanel.tsx      # İlişkili kayıtlar
└── pages/
    ├── RelationshipsManagePage.tsx  # İlişki yönetimi
    └── RecordDetailPage.tsx         # Kayıt detay (ilişkilerle)
```

## İlişki Tipleri

| Tip | Açıklama | Örnek |
|-----|----------|-------|
| `one_to_many` | 1:N ilişki | Müşteri -> Siparişler |
| `many_to_many` | N:N ilişki | Ürün <-> Kategori |

## API Endpoints

```
GET    /api/relationships                    # Tüm ilişkiler
POST   /api/relationships                    # Yeni ilişki
GET    /api/relationships/{id}               # İlişki detayı
DELETE /api/relationships/{id}               # İlişki sil

# İlişkili Kayıtlar
GET    /api/records/{slug}/{id}/related      # İlişkili kayıtlar
POST   /api/records/{slug}/{id}/link         # Kayıt bağla
DELETE /api/records/{slug}/{id}/unlink/{rid} # Bağlantı kaldır
```

## Relationship Yapısı

```typescript
interface Relationship {
  id: string;
  name: string;
  type: 'one_to_many' | 'many_to_many';
  source_object_id: string;
  target_object_id: string;
  source_object: Object;
  target_object: Object;
}
```

## UI Akışı

### İlişki Oluşturma

1. Source nesne seçilir
2. Target nesne seçilir
3. İlişki tipi belirlenir
4. İlişki kaydedilir

### Kayıt Bağlama

1. Kayıt detay sayfasında "Related" tab'ı açılır
2. "Link Record" butonuna tıklanır
3. Modal'da hedef kayıt seçilir
4. Bağlantı kaydedilir

## İlişkili Özellikler

- [Objects](objects.md) - İlişki kaynakları
- [Records](records.md) - İlişkili kayıtlar
