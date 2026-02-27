import { test as base, expect } from '@playwright/test';

// Test user credentials for E2E tests
export const TEST_USER = {
  email: 'test@cenacledesign.com',
  password: 'testpassword123',
  name: '테스트 사용자',
};

// New user for registration tests
export const NEW_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'newpassword123',
  name: '새 사용자',
  company: '테스트 회사',
  phone: '010-1234-5678',
};

// Authenticated test fixture
export const test = base.extend<{
  authenticatedPage: typeof base.prototype.page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Use the authenticated page
    await use(page);

    // Cleanup: logout after test
    await page.evaluate(() => {
      localStorage.removeItem('token');
    });
  },
});

export { expect };
