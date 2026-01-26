# Detaylı Kurulum

Geliştirme ortamı için kapsamlı kurulum rehberi.

## IDE Yapılandırması

### VS Code Önerilen Eklentiler

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code Ayarları

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

## Proje Yapısı

```
canvas-app-frontend/
├── src/
│   ├── app/              # Uygulama giriş noktası
│   ├── features/         # Özellik modülleri
│   ├── components/       # Paylaşılan bileşenler
│   ├── lib/              # Yardımcı fonksiyonlar
│   └── stores/           # Zustand store'lar
├── docs/                 # Dokümantasyon
├── .claude/              # Claude Code yapılandırması
└── backend-docs/         # Backend API şemaları
```

## Backend Bağlantısı

### Yerel Geliştirme

Backend'in localhost:8000'de çalıştığından emin olun:

```bash
# Backend dizininde
uvicorn main:app --reload
```

### Ortam Değişkenleri

| Dosya | Kullanım |
|-------|----------|
| `.env.local` | Yerel geliştirme |
| `.env.development` | Development ortamı |
| `.env.production` | Production ortamı |

## Test Ortamı

```bash
# E2E testleri için Playwright kurulumu
pnpm exec playwright install

# Testleri çalıştır
pnpm test:e2e
```

## Sorun Giderme

### Port Çakışması

```bash
# 5173 portunu kullanan işlemi bul ve kapat
lsof -i :5173
kill -9 <PID>
```

### Node Modülleri Temizleme

```bash
rm -rf node_modules
pnpm install
```

### TypeScript Hataları

```bash
pnpm type-check
```
