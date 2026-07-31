import { test, expect } from '@playwright/test';

test.describe('Report Detail & Community Verification Workflow', () => {
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

  test('should display report details for seeded report rep_101', async ({ page }) => {
    // Navigate to the first seeded report detail page
    // rep_101 = index 0 = category "manhole", heading: "manhole Incident"
    await page.goto('/reports/rep_101');

    // Check heading: "{category} Incident" -> "manhole Incident" (case-insensitive)
    await expect(page.getByRole('heading', { name: /manhole incident/i })).toBeVisible({ timeout: 10000 });

    // Check AI Multimodal Summary section
    await expect(page.getByText('AI Multimodal Summary & Routing Note')).toBeVisible();

    // Check the English brief section
    await expect(page.getByText('ENGLISH BRIEF')).toBeVisible();

    // Check the Bangla brief section
    await expect(page.getByText('বাংলা সংক্ষিপ্ত বিবরণ')).toBeVisible();

    // Check "Back to Map" link
    await expect(page.getByText('Back to Map')).toBeVisible();

    // Check metadata badges (Type, Status, Dept)
    await expect(page.getByText(/Type: hazard/i)).toBeVisible();
    await expect(page.getByText(/Status:/i)).toBeVisible();
  });

  test('should allow community confirm voting', async ({ page }) => {
    await page.goto('/reports/rep_101');

    // Wait for report to load
    await expect(page.getByRole('heading', { name: /manhole incident/i })).toBeVisible({ timeout: 10000 });

    // Confirm verification button: "Confirm Report (N)"
    const confirmBtn = page.getByRole('button', { name: /confirm report/i });
    await expect(confirmBtn).toBeVisible();

    const initialConfirmText = await confirmBtn.innerText();
    await confirmBtn.click();

    // After click, count should increase
    await page.waitForTimeout(1000);
    const updatedConfirmText = await confirmBtn.innerText();
    expect(updatedConfirmText).not.toBe(initialConfirmText);
  });

  test('should allow community dispute voting', async ({ page }) => {
    await page.goto('/reports/rep_101');

    // Wait for report to load
    await expect(page.getByRole('heading', { name: /manhole incident/i })).toBeVisible({ timeout: 10000 });

    // Dispute verification button: "Dispute Report (N)"
    const disputeBtn = page.getByRole('button', { name: /dispute report/i });
    await expect(disputeBtn).toBeVisible();

    const initialDisputeText = await disputeBtn.innerText();
    await disputeBtn.click();

    // After click, count should increase
    await page.waitForTimeout(1000);
    const updatedDisputeText = await disputeBtn.innerText();
    expect(updatedDisputeText).not.toBe(initialDisputeText);
  });

  test('should show citizen description section', async ({ page }) => {
    await page.goto('/reports/rep_101');

    await expect(page.getByRole('heading', { name: /manhole incident/i })).toBeVisible({ timeout: 10000 });

    // Citizen description section
    await expect(page.getByText('Citizen Description')).toBeVisible();
    // The seed data description for rep_101 (manhole)
    await expect(page.getByText(/uncovered manhole/i)).toBeVisible();
  });

  test('should show Community Verification section', async ({ page }) => {
    await page.goto('/reports/rep_101');

    await expect(page.getByRole('heading', { name: /manhole incident/i })).toBeVisible({ timeout: 10000 });

    // Community Verification section
    await expect(page.getByText('Community Verification')).toBeVisible();
    await expect(page.getByText(/confirming helps city authorities/i)).toBeVisible();
  });

  test('should navigate to report detail from home page live feed', async ({ page }) => {
    await page.goto('/');

    // Wait for reports to load in live feed
    await expect(page.getByText('View details →').first()).toBeVisible({ timeout: 10000 });

    // Click the first report card
    await page.getByText('View details →').first().click();

    // Should navigate to /reports/rep_*
    await expect(page).toHaveURL(/\/reports\/rep_/);

    // Should show report detail page
    await expect(page.getByText('AI Multimodal Summary & Routing Note')).toBeVisible({ timeout: 10000 });
  });
});
