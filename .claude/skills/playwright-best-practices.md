---
name: playwright-best-practices
description: Comprehensive Playwright testing patterns and best practices for React applications. Reference guide for test reliability, accessibility, and performance.
---

# Playwright Testing Best Practices for React Applications

This guide provides battle-tested patterns for writing reliable, maintainable Playwright tests for modern React applications.

---

## 1. Selector Strategies

### ✅ Recommended: Use Test IDs
```typescript
// Component
<button data-testid="submit-button">Submit</button>

// Test
await page.click('[data-testid="submit-button"]');
```

### ✅ Recommended: Use Accessible Roles
```typescript
// Prefer Playwright's role selectors
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
await page.getByRole('heading', { level: 1 }).textContent();
```

### ✅ Recommended: Use ARIA Labels
```typescript
await page.getByLabel('Email address').fill('test@example.com');
await page.getByPlaceholder('Enter your email').fill('test@example.com');
```

### ❌ Avoid: CSS Selectors with Implementation Details
```typescript
// BAD - Breaks when styling changes
await page.click('.btn-primary.rounded-lg.px-4.py-2');

// GOOD - Resilient to style changes
await page.click('[data-testid="login-button"]');
```

### ❌ Avoid: XPath
```typescript
// BAD - Hard to read and maintain
await page.click('//*[@id="root"]/div/div[2]/button[1]');

// GOOD - Use data-testid or role selectors
await page.getByRole('button', { name: 'Login' }).click();
```

---

## 2. Wait Strategies

### ✅ Auto-waiting Assertions (Preferred)
```typescript
// Playwright automatically waits up to 30s for these
await expect(page.locator('.success-message')).toBeVisible();
await expect(page.locator('.loading')).toBeHidden();
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle('Dashboard');
```

### ✅ Explicit Waits for Specific Conditions
```typescript
// Wait for selector to appear
await page.waitForSelector('[data-testid="user-profile"]');

// Wait for selector to disappear
await page.waitForSelector('.loading-spinner', { state: 'hidden' });

// Wait for network request
await page.waitForResponse(resp =>
  resp.url().includes('/api/users') && resp.status() === 200
);

// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for navigation
await page.waitForURL('/dashboard');
```

### ❌ Avoid: Hard-coded Timeouts
```typescript
// BAD - Flaky and slow
await page.waitForTimeout(5000);
await page.click('.submit-button');

// GOOD - Wait for actual condition
await page.waitForSelector('.submit-button:not(:disabled)');
await page.click('.submit-button');
```

---

## 3. React-Specific Patterns

### Testing React 19 Concurrent Features
```typescript
test('should handle concurrent rendering', async ({ page }) => {
  await page.goto('/dashboard');

  // Click button that triggers concurrent update
  await page.click('[data-testid="load-data"]');

  // Wait for both high and low priority updates
  await expect(page.locator('[data-testid="urgent-info"]'))
    .toBeVisible();
  await expect(page.locator('[data-testid="detailed-info"]'))
    .toBeVisible();
});
```

### Testing React Hook Form
```typescript
test('should validate form with Zod schema', async ({ page }) => {
  await page.goto('/register');

  // Fill invalid data
  await page.fill('[name="email"]', 'invalid-email');
  await page.fill('[name="password"]', '123'); // Too short

  // Submit form
  await page.click('[type="submit"]');

  // Verify validation errors
  await expect(page.locator('.error-message'))
    .toContainText('Invalid email format');
  await expect(page.locator('.error-message'))
    .toContainText('Password must be at least 8 characters');
});
```

### Testing React Query
```typescript
test('should handle loading and error states', async ({ page }) => {
  // Mock API failure
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Server error' })
    });
  });

  await page.goto('/users');

  // Verify loading state
  await expect(page.locator('[data-testid="loading-spinner"]'))
    .toBeVisible();

  // Verify error state after request fails
  await expect(page.locator('.error-banner'))
    .toContainText('Failed to load users');

  // Verify retry button
  await expect(page.locator('[data-testid="retry-button"]'))
    .toBeVisible();
});
```

### Testing Zustand State
```typescript
test('should persist state in Zustand store', async ({ page }) => {
  await page.goto('/settings');

  // Change setting
  await page.click('[data-testid="dark-mode-toggle"]');

  // Navigate away and back
  await page.goto('/dashboard');
  await page.goto('/settings');

  // Verify state persisted
  const toggle = page.locator('[data-testid="dark-mode-toggle"]');
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
});
```

---

## 4. Authentication Testing

### Login Flow with Token Storage
```typescript
test('should login and store auth token', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('[type="submit"]');

  // Wait for redirect
  await page.waitForURL('/dashboard');

  // Verify token in localStorage
  const token = await page.evaluate(() =>
    localStorage.getItem('auth_token')
  );
  expect(token).toBeTruthy();
  expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/); // JWT format
});
```

