import { test, expect } from '@playwright/test';

/**
 * Phase 4: Objects Management Tests
 *
 * Tests:
 * 1. Objects List Page - display, filtering, search
 * 2. Create Object Form - icon/color picker, validation
 * 3. Edit Object Page - update functionality
 * 4. Delete Object Modal - CASCADE warning
 */

// Mock API responses
const mockObjects = [
  {
    id: 'obj_12345678',
    name: 'contact',
    label: 'Contact',
    category: 'standard',
    description: 'Customer contact information',
    icon: 'Users',
    color: '#3b82f6',
    is_system_object: false,
    created_by: 'user_test',
    created_at: '2025-01-18T00:00:00Z',
    updated_at: '2025-01-18T00:00:00Z',
  },
  {
    id: 'obj_87654321',
    name: 'account',
    label: 'Account',
    category: 'custom',
    description: 'Business account',
    icon: 'Building',
    color: '#10b981',
    is_system_object: false,
    created_by: 'user_test',
    created_at: '2025-01-18T00:00:00Z',
    updated_at: '2025-01-18T00:00:00Z',
  },
  {
    id: 'obj_system01',
    name: 'user',
    label: 'User',
    category: 'system',
    description: 'System user object',
    icon: 'UserCircle',
    color: '#6b7280',
    is_system_object: true,
    created_by: 'system',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

test.describe('Phase 4: Objects Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock_token',
          token_type: 'bearer',
          user: {
            id: 'user_test',
            email: 'test@example.com',
            full_name: 'Test User',
          },
        }),
      });
    });

    // Mock current user endpoint
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user_test',
          email: 'test@example.com',
          full_name: 'Test User',
        }),
      });
    });

    // Mock objects list endpoint
    await page.route('**/api/objects**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockObjects),
        });
      }
    });

    // Login first
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: /email/i }).fill('test@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/dashboard');
  });

  test('Task 19: Objects List Page - Display objects table', async ({ page }) => {
    await page.goto('http://localhost:5173/objects');

    // Check page title
    await expect(page.getByRole('heading', { name: 'Objects', level: 1 })).toBeVisible();

    // Check description
    await expect(page.getByText('Manage your data objects')).toBeVisible();

    // Check Create Object button
    await expect(page.getByRole('button', { name: /create object/i })).toBeVisible();

    // Check search input
    await expect(page.getByPlaceholder(/search by name/i)).toBeVisible();

    // Check category filter
    await expect(page.getByRole('combobox')).toBeVisible();

    // Check table headers (should be visible in table)
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Label')).toBeVisible();
    await expect(page.getByText('Category')).toBeVisible();
    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText('Actions')).toBeVisible();

    // Check if objects are displayed
    await expect(page.getByText('contact', { exact: true })).toBeVisible();
    await expect(page.getByText('Contact')).toBeVisible();
    await expect(page.getByText('account', { exact: true })).toBeVisible();
    await expect(page.getByText('Account')).toBeVisible();

    // Check stats
    await expect(page.getByText(/total:/i)).toBeVisible();
    await expect(page.getByText(/filtered:/i)).toBeVisible();
  });

  test('Task 19: Objects List Page - Filter by category', async ({ page }) => {
    await page.goto('http://localhost:5173/objects');

    // Select "Standard" category
    await page.getByRole('combobox').selectOption('standard');

    // Should show only standard objects
    await expect(page.getByText('contact', { exact: true })).toBeVisible();
    await expect(page.getByText('account', { exact: true })).not.toBeVisible();
  });

  test('Task 19: Objects List Page - Search functionality', async ({ page }) => {
    await page.goto('http://localhost:5173/objects');

    // Search for "contact"
    await page.getByPlaceholder(/search by name/i).fill('contact');

    // Should show only matching objects
    await expect(page.getByText('contact', { exact: true })).toBeVisible();
    await expect(page.getByText('account', { exact: true })).not.toBeVisible();
  });

  test('Task 19: Objects List Page - System object shows view-only', async ({ page }) => {
    await page.goto('http://localhost:5173/objects');

    // System object should have eye icon (view-only), not edit/delete
    const userRow = page.locator('tr', { hasText: 'user' });
    await expect(userRow.locator('svg.lucide-eye')).toBeVisible();
    await expect(userRow.locator('svg.lucide-pencil')).not.toBeVisible();
    await expect(userRow.locator('svg.lucide-trash')).not.toBeVisible();
  });

  test('Task 20: Create Object Form - Display and validation', async ({ page }) => {
    // Mock create object endpoint
    await page.route('**/api/objects', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'obj_newobject',
            ...body,
            is_system_object: false,
            created_by: 'user_test',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      }
    });

    await page.goto('http://localhost:5173/objects/create');

    // Check page title
    await expect(page.getByRole('heading', { name: 'Create Object', level: 1 })).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/label/i)).toBeVisible();
    await expect(page.getByLabel(/category/i)).toBeVisible();
    await expect(page.getByLabel(/icon/i)).toBeVisible();
    await expect(page.getByLabel(/color/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();

    // Check required field indicators
    await expect(page.locator('label:has-text("Name") span.text-red-500')).toBeVisible();
    await expect(page.locator('label:has-text("Label") span.text-red-500')).toBeVisible();

    // Test validation - submit empty form
    await page.getByRole('button', { name: /create object/i }).click();

    // Should show validation errors
    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/label is required/i)).toBeVisible();

    // Fill valid data
    await page.getByLabel(/name/i).fill('product');
    await page.getByLabel(/label/i).fill('Product');
    await page.getByLabel(/description/i).fill('Product catalog object');

    // Submit form
    await page.getByRole('button', { name: /create object/i }).click();

    // Should redirect to objects list
    await page.waitForURL('**/objects');
  });

  test('Task 20: Create Object Form - Icon picker functionality', async ({ page }) => {
    await page.goto('http://localhost:5173/objects/create');

    // Click icon picker button
    const iconPickerButton = page.locator('button:has-text("Box")').first();
    await iconPickerButton.click();

    // Icon picker modal should open
    await expect(page.getByPlaceholder(/search icons/i)).toBeVisible();

    // Should show icon grid
    await expect(page.locator('button[title="Users"]')).toBeVisible();
    await expect(page.locator('button[title="Package"]')).toBeVisible();

    // Search for an icon
    await page.getByPlaceholder(/search icons/i).fill('user');

    // Should filter icons
    await expect(page.locator('button[title="Users"]')).toBeVisible();
    await expect(page.locator('button[title="Package"]')).not.toBeVisible();

    // Select an icon
    await page.locator('button[title="Users"]').click();

    // Modal should close and selected icon should be shown
    await expect(iconPickerButton).toHaveText(/users/i);
  });

  test('Task 20: Create Object Form - Color picker functionality', async ({ page }) => {
    await page.goto('http://localhost:5173/objects/create');

    // Click color picker button
    const colorPickerButton = page.locator('button', { hasText: '#6366f1' });
    await colorPickerButton.click();

    // Color picker modal should open
    await expect(page.getByText('Preset Colors')).toBeVisible();
    await expect(page.getByText('Custom Color')).toBeVisible();

    // Should show preset color buttons
    const presetColors = page.locator('button[style*="background-color"]');
    await expect(presetColors.first()).toBeVisible();

    // Select a preset color (e.g., red #ef4444)
    const redButton = page.locator('button[title="Red"]');
    await redButton.click();

    // Modal should close and selected color should be shown
    await expect(colorPickerButton).toHaveText(/#ef4444/i);
  });

  test('Task 21: Edit Object Page - Display and update', async ({ page }) => {
    // Mock get object endpoint
    await page.route('**/api/objects/obj_12345678', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockObjects[0]),
        });
      } else if (route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockObjects[0],
            ...body,
            updated_at: new Date().toISOString(),
          }),
        });
      }
    });

    await page.goto('http://localhost:5173/objects/obj_12345678/edit');

    // Check page title
    await expect(page.getByRole('heading', { name: 'Edit Object', level: 1 })).toBeVisible();

    // Name field should be read-only
    const nameField = page.getByLabel(/name \(read-only\)/i);
    await expect(nameField).toBeVisible();
    await expect(nameField).toBeDisabled();
    await expect(nameField).toHaveValue('contact');

    // Label field should be editable
    const labelField = page.getByLabel(/label/i);
    await expect(labelField).toHaveValue('Contact');

    // Update label
    await labelField.fill('Updated Contact');

    // Submit form
    await page.getByRole('button', { name: /save changes/i }).click();

    // Should redirect to objects list
    await page.waitForURL('**/objects');
  });

  test('Task 21: Edit Object Page - System object warning', async ({ page }) => {
    // Mock system object
    await page.route('**/api/objects/obj_system01', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockObjects[2]),
      });
    });

    await page.goto('http://localhost:5173/objects/obj_system01/edit');

    // Should show warning message
    await expect(page.getByText(/system object cannot be edited/i)).toBeVisible();

    // Should not show form
    await expect(page.getByLabel(/label/i)).not.toBeVisible();
  });

  test('Task 22: Delete Object Modal - CASCADE warning', async ({ page }) => {
    await page.goto('http://localhost:5173/objects');

    // Click delete button for first object (contact)
    const contactRow = page.locator('tr', { hasText: 'contact' });
    await contactRow.locator('svg.lucide-trash-2').click();

    // Modal should open
    await expect(page.getByRole('heading', { name: 'Delete Object', level: 2 })).toBeVisible();

    // Should show CASCADE warning
    await expect(page.getByText(/cascade delete warning/i)).toBeVisible();
    await expect(page.getByText(/all records associated/i)).toBeVisible();
    await expect(page.getByText(/all field definitions/i)).toBeVisible();
    await expect(page.getByText(/all relationships/i)).toBeVisible();
    await expect(page.getByText(/cannot be undone/i)).toBeVisible();

    // Should show object info
    await expect(page.getByText('Contact')).toBeVisible();
    await expect(page.getByText('contact', { exact: true })).toBeVisible();

    // Confirmation input should be visible
    await expect(page.getByPlaceholder('contact')).toBeVisible();

    // Delete button should be disabled until confirmation
    const deleteButton = page.getByRole('button', { name: /delete object/i });
    await expect(deleteButton).toBeDisabled();

    // Type confirmation text
    await page.getByPlaceholder('contact').fill('contact');

    // Delete button should now be enabled
    await expect(deleteButton).toBeEnabled();

    // Close modal
    await page.getByRole('button', { name: /cancel/i }).click();

    // Modal should close
    await expect(page.getByRole('heading', { name: 'Delete Object', level: 2 })).not.toBeVisible();
  });

  test('Task 22: Delete Object Modal - Successful deletion', async ({ page }) => {
    // Mock delete endpoint
    await page.route('**/api/objects/obj_12345678', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 204,
        });
      }
    });

    await page.goto('http://localhost:5173/objects');

    // Click delete button
    const contactRow = page.locator('tr', { hasText: 'contact' });
    await contactRow.locator('svg.lucide-trash-2').click();

    // Type confirmation
    await page.getByPlaceholder('contact').fill('contact');

    // Click delete
    await page.getByRole('button', { name: /delete object/i }).click();

    // Modal should close
    await expect(page.getByRole('heading', { name: 'Delete Object', level: 2 })).not.toBeVisible();
  });
});
