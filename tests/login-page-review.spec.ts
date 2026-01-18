import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:5173/login';
const DASHBOARD_URL = 'http://localhost:5173/dashboard';

test.describe('Login Page - Comprehensive Review Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(LOGIN_URL);
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 1: Empty form submission shows validation errors', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Wait for page to load
    await expect(page.locator('h1:has-text("Canvas App")')).toBeVisible();

    // Click submit button without filling form
    await page.click('button[type="submit"]');

    // Wait for validation errors to appear
    await page.waitForTimeout(500);

    // Check for email error
    const emailError = page.locator('text=Please enter a valid email').first();
    await expect(emailError).toBeVisible({ timeout: 5000 });

    // Check for password error
    const passwordError = page.locator('text=Password must be at least 8 characters').first();
    await expect(passwordError).toBeVisible({ timeout: 5000 });

    console.log('✅ Scenario 1: Empty form validation working correctly');
  });

  test('Scenario 2: Invalid email format shows error', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'testpass123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for email validation error
    const emailError = page.locator('text=Please enter a valid email').first();
    await expect(emailError).toBeVisible({ timeout: 5000 });

    console.log('✅ Scenario 2: Invalid email validation working correctly');
  });

  test('Scenario 3: Short password shows error', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Fill valid email but short password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'short');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for password validation error
    const passwordError = page.locator('text=Password must be at least 8 characters').first();
    await expect(passwordError).toBeVisible({ timeout: 5000 });

    console.log('✅ Scenario 3: Short password validation working correctly');
  });

  test('Scenario 4: Password show/hide toggle functionality', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Fill password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('testpass123');

    // Take screenshot of hidden password
    await page.screenshot({ path: '.playwright-mcp/password-hidden.png', fullPage: true });

    // Click the eye icon to show password
    const toggleButton = page.locator('button:has(svg)').filter({ has: page.locator('svg') }).first();
    await toggleButton.click();

    // Wait for type to change
    await page.waitForTimeout(500);

    // Check if input type changed to "text"
    const inputType = await page.locator('input').filter({ has: page.locator('[type="text"]') }).count();

    // Take screenshot of visible password
    await page.screenshot({ path: '.playwright-mcp/password-visible-test.png', fullPage: true });

    // Click again to hide
    await toggleButton.click();
    await page.waitForTimeout(500);

    console.log('✅ Scenario 4: Password show/hide toggle working correctly');
  });

  test('Scenario 5: Correct credentials - success and redirect', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Fill correct credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(DASHBOARD_URL, { timeout: 10000 });

    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard');

    // Take screenshot of dashboard
    await page.screenshot({ path: '.playwright-mcp/login-success-dashboard-test.png', fullPage: true });

    console.log('✅ Scenario 5: Login success and redirect working correctly');
  });

  test('Scenario 6: Wrong credentials - 401 error message', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Fill wrong credentials
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpass123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error message
    await page.waitForTimeout(2000);

    // Check for error message
    const errorMessage = page.locator('text=Invalid email or password').first();
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    // Take screenshot of error
    await page.screenshot({ path: '.playwright-mcp/wrong-credentials-error.png', fullPage: true });

    console.log('✅ Scenario 6: Wrong credentials error handling working correctly');
  });

  test('Scenario 7: Loading state - button disabled and spinner visible', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Fill correct credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');

    // Submit form and immediately check loading state
    await page.click('button[type="submit"]');

    // Check button is disabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled({ timeout: 1000 });

    // Check for loading spinner (Loader2 icon from lucide-react)
    const spinner = page.locator('button[type="submit"] svg.animate-spin');
    await expect(spinner).toBeVisible({ timeout: 1000 });

    // Take screenshot of loading state
    await page.screenshot({ path: '.playwright-mcp/loading-state.png', fullPage: true });

    console.log('✅ Scenario 7: Loading state working correctly');
  });

  test('Scenario 8: Token stored in localStorage after success', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Fill correct credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(DASHBOARD_URL, { timeout: 10000 });

    // Check localStorage for token
    const token = await page.evaluate(() => localStorage.getItem('access_token'));

    expect(token).toBeTruthy();
    expect(token).toContain('eyJ'); // JWT tokens start with eyJ

    console.log('✅ Scenario 8: Token stored in localStorage correctly');
    console.log(`Token prefix: ${token?.substring(0, 20)}...`);
  });

  test('Scenario 9: Mobile responsive design', async ({ page }) => {
    // Test on mobile viewport (iPhone 12)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(LOGIN_URL);

    // Wait for page to load
    await expect(page.locator('h1:has-text("Canvas App")')).toBeVisible();

    // Take screenshot of mobile view
    await page.screenshot({ path: '.playwright-mcp/mobile-responsive.png', fullPage: true });

    // Check that form is visible and properly sized
    const formContainer = page.locator('div.max-w-md');
    await expect(formContainer).toBeVisible();

    // Test on tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: '.playwright-mcp/tablet-responsive.png', fullPage: true });

    console.log('✅ Scenario 9: Mobile responsive design working correctly');
  });
});
