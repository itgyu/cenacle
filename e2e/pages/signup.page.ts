import { Page, Locator } from '@playwright/test';

export class SignupPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly companyInput: Locator;
  readonly phoneInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('input[name="name"]');
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.companyInput = page.locator('input[name="company"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"], .text-red-500');
    this.loginLink = page.locator('a[href="/auth/login"]');
  }

  async goto() {
    await this.page.goto('/auth/signup');
  }

  async signup(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    company?: string;
    phone?: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);

    if (data.confirmPassword) {
      await this.confirmPasswordInput.fill(data.confirmPassword);
    }

    if (data.company) {
      await this.companyInput.fill(data.company);
    }

    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }

    await this.submitButton.click();
  }

  async waitForNavigation() {
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async isErrorVisible() {
    return this.errorMessage.isVisible();
  }
}
