import { Page, Locator } from '@playwright/test';

export class ProjectPage {
  readonly page: Page;
  readonly projectName: Locator;
  readonly backButton: Locator;
  readonly homeButton: Locator;
  readonly galleryButton: Locator;
  readonly settingsButton: Locator;
  readonly tabs: Locator;
  readonly beforeTab: Locator;
  readonly afterTab: Locator;
  readonly stylingTab: Locator;
  readonly editingTab: Locator;
  readonly releaseTab: Locator;
  readonly loadingSpinner: Locator;
  readonly deleteProjectButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.projectName = page.locator('h1.text-lg');
    this.backButton = page.locator('button:has(svg.lucide-arrow-left)');
    this.homeButton = page.locator('button:has(svg.lucide-home)');
    this.galleryButton = page.locator('button:has(svg.lucide-folder-open)');
    this.settingsButton = page.locator('button:has(svg.lucide-settings)');
    this.tabs = page.locator('.sticky button');
    this.beforeTab = page.locator('button:has-text("시공 전")');
    this.afterTab = page.locator('button:has-text("시공 후")');
    this.stylingTab = page.locator('button:has-text("스타일링")');
    this.editingTab = page.locator('button:has-text("에디팅")');
    this.releaseTab = page.locator('button:has-text("릴리즈")');
    this.loadingSpinner = page.locator('.animate-spin');
    this.deleteProjectButton = page.locator('button:has-text("프로젝트 삭제")');
  }

  async goto(projectId: string) {
    await this.page.goto(`/projects/${projectId}`);
  }

  async waitForLoad() {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async getProjectName() {
    return this.projectName.textContent();
  }

  async goBack() {
    await this.backButton.click();
  }

  async goHome() {
    await this.homeButton.click();
  }

  async openGallery() {
    await this.galleryButton.click();
  }

  async openSettings() {
    await this.settingsButton.click();
  }

  async switchToTab(tabName: 'before' | 'after' | 'styling' | 'editing' | 'release') {
    const tabMap = {
      before: this.beforeTab,
      after: this.afterTab,
      styling: this.stylingTab,
      editing: this.editingTab,
      release: this.releaseTab,
    };

    await tabMap[tabName].click();
  }

  async isTabActive(tabName: string) {
    const tab = this.page.locator(`button:has-text("${tabName}")`);
    const className = await tab.getAttribute('class');
    return className?.includes('text-[#4b5840]') ?? false;
  }

  async uploadPhoto(spaceId: string, shotId: string, filePath: string) {
    // Find the file input for the specific space and shot
    const fileInput = this.page.locator(
      `input[type="file"][data-space="${spaceId}"][data-shot="${shotId}"]`
    );
    await fileInput.setInputFiles(filePath);
  }

  async getSpacePhotos(spaceId: string) {
    return this.page.locator(`[data-space="${spaceId}"] img`).all();
  }
}
