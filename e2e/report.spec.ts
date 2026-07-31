import { test, expect } from '@playwright/test';

test.describe('Report Submission Workflow', () => {
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

  test('should display the report form with correct heading and elements', async ({ page }) => {
    await page.goto('/report');

    // Check heading matches t('report_form_title') = "Report Crime or Hazard"
    await expect(page.getByRole('heading', { name: /report crime or hazard/i })).toBeVisible();

    // Check the "Back to Map" link
    await expect(page.getByText('Back to Map')).toBeVisible();

    // Check report type buttons
    await expect(page.getByRole('button', { name: /infrastructure hazard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /crime & incident/i })).toBeVisible();

    // Check category dropdown
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();

    // Check description textarea with correct placeholder
    const descriptionInput = page.getByPlaceholder(/describe the situation/i);
    await expect(descriptionInput).toBeVisible();

    // Check photo upload
    await expect(page.getByText('Choose Photo')).toBeVisible();

    // Check GPS section
    await expect(page.getByText('Use My Current Location')).toBeVisible();

    // Check submit button with text t('report_form_submit') = "Submit Report & Classify with AI"
    const submitBtn = page.getByRole('button', { name: /submit report/i });
    await expect(submitBtn).toBeVisible();
  });

  test('should submit a new hazard report and see AI classification', async ({ page }) => {
    await page.goto('/report');

    // Fill form description
    const descriptionInput = page.getByPlaceholder(/describe the situation/i);
    await descriptionInput.fill('Broken footpath slab with open drain near Farmgate metro station gate 2.');

    // Select category (drain)
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('drain');

    // Submit report
    const submitBtn = page.getByRole('button', { name: /submit report/i });
    await submitBtn.click();

    // Expect success: "Report Successfully Submitted!"
    await expect(page.getByText('Report Successfully Submitted!')).toBeVisible({ timeout: 15000 });

    // Check AI classification section header: "AI Classification Triage"
    await expect(page.getByText('AI Classification Triage')).toBeVisible();

    // Check "Submit Another Report" button appears
    await expect(page.getByRole('button', { name: /submit another report/i })).toBeVisible();
  });

  test('should allow switching between hazard and crime report types', async ({ page }) => {
    await page.goto('/report');

    // Default type is hazard
    const hazardBtn = page.getByRole('button', { name: /infrastructure hazard/i });
    await expect(hazardBtn).toHaveClass(/bg-amber-500/);

    // Switch to crime
    const crimeBtn = page.getByRole('button', { name: /crime & incident/i });
    await crimeBtn.click();
    await expect(crimeBtn).toHaveClass(/bg-red-500/);

    // Switch back to hazard
    await hazardBtn.click();
    await expect(hazardBtn).toHaveClass(/bg-amber-500/);
  });

  test('should submit another report after first submission', async ({ page }) => {
    await page.goto('/report');

    // Fill and submit first report
    await page.getByPlaceholder(/describe the situation/i).fill('Test report for second submission flow');
    await page.getByRole('button', { name: /submit report/i }).click();

    await expect(page.getByText('Report Successfully Submitted!')).toBeVisible({ timeout: 15000 });

    // Click "Submit Another Report"
    await page.getByRole('button', { name: /submit another report/i }).click();

    // Form should be visible again with empty description
    await expect(page.getByPlaceholder(/describe the situation/i)).toBeVisible();
    await expect(page.getByPlaceholder(/describe the situation/i)).toHaveValue('');
  });
});
