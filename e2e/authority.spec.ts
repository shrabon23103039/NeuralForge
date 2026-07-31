import { test, expect } from '@playwright/test';

test.describe('Authority Dashboard Workflow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error] ${msg.text()}`);
      }
    });
    page.on('pageerror', (exception) => {
      console.error(`[Browser Unhandled Exception] ${exception.message}`);
    });
  });

  test('should display authority dashboard with correct heading', async ({ page }) => {
    await page.goto('/authority');

    // Check heading: t('authority_title') = "Authority Triage Dashboard"
    await expect(page.getByRole('heading', { name: /authority triage dashboard/i })).toBeVisible();

    // Check the portal badge
    await expect(page.getByText('Authority Triage & Action Portal')).toBeVisible();

    // Check description
    await expect(page.getByText(/real-time routed citizen incident queue/i)).toBeVisible();
  });

  test('should display filter controls', async ({ page }) => {
    await page.goto('/authority');

    // Department filter: t('authority_filter_dept') = "Filter by Department"
    await expect(page.getByText('Filter by Department')).toBeVisible();

    // Status filter: t('authority_filter_status') = "Filter by Status"
    await expect(page.getByText('Filter by Status')).toBeVisible();

    // Category filter
    await expect(page.getByText('Category Filter')).toBeVisible();

    // Department select options
    const deptSelect = page.locator('select').first();
    await expect(deptSelect).toBeVisible();

    // Status select
    const statusSelect = page.locator('select').nth(1);
    await expect(statusSelect).toBeVisible();

    // Category select
    const categorySelect = page.locator('select').nth(2);
    await expect(categorySelect).toBeVisible();
  });

  test('should filter reports by department', async ({ page }) => {
    await page.goto('/authority');

    // Wait for reports to load
    await expect(page.getByText('Routed Incident Queue')).toBeVisible({ timeout: 10000 });

    // Select a specific department
    const deptSelect = page.locator('select').first();
    await deptSelect.selectOption('police');

    // Wait for filtered results
    await page.waitForTimeout(1000);

    // The table should still be visible (even if showing different data)
    await expect(page.getByText('Routed Incident Queue')).toBeVisible();
  });

  test('should filter reports by status', async ({ page }) => {
    await page.goto('/authority');

    // Wait for reports to load
    await expect(page.getByText('Routed Incident Queue')).toBeVisible({ timeout: 10000 });

    // Select a specific status
    const statusSelect = page.locator('select').nth(1);
    await statusSelect.selectOption('received');

    // Wait for filtered results
    await page.waitForTimeout(1000);

    await expect(page.getByText('Routed Incident Queue')).toBeVisible();
  });

  test('should filter reports by category', async ({ page }) => {
    await page.goto('/authority');

    // Wait for reports to load
    await expect(page.getByText('Routed Incident Queue')).toBeVisible({ timeout: 10000 });

    // Select a specific category
    const categorySelect = page.locator('select').nth(2);
    await categorySelect.selectOption('manhole');

    // Wait for filtered results
    await page.waitForTimeout(1000);

    await expect(page.getByText('Routed Incident Queue')).toBeVisible();
  });

  test('should display report table with correct columns', async ({ page }) => {
    await page.goto('/authority');

    // Wait for the table to load
    await expect(page.getByText('Routed Incident Queue')).toBeVisible({ timeout: 10000 });

    // Check table headers
    await expect(page.getByText('AI Triage')).toBeVisible();
    await expect(page.getByText('Incident Category')).toBeVisible();
    await expect(page.getByText('Description', { exact: true })).toBeVisible();
    await expect(page.getByText('Routed Dept')).toBeVisible();
    await expect(page.getByText('Votes')).toBeVisible();
    await expect(page.getByText('Update Status')).toBeVisible();
  });

  test('should update report status via dropdown', async ({ page }) => {
    await page.goto('/authority');

    // Wait for reports table to load with data
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    // Find the status dropdown in the first report row
    const statusDropdown = page.locator('tbody tr').first().locator('select');
    await expect(statusDropdown).toBeVisible();

    // Change status to "verified"
    await statusDropdown.selectOption('verified');

    // Wait for API response
    await page.waitForTimeout(1000);

    // The dropdown should now show "verified"
    await expect(statusDropdown).toHaveValue('verified');
  });

  test('should show AI Executive Briefing button', async ({ page }) => {
    await page.goto('/authority');

    // Check the AI Briefing button: t('authority_summary_btn') = "Generate AI Executive Briefing"
    const briefingBtn = page.getByRole('button', { name: /generate ai executive briefing/i });
    await expect(briefingBtn).toBeVisible();
  });

  test('should navigate to authority from navbar', async ({ page }) => {
    await page.goto('/');

    // Click the Authority Portal link in navbar
    const authorityLink = page.locator('header').getByRole('link', { name: /authority portal/i });
    await expect(authorityLink).toBeVisible();
    await authorityLink.click();

    await expect(page).toHaveURL(/\/authority/);
    await expect(page.getByRole('heading', { name: /authority triage dashboard/i })).toBeVisible();
  });

  test('should display refresh button in report queue', async ({ page }) => {
    await page.goto('/authority');

    await expect(page.getByText('Routed Incident Queue')).toBeVisible({ timeout: 10000 });

    // The refresh button is next to the queue header
    // It's a small icon button - find it by its parent section
    const refreshButton = page.locator('.bg-slate-900').locator('button').filter({ has: page.locator('svg') }).last();
    await expect(refreshButton).toBeVisible();
  });
});