### Authenticated Context (Reusable Setup)
```typescript
// auth.setup.ts
import { test as setup } from '@playwright/test';

const authFile = '.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('[type="submit"]');

  await page.waitForURL('/dashboard');

  // Save authentication state
  await page.context().storageState({ path: authFile });
});

// tests/dashboard.spec.ts
import { test } from '@playwright/test';

test.use({ storageState: '.auth/user.json' });

test('dashboard shows user data', async ({ page }) => {
  await page.goto('/dashboard');
  // Already authenticated!
  await expect(page.locator('[data-testid="user-name"]'))
    .toContainText('Test User');
});
```

### Testing Protected Routes
```typescript
test('should redirect to login for protected routes', async ({ page }) => {
  // Try to access dashboard without authentication
  await page.goto('/dashboard');

  // Should redirect to login
  await page.waitForURL('/login');

  // Verify redirect message
  await expect(page.locator('.alert-info'))
    .toContainText('Please login to continue');

  // Verify returnUrl is preserved
  expect(page.url()).toContain('returnUrl=%2Fdashboard');
});
```

---

## 5. API Testing Patterns

### Mocking API Responses
```typescript
test('should display user data from API', async ({ page }) => {
  // Mock successful response
  await page.route('**/api/users/123', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 123,
        name: 'John Doe',
        email: 'john@example.com'
      })
    });
  });

  await page.goto('/users/123');

  await expect(page.locator('[data-testid="user-name"]'))
    .toContainText('John Doe');
  await expect(page.locator('[data-testid="user-email"]'))
    .toContainText('john@example.com');
});
```

### Testing Error Handling
```typescript
test('should retry failed requests', async ({ page }) => {
  let requestCount = 0;

  await page.route('**/api/data', route => {
    requestCount++;

    if (requestCount === 1) {
      // First request fails
      route.fulfill({ status: 500 });
    } else {
      // Second request succeeds
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: 'Success!' })
      });
    }
  });

  await page.goto('/data');

  // Verify error shown initially
  await expect(page.locator('.error-message')).toBeVisible();

  // Click retry
  await page.click('[data-testid="retry-button"]');

  // Verify success after retry
  await expect(page.locator('.success-message')).toBeVisible();
  await expect(page.locator('.data-content'))
    .toContainText('Success!');

  expect(requestCount).toBe(2);
});
```

### Testing with Real API (Integration)
```typescript
test('should create user via real API', async ({ page }) => {
  await page.goto('/users/new');

  const uniqueEmail = `test-${Date.now()}@example.com`;

  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="email"]', uniqueEmail);
  await page.fill('[name="password"]', 'SecurePass123!');

  // Wait for API request
  const responsePromise = page.waitForResponse(
    resp => resp.url().includes('/api/users') && resp.request().method() === 'POST'
  );

  await page.click('[type="submit"]');

  const response = await responsePromise;
  expect(response.status()).toBe(201);

  const responseBody = await response.json();
  expect(responseBody.email).toBe(uniqueEmail);

  // Verify redirect to user profile
  await page.waitForURL(/\/users\/\d+$/);
});
```

---

## 6. Accessibility Testing

### Using axe-playwright
```typescript
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  // Inject axe-core
  await injectAxe(page);

  // Check entire page
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
});

test('should have proper form labels', async ({ page }) => {
  await page.goto('/login');
  await injectAxe(page);

  // Check only the form
  await checkA11y(page, 'form[name="login"]', {
    rules: {
      'label': { enabled: true },
      'button-name': { enabled: true },
      'color-contrast': { enabled: true }
    }
  });
});
```

### Keyboard Navigation Testing
```typescript
test('should navigate form with keyboard', async ({ page }) => {
  await page.goto('/login');

  // Tab through form elements
  await page.keyboard.press('Tab');
  await expect(page.locator('[name="email"]')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.locator('[name="password"]')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.locator('[type="submit"]')).toBeFocused();

  // Submit with Enter
  await page.keyboard.press('Enter');

  // Verify form submitted
  await expect(page.locator('.error-message')).toBeVisible();
});
```

### Screen Reader Testing
```typescript
test('should have proper ARIA labels', async ({ page }) => {
  await page.goto('/dashboard');

  // Verify ARIA labels
  const nav = page.locator('nav[role="navigation"]');
  await expect(nav).toHaveAttribute('aria-label', 'Main navigation');

  const userMenu = page.locator('[role="menu"]');
  await expect(userMenu).toHaveAttribute('aria-label', 'User menu');

  // Verify ARIA live regions
  const notifications = page.locator('[role="alert"]');
  await expect(notifications).toHaveAttribute('aria-live', 'polite');
});
```

---

## 7. Performance Testing

