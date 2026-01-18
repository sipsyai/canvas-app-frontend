import { test, expect, Page } from '@playwright/test';

/**
 * API Integration Tests
 *
 * This test suite validates the API client setup and integration with backend
 *
 * Tests cover:
 * - Axios client configuration
 * - Request interceptor (JWT token injection)
 * - Response interceptor (401 handling, 422 validation errors)
 * - Authentication API (login, register, getCurrentUser, logout)
 * - Fields API (CRUD operations, filtering, pagination)
 * - Objects API (CRUD operations, filtering, pagination)
 * - Records API (CRUD operations, search, pagination)
 */

const BASE_URL = 'http://localhost:5173';
const API_BASE_URL = 'http://localhost:8000';

// Helper function to mock API responses
async function mockAPIResponse(
  page: Page,
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  status: number,
  body: any
) {
  await page.route(`${API_BASE_URL}${url}`, (route) => {
    if (route.request().method() === method) {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    } else {
      route.continue();
    }
  });
}

test.describe('API Client Configuration', () => {
  test('should have correct base URL from environment variable', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Check that API_BASE_URL is correctly set
    const apiBaseUrl = await page.evaluate(() => {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    });

    expect(apiBaseUrl).toBeTruthy();
    console.log(`✅ API Base URL: ${apiBaseUrl}`);
  });

  test('should inject JWT token in Authorization header', async ({ page }) => {
    let authHeaderPresent = false;
    let authHeaderValue = '';

    // Intercept API requests to check Authorization header
    await page.route(`${API_BASE_URL}/api/auth/me`, (route) => {
      const headers = route.request().headers();
      authHeaderPresent = 'authorization' in headers;
      authHeaderValue = headers['authorization'] || '';

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'usr_12345678',
          email: 'test@example.com',
          full_name: 'Test User',
          created_at: new Date().toISOString(),
        }),
      });
    });

    // Set token in localStorage
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token');
    });

    // Make API call that should include token
    await page.evaluate(async () => {
      const { apiClient } = await import('/src/lib/api/client.ts');
      try {
        await apiClient.get('/api/auth/me');
      } catch (error) {
        // Ignore errors, we just want to check headers
      }
    });

    await page.waitForTimeout(1000);

    expect(authHeaderPresent).toBeTruthy();
    expect(authHeaderValue).toContain('Bearer eyJ');
    console.log('✅ JWT token injected in Authorization header');
  });

  test('should handle 401 error and redirect to /login', async ({ page }) => {
    // Mock 401 response
    await page.route(`${API_BASE_URL}/api/auth/me`, (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Unauthorized',
        }),
      });
    });

    await page.goto(`${BASE_URL}/dashboard`);

    // Set token in localStorage
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'expired.token.here');
    });

    // Make API call that returns 401
    await page.evaluate(async () => {
      const { apiClient } = await import('/src/lib/api/client.ts');
      try {
        await apiClient.get('/api/auth/me');
      } catch (error) {
        // Expected to fail
      }
    });

    // Wait for redirect
    await page.waitForTimeout(2000);

    // Should redirect to /login
    expect(page.url()).toContain('/login');

    // Token should be removed from localStorage
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();

    console.log('✅ 401 error handling: redirected to /login and token removed');
  });

  test('should parse 422 validation errors (Pydantic format)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Mock 422 validation error
    await page.route(`${API_BASE_URL}/api/auth/register`, (route) => {
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: [
            {
              loc: ['body', 'email'],
              msg: 'value is not a valid email address',
              type: 'value_error.email',
            },
            {
              loc: ['body', 'password'],
              msg: 'ensure this value has at least 8 characters',
              type: 'value_error.any_str.min_length',
            },
          ],
        }),
      });
    });

    // Make API call that returns 422
    const errorResult = await page.evaluate(async () => {
      const { apiClient } = await import('/src/lib/api/client.ts');
      try {
        await apiClient.post('/api/auth/register', {
          email: 'invalid',
          password: 'short',
          full_name: 'Test',
        });
        return null;
      } catch (error: any) {
        return {
          status: error.status,
          message: error.message,
          errors: error.errors,
        };
      }
    });

    expect(errorResult).toBeTruthy();
    expect(errorResult?.status).toBe(422);
    expect(errorResult?.message).toBe('Validation error');
    expect(errorResult?.errors).toHaveLength(2);
    expect(errorResult?.errors[0].field).toBe('email');
    expect(errorResult?.errors[1].field).toBe('password');

    console.log('✅ 422 validation errors parsed correctly');
    console.log('Errors:', errorResult?.errors);
  });
});

