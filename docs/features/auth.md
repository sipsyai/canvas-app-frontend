# Authentication (Kimlik Doğrulama)

## Genel Bakış

JWT tabanlı kimlik doğrulama sistemi.

## Dosyalar

```
src/features/auth/
├── components/
│   ├── LoginForm.tsx      # Giriş formu
│   └── RegisterForm.tsx   # Kayıt formu
├── pages/
│   ├── LoginPage.tsx      # Giriş sayfası
│   └── RegisterPage.tsx   # Kayıt sayfası
└── hooks/
    └── useAuth.ts         # Auth hook (opsiyonel)
```

## Login Akışı

1. Kullanıcı email/şifre girer
2. `POST /api/auth/login` çağrılır
3. Token alınır ve localStorage'a kaydedilir
4. Dashboard'a yönlendirilir

## Önemli Notlar

### Login Form Data

```typescript
// ÖNEMLI: Content-Type form-urlencoded
// ÖNEMLI: Field adı "username" (email değil!)

const formData = new URLSearchParams();
formData.append('username', email);
formData.append('password', password);

await apiClient.post('/api/auth/login', formData, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
```

### Token Yönetimi

```typescript
// Kaydet
localStorage.setItem('access_token', token);

// Al
const token = localStorage.getItem('access_token');

// Sil (logout veya 401)
localStorage.removeItem('access_token');
```

## Protected Routes

`PrivateRoute` bileşeni token kontrolü yapar:

```typescript
// Token yoksa login'e yönlendir
if (!token) {
  return <Navigate to="/login" />;
}
```

## Zustand Store

```typescript
// src/stores/authStore.ts
interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}
```
