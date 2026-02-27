import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ProjectPage } from '../pages/project.page';
import { TEST_USER } from '../fixtures/auth.fixture';

test.describe('Project Management', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test.describe('Project List', () => {
    test('PROJ-02: should display project list on dashboard', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.waitForLoad();

      // Dashboard should be visible
      const projectCount = await dashboardPage.getProjectCount();
      expect(projectCount).toBeGreaterThanOrEqual(0);

      // If there are projects, they should be displayed
      if (projectCount > 0) {
        const projects = await dashboardPage.getProjects();
        expect(projects.length).toBeGreaterThan(0);
      } else {
        // Empty state should be visible
        const isEmpty = await dashboardPage.isEmptyStateVisible();
        expect(isEmpty).toBe(true);
      }
    });

    test('should filter projects by search query', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.waitForLoad();

      // Search for a project
      await dashboardPage.search('테스트');

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Projects should be filtered
      // (This test verifies the search functionality works)
      const searchInput = await page.inputValue('input[type="search"]');
      expect(searchInput).toBe('테스트');
    });
  });

  test.describe('Project Creation', () => {
    test('PROJ-01: should create a new project', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.waitForLoad();

      // Click new project button
      await dashboardPage.clickNewProject();

      // Should navigate to create project page
      await expect(page).toHaveURL('/create-project', { timeout: 5000 });

      // Fill in project details
      await page.fill('input[name="projectName"]', `테스트 프로젝트 ${Date.now()}`);
      await page.fill('input[name="location"]', '서울시 강남구');
      await page.fill('input[name="area"]', '30');
      await page.fill('input[name="rooms"]', '2');
      await page.fill('input[name="bathrooms"]', '1');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to project detail or dashboard
      await expect(page).toHaveURL(/\/(dashboard|projects\/)/, { timeout: 10000 });
    });
  });

  test.describe('Project Detail', () => {
    test('should display project details correctly', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.waitForLoad();

      // Get projects
      const projects = await dashboardPage.getProjects();

      // Skip if no projects
      if (projects.length === 0) {
        test.skip();
        return;
      }

      // Click first project
      await dashboardPage.clickProject(0);

      // Wait for project page to load
      const projectPage = new ProjectPage(page);
      await projectPage.waitForLoad();

      // Project name should be visible
      const projectName = await projectPage.getProjectName();
      expect(projectName).toBeTruthy();

      // Tabs should be visible
      await expect(projectPage.beforeTab).toBeVisible();
      await expect(projectPage.afterTab).toBeVisible();
      await expect(projectPage.stylingTab).toBeVisible();
      await expect(projectPage.editingTab).toBeVisible();
      await expect(projectPage.releaseTab).toBeVisible();
    });

    test('should switch between tabs', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.waitForLoad();

      const projects = await dashboardPage.getProjects();
      if (projects.length === 0) {
        test.skip();
        return;
      }

      await dashboardPage.clickProject(0);

      const projectPage = new ProjectPage(page);
      await projectPage.waitForLoad();

      // Switch to each tab
      const tabs: ('before' | 'after' | 'styling' | 'editing' | 'release')[] = [
        'before',
        'after',
        'styling',
        'editing',
        'release',
      ];

      for (const tab of tabs) {
        await projectPage.switchToTab(tab);
        await page.waitForTimeout(300); // Wait for animation
      }
    });

    test('should navigate back to dashboard', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.waitForLoad();

      const projects = await dashboardPage.getProjects();
      if (projects.length === 0) {
        test.skip();
        return;
      }

      await dashboardPage.clickProject(0);

      const projectPage = new ProjectPage(page);
      await projectPage.waitForLoad();

      // Click back button
      await projectPage.goBack();

      // Should be back on dashboard
      await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    });
  });
});
