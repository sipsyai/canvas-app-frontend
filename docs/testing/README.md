# Test Rehberi

## Test Araçları

| Araç | Kullanım |
|------|----------|
| Playwright | E2E testleri |
| Vitest | Unit testler (opsiyonel) |

## Playwright Testleri

### Kurulum

```bash
# Playwright ve browser'ları yükle
pnpm exec playwright install
```

### Test Çalıştırma

```bash
# Tüm testleri çalıştır
pnpm test:e2e

# Belirli bir test dosyası
pnpm exec playwright test tests/auth.spec.ts

# UI modunda
pnpm exec playwright test --ui

# Debug modunda
pnpm exec playwright test --debug
```

### Test Yapısı

```
tests/
├── auth.spec.ts          # Authentication testleri
├── fields.spec.ts        # Field yönetimi testleri
├── objects.spec.ts       # Object testleri
└── records.spec.ts       # Record CRUD testleri
```

### Örnek Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Test Best Practices

1. **Selektörler**: `data-testid` veya ARIA rolleri kullan
2. **Bekleme**: `await expect()` kullan, sabit bekleme değil
3. **İzolasyon**: Her test bağımsız olmalı
4. **Temizlik**: Test sonrası oluşturulan verileri temizle

## CI/CD

GitHub Actions ile otomatik test:

```yaml
- name: Run E2E tests
  run: pnpm exec playwright test
```

## Test Sonuçları

```
test-results/          # Test çıktıları
playwright-report/     # HTML rapor
```

## Claude Code Entegrasyonu

`.claude/agents/playwright-test-reviewer.md` agent'ı test yazımı ve review'da yardımcı olur.
