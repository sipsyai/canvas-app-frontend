import { test, expect } from '@playwright/test';

/**
 * Records CRUD E2E Tests (Application Context)
 *
 * Testler çalışmadan önce:
 * 1. Backend çalışıyor olmalı (http://localhost:8000)
 * 2. Frontend çalışıyor olmalı (http://localhost:5173)
 * 3. Test verisi ve application oluşturulmuş olmalı: ./scripts/seed-test-data.sh <TOKEN>
 *
 * Test Application: E2E Test App (app_48d0ee8c)
 * Test Object: Test Contact (obj_6c8ab43a)
 *
 * Çalıştırma:
 *   npx playwright test tests/records-crud.spec.ts --headed
 */

// Test configuration
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpass123',
};

// Test application and object IDs (set by seed script)
const APP_ID = 'app_48d0ee8c';
const OBJECT_ID = 'obj_6c8ab43a';
const RECORDS_URL = `${BASE_URL}/applications/${APP_ID}/${OBJECT_ID}`;

test.describe('Records CRUD Operations (Application Context)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage and login
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Login
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  // ============================================
  // READ TESTS
  // ============================================

  test.describe('READ - Records Table', () => {
    test('should display records table with data', async ({ page }) => {
      await page.goto(RECORDS_URL);

      // Wait for table to load
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Check header shows record count
      await expect(page.locator('text=/\\d+ records/')).toBeVisible();

      // Check at least one row exists
      const rows = page.locator('table tbody tr');
      await expect(rows.first()).toBeVisible();
    });

    test('should have working pagination', async ({ page }) => {
      await page.goto(RECORDS_URL);

      // Wait for table
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Check pagination exists
      const pagination = page.locator('text=/Showing \\d+ - \\d+ of \\d+/');
      await expect(pagination).toBeVisible();

      // Check pagination buttons exist
      const prevButton = page.getByRole('button', { name: /previous/i });
      const nextButton = page.getByRole('button', { name: /next/i });

      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await page.goto(RECORDS_URL);

      // Wait for page to load
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Check search input exists
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();

      // Type in search
      await searchInput.fill('John');

      // Table should still be visible
      await expect(page.locator('table')).toBeVisible();
    });

    test('should have Add Record button', async ({ page }) => {
      await page.goto(RECORDS_URL);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check Add Record button exists
      const addButton = page.getByRole('button', { name: /add record/i });
      await expect(addButton).toBeVisible();
    });

    test('should have action buttons in table rows', async ({ page }) => {
      await page.goto(RECORDS_URL);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Check for action buttons in first row
      const firstRow = page.locator('table tbody tr').first();

      await expect(firstRow.getByRole('button', { name: /view details/i })).toBeVisible();
      await expect(firstRow.getByRole('button', { name: /edit record/i })).toBeVisible();
      await expect(firstRow.getByRole('button', { name: /delete record/i })).toBeVisible();
    });
  });

  // ============================================
  // CREATE TESTS
  // ============================================

  test.describe('CREATE - Add Record Modal', () => {
    test('should open modal when clicking Add Record', async ({ page }) => {
      await page.goto(RECORDS_URL);
      await page.waitForLoadState('networkidle');

      // Click Add Record button
      await page.getByRole('button', { name: /add record/i }).click();

      // Modal should appear
      await expect(page.locator('text=/Create New Record/i')).toBeVisible();

      // Form should be visible
      await expect(page.locator('form')).toBeVisible();
    });

    test('should close modal on Cancel click', async ({ page }) => {
      await page.goto(RECORDS_URL);
      await page.waitForLoadState('networkidle');

      // Open modal
      await page.getByRole('button', { name: /add record/i }).click();
      await expect(page.locator('text=/Create New Record/i')).toBeVisible();

      // Click Cancel
      await page.getByRole('button', { name: /cancel/i }).click();

      // Modal should close
      await expect(page.locator('text=/Create New Record/i')).not.toBeVisible();
    });

    test('should create record with valid data', async ({ page }) => {
      await page.goto(RECORDS_URL);
      await page.waitForLoadState('networkidle');

      // Get initial record count
      const countText = await page.locator('text=/\\d+ records/').textContent();
      const initialCount = countText ? parseInt(countText.match(/\d+/)?.[0] || '0') : 0;

      // Open modal
      await page.getByRole('button', { name: /add record/i }).click();
      await expect(page.locator('text=/Create New Record/i')).toBeVisible();

      // Wait for form fields to load
      await page.waitForTimeout(1000);

      // Fill in the form
      const timestamp = Date.now();
      await page.getByRole('textbox', { name: /full name/i }).fill(`E2E Test User ${timestamp}`);
      await page.getByRole('textbox', { name: /email/i }).fill(`e2e.test.${timestamp}@example.com`);
      await page.getByRole('textbox', { name: /phone/i }).fill('+1 555 000 0000');
      await page.getByRole('textbox', { name: /company/i }).fill('E2E Test Company');
      await page.getByRole('textbox', { name: /notes/i }).fill('Created by E2E test');

      // Submit form
      await page.getByRole('button', { name: /create record/i }).click();

      // Wait for modal to close (success)
      await expect(page.locator('text=/Create New Record/i')).not.toBeVisible({ timeout: 10000 });

      // Verify record count increased
      await page.waitForTimeout(1000);
      const newCountText = await page.locator('text=/\\d+ records/').textContent();
      const newCount = newCountText ? parseInt(newCountText.match(/\d+/)?.[0] || '0') : 0;
      expect(newCount).toBeGreaterThan(initialCount);
    });
  });

  // ============================================
  // UPDATE TESTS
  // ============================================

  test.describe('UPDATE - Edit Record Modal', () => {
    test('should open edit modal with pre-populated data', async ({ page }) => {
      await page.goto(RECORDS_URL);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Click Edit button on first row
      const firstRow = page.locator('table tbody tr').first();
      await firstRow.getByRole('button', { name: /edit record/i }).click();

      // Edit modal should appear
      await expect(page.locator('text=/Edit Record/i')).toBeVisible();

      // Form fields should be pre-populated (not empty)
      const fullNameInput = page.getByRole('textbox', { name: /full name/i });
      await expect(fullNameInput).not.toHaveValue('');
    });

    test('should close edit modal on Cancel', async ({ page }) => {
      await page.goto(RECORDS_URL);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Open edit modal
      const firstRow = page.locator('table tbody tr').first();
      await firstRow.getByRole('button', { name: /edit record/i }).click();
      await expect(page.locator('text=/Edit Record/i')).toBeVisible();

      // Click Cancel
      await page.getByRole('button', { name: /cancel/i }).click();

      // Modal should close
      await expect(page.locator('text=/Edit Record/i')).not.toBeVisible();
    });

    test('should update record successfully', async ({ page }) => {
      await page.goto(RECORDS_URL);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Get original company value from first row
      const firstRow = page.locator('table tbody tr').first();
      const _originalCompany = await firstRow.locator('td').nth(3).textContent();

      // Open edit modal
      await firstRow.getByRole('button', { name: /edit record/i }).click();
      await expect(page.locator('text=/Edit Record/i')).toBeVisible();

      // Update company field
      const timestamp = Date.now();
      const newCompany = `Updated Company ${timestamp}`;
      await page.getByRole('textbox', { name: /company/i }).fill(newCompany);

      // Save changes
      await page.getByRole('button', { name: /save changes/i }).click();

      // Modal should close
      await expect(page.locator('text=/Edit Record/i')).not.toBeVisible({ timeout: 10000 });

      // Verify company was updated in table
      await page.waitForTimeout(1000);
      const updatedCompany = await firstRow.locator('td').nth(3).textContent();
      expect(updatedCompany).toBe(newCompany);
    });
  });

  // ============================================
  // DELETE TESTS
  // ============================================

  test.describe('DELETE - Remove Record', () => {
    test('should show confirmation modal on delete click', async ({ page }) => {
      await page.goto(RECORDS_URL);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Click delete button on first row
      const firstRow = page.locator('table tbody tr').first();
      await firstRow.getByRole('button', { name: /delete record/i }).click();

      // Confirmation modal should appear
      await expect(page.locator('text=/Delete Record/i')).toBeVisible();
      await expect(page.locator('text=/Are you sure/i')).toBeVisible();
    });

    test('should close modal on Cancel', async ({ page }) => {
      await page.goto(RECORDS_URL);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Open delete modal
      const firstRow = page.locator('table tbody tr').first();
      await firstRow.getByRole('button', { name: /delete record/i }).click();
      await expect(page.locator('text=/Delete Record/i')).toBeVisible();

      // Click Cancel
      await page.getByRole('button', { name: /cancel/i }).click();

      // Modal should close
      await expect(page.locator('text=/Delete Record/i')).not.toBeVisible();
    });

    test('should delete record on confirm', async ({ page }) => {
      await page.goto(RECORDS_URL);
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

      // Get initial record count
      const countText = await page.locator('text=/\\d+ records/').textContent();
      const initialCount = countText ? parseInt(countText.match(/\d+/)?.[0] || '0') : 0;

      // Get first row name for verification
      const firstRow = page.locator('table tbody tr').first();
      const _recordName = await firstRow.locator('td').first().textContent();

      // Open delete modal
      await firstRow.getByRole('button', { name: /delete record/i }).click();
      await expect(page.locator('text=/Delete Record/i')).toBeVisible();

      // Confirm delete
      await page.getByRole('button', { name: 'Delete', exact: true }).click();

      // Modal should close
      await expect(page.locator('text=/Delete Record/i')).not.toBeVisible({ timeout: 10000 });

      // Verify record count decreased
      await page.waitForTimeout(1000);
      const newCountText = await page.locator('text=/\\d+ records/').textContent();
      const newCount = newCountText ? parseInt(newCountText.match(/\d+/)?.[0] || '0') : 0;
      expect(newCount).toBeLessThan(initialCount);
    });
  });
});
