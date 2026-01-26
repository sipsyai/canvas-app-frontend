# Hızlı Başlangıç

Canvas App Frontend'i çalıştırmak için hızlı rehber.

## Gereksinimler

- Node.js 18+
- pnpm 8+
- Backend sunucusu (http://localhost:8000)

## Kurulum

```bash
# Bağımlılıkları yükle
pnpm install

# Build scriptlerini onayla (ilk kurulumda gerekli)
pnpm approve-builds
```

## Çalıştırma

```bash
# Development sunucusunu başlat
./start.sh

# veya manuel olarak
pnpm dev
```

Frontend: http://localhost:5173
Backend: http://localhost:8000

## Durdurma

```bash
./stop.sh
```

## Ortam Değişkenleri

`.env.local` dosyası:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Temel Komutlar

| Komut | Açıklama |
|-------|----------|
| `pnpm dev` | Development sunucusu |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint kontrolü |
| `pnpm type-check` | TypeScript kontrolü |

## Sonraki Adımlar

- [Detaylı Kurulum](setup.md) - IDE yapılandırması ve araçlar
- [Proje Yapısı](../architecture/project-structure.md) - Kod organizasyonu
- [API Rehberi](../api/README.md) - Backend entegrasyonu
