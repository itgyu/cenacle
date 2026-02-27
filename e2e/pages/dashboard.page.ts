import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly projectList: Locator;
  readonly newProjectButton: Locator;
  readonly userButton: Locator;
  readonly statsTotal: Locator;
  readonly statsPhotos: Locator;
  readonly statsStyled: Locator;
  readonly emptyState: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[type="search"]');
    this.projectList = page.locator('[data-testid="project-list"], .space-y-3');
    this.newProjectButton = page.locator('button:has-text("새 프로젝트 시작")');
    this.userButton = page.locator('button:has(svg.lucide-user)');
    this.statsTotal = page.locator('.text-3xl').first();
    this.statsPhotos = page.locator('.text-3xl').nth(1);
    this.statsStyled = page.locator('.text-3xl').nth(2);
    this.emptyState = page.locator('text=첫 프로젝트를 시작해보세요');
    this.loadingSpinner = page.locator('.animate-spin');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async waitForLoad() {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async clickNewProject() {
    await this.newProjectButton.click();
  }

  async getProjectCount() {
    const text = await this.statsTotal.textContent();
    return parseInt(text || '0', 10);
  }

  async getProjects() {
    return this.page.locator('.rounded-2xl.p-5').all();
  }

  async clickProject(index: number) {
    const projects = await this.getProjects();
    if (projects[index]) {
      await projects[index].click();
    }
  }

  async isEmptyStateVisible() {
    return this.emptyState.isVisible();
  }
}
