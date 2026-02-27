import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { SignupPage } from '../pages/signup.page';
import { TEST_USER, NEW_USER } from '../fixtures/auth.fixture';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('AUTH-03: should login successfully with valid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Verify page loaded
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();

      // Login
      await loginPage.login(TEST_USER.email, TEST_USER.password);

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

      // Verify token is stored
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
    });

    test('AUTH-04: should show error with invalid password', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Login with wrong password
      await loginPage.login(TEST_USER.email, 'wrongpassword');

      // Should show error message
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });

      // Should stay on login page
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('AUTH-06: should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access dashboard without authentication
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
    });
  });

  test.describe('Signup', () => {
    test('AUTH-01: should signup successfully with valid data', async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();

      // Verify page loaded
      await expect(signupPage.nameInput).toBeVisible();
      await expect(signupPage.emailInput).toBeVisible();

      // Generate unique email
      const uniqueUser = {
        ...NEW_USER,
        email: `test-${Date.now()}@example.com`,
      };

      // Signup
      await signupPage.signup({
        name: uniqueUser.name,
        email: uniqueUser.email,
        password: uniqueUser.password,
        confirmPassword: uniqueUser.password,
        company: uniqueUser.company,
        phone: uniqueUser.phone,
      });

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

      // Verify token is stored
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
    });

    test('AUTH-02: should show error for duplicate email', async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.goto();

      // Try to signup with existing email
      await signupPage.signup({
        name: 'New User',
        email: TEST_USER.email, // Existing email
        password: 'password123',
        confirmPassword: 'password123',
      });

      // Should show error message
      await expect(signupPage.errorMessage).toBeVisible({ timeout: 5000 });

      // Should stay on signup page
      await expect(page).toHaveURL(/\/auth\/signup/);
    });
  });

  test.describe('Logout', () => {
    test('AUTH-05: should logout successfully', async ({ page }) => {
      const loginPage = new LoginPage(page);

      // First login
      await loginPage.goto();
      await loginPage.login(TEST_USER.email, TEST_USER.password);
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

      // Go to mypage and logout
      await page.goto('/mypage');
      const logoutButton = page.locator('button:has-text("로그아웃")');
      await logoutButton.click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });

      // Token should be removed
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeNull();
    });
  });
});
