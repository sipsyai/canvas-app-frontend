# 01. Authentication

**Priority:** 🔴 High Priority
**Estimated Time:** 3-4 gün
**Dependencies:** Hiç yok (ilk başlanacak task)

## Overview

Kullanıcı kimlik doğrulama sistemi. JWT token tabanlı authentication, login/register sayfaları ve protected routes.

## Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Yeni kullanıcı kaydı |
| `/api/auth/login` | POST | Kullanıcı girişi (form-data!) |
| `/api/auth/me` | GET | Mevcut kullanıcı bilgisi |
| `/api/auth/logout` | POST | Kullanıcı çıkışı |

## Tasks

1. **01-login-page.md** - Login sayfası ve JWT token yönetimi
2. **02-register-page.md** - Register sayfası
3. **03-protected-routes.md** - Route koruma (auth required)
4. **04-jwt-token-management.md** - Token expiry, refresh, logout

## Key Features

- ✅ Email + Password login
- ✅ JWT token localStorage'da saklanır
- ✅ Token expiry check (1 saat)
- ✅ Auto-logout on token expiry
- ✅ Protected routes (redirect to login)
- ✅ Remember me (optional)

## Technical Notes

### ⚠️ IMPORTANT: Login Form Data
Login endpoint **application/x-www-form-urlencoded** bekler, JSON değil!

```javascript
// ❌ YANLIŞ
fetch('/api/auth/login', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// ✅ DOĞRU
const formData = new URLSearchParams();
formData.append('username', email); // NOT 'email', use 'username'!
formData.append('password', password);

fetch('/api/auth/login', {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: formData
});
```

### JWT Token Structure
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Token Payload
```json
{
  "sub": "user@example.com",
  "exp": 1737204800
}
```

## Acceptance Criteria

- [ ] Login sayfası çalışıyor
- [ ] Register sayfası çalışıyor
- [ ] JWT token localStorage'da saklanıyor
- [ ] Token expiry check çalışıyor
- [ ] Protected routes redirect ediyor
- [ ] Logout fonksiyonu token'ı siliyor
- [ ] Error handling doğru çalışıyor (401, 422)
- [ ] Form validation yapılıyor (Zod + React Hook Form)

## Tech Stack

- **Form Management:** React Hook Form v7
- **Validation:** Zod
- **API Client:** Axios
- **State Management:** TanStack Query (cache for user data)
- **Router:** React Router v6 (protected routes)
- **UI Components:** React Aria Components

## Next Steps

Bu task tamamlandıktan sonra:
→ **02-api-integration** (API client setup, TanStack Query config)
