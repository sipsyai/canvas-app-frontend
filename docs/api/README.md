# API Rehberi

Backend API entegrasyonu için rehber.

## API İstemcisi

Konum: `src/lib/api/client.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT token otomatik ekleme
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Endpoint Listesi

| Endpoint | Açıklama |
|----------|----------|
| `/api/auth/login` | Giriş (POST) |
| `/api/auth/register` | Kayıt (POST) |
| `/api/fields` | Alan yönetimi |
| `/api/objects` | Nesne yönetimi |
| `/api/records/{object}` | Kayıt CRUD |
| `/api/relationships` | İlişki yönetimi |
| `/api/applications` | Uygulama yönetimi |

## TanStack Query Kullanımı

### Veri Çekme

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['records', objectSlug],
  queryFn: () => recordsApi.getRecords(objectSlug),
});
```

### Mutation

```typescript
const mutation = useMutation({
  mutationFn: recordsApi.createRecord,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['records'] });
  },
});
```

## Hata Yönetimi

401 hatası alındığında token silinir ve login sayfasına yönlendirilir.

## Detaylı Bilgi

- [Frontend Guide](frontend-guide.md) - Tüm endpoint detayları
- [Backend Docs](/backend-docs/) - OpenAPI şemaları