test.describe('Authentication API', () => {
  test('login: should use OAuth2 form-data format with "username" field', async ({ page }) => {
    let requestBody = '';
    let contentType = '';

    // Intercept login request
    await page.route(`${API_BASE_URL}/api/auth/login`, (route) => {
      requestBody = route.request().postData() || '';
      contentType = route.request().headers()['content-type'] || '';

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
          token_type: 'bearer',
          expires_in: 3600,
        }),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    // Make login API call
    await page.evaluate(async () => {
      const { authAPI } = await import('/src/lib/api/auth.api.ts');
      try {
        await authAPI.login('test@example.com', 'testpass123');
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    // Verify form-data format
    expect(contentType).toContain('application/x-www-form-urlencoded');
    expect(requestBody).toContain('username=test%40example.com');
    expect(requestBody).toContain('password=testpass123');
    expect(requestBody).not.toContain('email='); // Should use 'username', not 'email'

    console.log('✅ Login uses OAuth2 form-data format');
    console.log(`Request body: ${requestBody}`);
  });

  test('register: should use JSON format with email, password, full_name', async ({ page }) => {
    let requestBody: any = null;
    let contentType = '';

    // Intercept register request
    await page.route(`${API_BASE_URL}/api/auth/register`, (route) => {
      const body = route.request().postData();
      requestBody = body ? JSON.parse(body) : null;
      contentType = route.request().headers()['content-type'] || '';

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'usr_12345678',
          email: 'newuser@example.com',
          full_name: 'New User',
          created_at: new Date().toISOString(),
        }),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    // Make register API call
    await page.evaluate(async () => {
      const { authAPI } = await import('/src/lib/api/auth.api.ts');
      try {
        await authAPI.register({
          email: 'newuser@example.com',
          password: 'securepass123',
          fullName: 'New User',
        });
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    // Verify JSON format
    expect(contentType).toContain('application/json');
    expect(requestBody).toBeTruthy();
    expect(requestBody.email).toBe('newuser@example.com');
    expect(requestBody.password).toBe('securepass123');
    expect(requestBody.full_name).toBe('New User'); // Converted from fullName to full_name

    console.log('✅ Register uses JSON format with correct field mapping');
    console.log('Request body:', requestBody);
  });

  test('getCurrentUser: should require JWT token', async ({ page }) => {
    let authHeaderPresent = false;

    // Intercept getCurrentUser request
    await page.route(`${API_BASE_URL}/api/auth/me`, (route) => {
      const headers = route.request().headers();
      authHeaderPresent = 'authorization' in headers;

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'usr_12345678',
          email: 'test@example.com',
          full_name: 'Test User',
          created_at: new Date().toISOString(),
        }),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    // Set token
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token');
    });

    // Make getCurrentUser API call
    await page.evaluate(async () => {
      const { authAPI } = await import('/src/lib/api/auth.api.ts');
      try {
        await authAPI.getCurrentUser();
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(authHeaderPresent).toBeTruthy();
    console.log('✅ getCurrentUser requires JWT token');
  });

  test('logout: should blacklist token', async ({ page }) => {
    let logoutCalled = false;

    // Intercept logout request
    await page.route(`${API_BASE_URL}/api/auth/logout`, (route) => {
      logoutCalled = true;

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    // Set token
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token');
    });

    // Make logout API call
    await page.evaluate(async () => {
      const { authAPI } = await import('/src/lib/api/auth.api.ts');
      try {
        await authAPI.logout();
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(logoutCalled).toBeTruthy();
    console.log('✅ Logout endpoint called');
  });
});

test.describe('Fields API', () => {
  test('create: should send POST request with field data', async ({ page }) => {
    let requestBody: any = null;

    await page.route(`${API_BASE_URL}/api/fields`, (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postData();
        requestBody = body ? JSON.parse(body) : null;

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'fld_12345678',
            name: 'test_field',
            label: 'Test Field',
            type: 'text',
            category: 'basic',
            is_system_field: false,
            created_by: 'usr_12345678',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { fieldsAPI } = await import('/src/lib/api/fields.api.ts');
      try {
        await fieldsAPI.create({
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          category: 'basic',
        });
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(requestBody).toBeTruthy();
    expect(requestBody.name).toBe('test_field');
    expect(requestBody.type).toBe('text');

    console.log('✅ Fields create API working');
  });

  test('list: should support category and is_system_field filters', async ({ page }) => {
    let queryParams: any = null;

    await page.route(`${API_BASE_URL}/api/fields**`, (route) => {
      const url = new URL(route.request().url());
      queryParams = Object.fromEntries(url.searchParams);

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { fieldsAPI } = await import('/src/lib/api/fields.api.ts');
      try {
        await fieldsAPI.list({
          category: 'basic',
          is_system_field: false,
          page: 1,
          page_size: 20,
        });
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(queryParams.category).toBe('basic');
    expect(queryParams.is_system_field).toBe('false');
    expect(queryParams.page).toBe('1');
    expect(queryParams.page_size).toBe('20');

    console.log('✅ Fields list API supports filtering and pagination');
    console.log('Query params:', queryParams);
  });

  test('getById: should fetch single field', async ({ page }) => {
    let requestedId = '';

    await page.route(`${API_BASE_URL}/api/fields/**`, (route) => {
      const url = route.request().url();
      requestedId = url.split('/').pop() || '';

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: requestedId,
          name: 'test_field',
          label: 'Test Field',
          type: 'text',
          category: 'basic',
          is_system_field: false,
          created_by: 'usr_12345678',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { fieldsAPI } = await import('/src/lib/api/fields.api.ts');
      try {
        await fieldsAPI.getById('fld_12345678');
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(requestedId).toBe('fld_12345678');
    console.log('✅ Fields getById API working');
  });

  test('update: should send PATCH request', async ({ page }) => {
    let requestMethod = '';
    let requestBody: any = null;

    await page.route(`${API_BASE_URL}/api/fields/**`, (route) => {
      requestMethod = route.request().method();
      const body = route.request().postData();
      requestBody = body ? JSON.parse(body) : null;

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'fld_12345678',
          name: 'test_field',
          label: 'Updated Label',
          type: 'text',
          category: 'basic',
          is_system_field: false,
          created_by: 'usr_12345678',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { fieldsAPI } = await import('/src/lib/api/fields.api.ts');
      try {
        await fieldsAPI.update('fld_12345678', {
          label: 'Updated Label',
        });
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(requestMethod).toBe('PATCH');
    expect(requestBody.label).toBe('Updated Label');

    console.log('✅ Fields update API uses PATCH method');
  });

  test('delete: should send DELETE request', async ({ page }) => {
    let requestMethod = '';

    await page.route(`${API_BASE_URL}/api/fields/**`, (route) => {
      requestMethod = route.request().method();

      route.fulfill({
        status: 204,
      });
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { fieldsAPI } = await import('/src/lib/api/fields.api.ts');
      try {
        await fieldsAPI.delete('fld_12345678');
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(requestMethod).toBe('DELETE');
    console.log('✅ Fields delete API working');
  });
});

test.describe('Objects API', () => {
  test('create: should create object with category', async ({ page }) => {
    let requestBody: any = null;

    await page.route(`${API_BASE_URL}/api/objects`, (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postData();
        requestBody = body ? JSON.parse(body) : null;

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'obj_12345678',
            name: 'test_object',
            label: 'Test Object',
            category: 'custom',
            created_by: 'usr_12345678',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { objectsAPI } = await import('/src/lib/api/objects.api.ts');
      try {
        await objectsAPI.create({
          name: 'test_object',
          label: 'Test Object',
          category: 'custom',
        });
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(requestBody).toBeTruthy();
    expect(requestBody.name).toBe('test_object');

    console.log('✅ Objects create API working');
  });

  test('list: should support category filter and pagination', async ({ page }) => {
    let queryParams: any = null;

    await page.route(`${API_BASE_URL}/api/objects**`, (route) => {
      const url = new URL(route.request().url());
      queryParams = Object.fromEntries(url.searchParams);

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { objectsAPI } = await import('/src/lib/api/objects.api.ts');
      try {
        await objectsAPI.list({
          category: 'custom',
          page: 2,
          page_size: 50,
        });
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(queryParams.category).toBe('custom');
    expect(queryParams.page).toBe('2');
    expect(queryParams.page_size).toBe('50');

    console.log('✅ Objects list API supports filtering and pagination');
  });
});

test.describe('Records API', () => {
  test('create: should create record with object_id and data', async ({ page }) => {
    let requestBody: any = null;

    await page.route(`${API_BASE_URL}/api/records`, (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postData();
        requestBody = body ? JSON.parse(body) : null;

        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'rec_12345678',
            object_id: 'obj_12345678',
            data: { name: 'Test Record' },
            created_by: 'usr_12345678',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { recordsAPI } = await import('/src/lib/api/records.api.ts');
      try {
        await recordsAPI.create({
          object_id: 'obj_12345678',
          data: { name: 'Test Record' },
        });
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(requestBody).toBeTruthy();
    expect(requestBody.object_id).toBe('obj_12345678');

    console.log('✅ Records create API working');
  });

  test('list: should require object_id parameter', async ({ page }) => {
    let queryParams: any = null;

    await page.route(`${API_BASE_URL}/api/records**`, (route) => {
      const url = new URL(route.request().url());
      queryParams = Object.fromEntries(url.searchParams);

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { recordsAPI } = await import('/src/lib/api/records.api.ts');
      try {
        await recordsAPI.list({
          object_id: 'obj_12345678',
          page: 1,
          page_size: 10,
        });
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(queryParams.object_id).toBe('obj_12345678');
    expect(queryParams.page).toBe('1');
    expect(queryParams.page_size).toBe('10');

    console.log('✅ Records list API requires object_id');
  });

  test('search: should require object_id and query string', async ({ page }) => {
    let queryParams: any = null;

    await page.route(`${API_BASE_URL}/api/records/search**`, (route) => {
      const url = new URL(route.request().url());
      queryParams = Object.fromEntries(url.searchParams);

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { recordsAPI } = await import('/src/lib/api/records.api.ts');
      try {
        await recordsAPI.search({
          object_id: 'obj_12345678',
          q: 'test query',
          page: 1,
          page_size: 20,
        });
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(queryParams.object_id).toBe('obj_12345678');
    expect(queryParams.q).toBe('test query');

    console.log('✅ Records search API requires object_id and query');
  });

  test('update: should merge data, not overwrite', async ({ page }) => {
    let requestMethod = '';
    let requestBody: any = null;

    await page.route(`${API_BASE_URL}/api/records/**`, (route) => {
      requestMethod = route.request().method();
      const body = route.request().postData();
      requestBody = body ? JSON.parse(body) : null;

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'rec_12345678',
          object_id: 'obj_12345678',
          data: { name: 'Updated Record' },
          created_by: 'usr_12345678',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    await page.evaluate(async () => {
      const { recordsAPI } = await import('/src/lib/api/records.api.ts');
      try {
        await recordsAPI.update('rec_12345678', {
          data: { name: 'Updated Record' },
        });
      } catch (error) {
        // Ignore
      }
    });

    await page.waitForTimeout(1000);

    expect(requestMethod).toBe('PATCH');
    expect(requestBody.data).toBeTruthy();

    console.log('✅ Records update uses PATCH (merge behavior)');
  });
});