### Measuring Core Web Vitals
```typescript
test('should meet Core Web Vitals', async ({ page }) => {
  await page.goto('/');

  // Measure performance metrics
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    return {
      // Largest Contentful Paint
      lcp: paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0,
      // First Contentful Paint
      fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      // Time to Interactive
      tti: navigation.domInteractive,
      // Total Blocking Time
      tbt: navigation.domComplete - navigation.domInteractive
    };
  });

  // Assert performance thresholds
  expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
  expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s
  expect(metrics.tti).toBeLessThan(3800); // TTI < 3.8s
});
```

### Testing with Network Throttling
```typescript
test('should work on slow 3G', async ({ page, context }) => {
  // Emulate slow 3G
  await context.route('**/*', async route => {
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
    await route.continue();
  });

  const startTime = Date.now();
  await page.goto('/');

  // Should still load within reasonable time
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(10000); // < 10s even on slow network

  // Verify loading states shown
  await expect(page.locator('[data-testid="loading-skeleton"]'))
    .toBeVisible();
});
```

---

## 8. Visual Regression Testing

### Screenshot Comparison
```typescript
test('should match visual snapshot', async ({ page }) => {
  await page.goto('/dashboard');

  // Wait for content to load
  await page.waitForSelector('[data-testid="dashboard-content"]');

  // Take screenshot and compare
  await expect(page).toHaveScreenshot('dashboard.png', {
    fullPage: true,
    animations: 'disabled'
  });
});

test('should match component snapshot', async ({ page }) => {
  await page.goto('/components');

  const button = page.locator('[data-testid="primary-button"]');

  // Screenshot specific element
  await expect(button).toHaveScreenshot('primary-button.png');
});
```

### Responsive Design Testing
```typescript
test.describe('Responsive Design', () => {
  const devices = [
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Desktop HD', width: 1920, height: 1080 }
  ];

  for (const device of devices) {
    test(`should render correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: device.width,
        height: device.height
      });

      await page.goto('/');

      await expect(page).toHaveScreenshot(`homepage-${device.name}.png`);
    });
  }
});
```

---

## 9. Test Organization

### Page Object Model
```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('[type="submit"]');
  }

  async expectError(message: string) {
    await expect(this.page.locator('.error-message'))
      .toContainText(message);
  }
}

// tests/auth.spec.ts
import { LoginPage } from '../pages/LoginPage';

test('invalid login shows error', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('wrong@example.com', 'wrongpass');
  await loginPage.expectError('Invalid credentials');
});
```

### Reusable Fixtures
```typescript
// fixtures/index.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type MyFixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  authenticatedPage: async ({ page }, use) => {
    // Auto-login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('[type="submit"]');
    await page.waitForURL('/dashboard');

    await use(page);
  }
});

// tests/dashboard.spec.ts
import { test } from '../fixtures';

test('shows user dashboard', async ({ authenticatedPage }) => {
  // Already authenticated!
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.locator('.welcome-message'))
    .toBeVisible();
});
```

---

## 10. Common Anti-Patterns

### ❌ Testing Implementation Details
```typescript
// BAD - Tests internal state
test('component state updates', async ({ page }) => {
  const state = await page.evaluate(() => window.__REACT_STATE__);
  expect(state.count).toBe(1);
});

// GOOD - Tests user-visible behavior
test('counter increments', async ({ page }) => {
  await page.click('[data-testid="increment"]');
  await expect(page.locator('[data-testid="count"]'))
    .toHaveText('1');
});
```

### ❌ Over-mocking
```typescript
// BAD - Mocks everything
test('user list', async ({ page }) => {
  await page.route('**/*', route => route.fulfill({ body: '{}' }));
  // Test is meaningless
});

// GOOD - Mock only what's necessary
test('user list with mock data', async ({ page }) => {
  await page.route('**/api/users', route => {
    route.fulfill({
      body: JSON.stringify([{ id: 1, name: 'John' }])
    });
  });
  // Other requests go through normally
});
```

### ❌ Shared Test State
```typescript
// BAD - Tests depend on each other
let userId;
test('create user', async () => {
  userId = 123;
});
test('update user', async () => {
  // Fails if previous test didn't run
  updateUser(userId);
});

// GOOD - Independent tests
test('create and update user', async () => {
  const userId = await createUser();
  await updateUser(userId);
  await deleteUser(userId);
});
```

---

## Quick Reference Checklist

### Before Writing Tests
- ✅ Add `data-testid` attributes to components
- ✅ Ensure proper ARIA labels and roles
- ✅ Set up test database/fixtures
- ✅ Configure Playwright config file

### While Writing Tests
- ✅ Use auto-waiting assertions
- ✅ Avoid hard-coded timeouts
- ✅ Test user flows, not implementation
- ✅ Make tests independent
- ✅ Use Page Object Model for complex pages

### After Writing Tests
- ✅ Run tests in CI/CD
- ✅ Check for flakiness (run 10x)
- ✅ Measure test coverage
- ✅ Add visual regression tests
- ✅ Document test scenarios

---

**Remember**: Good tests are fast, reliable, maintainable, and test user behavior, not implementation details!
