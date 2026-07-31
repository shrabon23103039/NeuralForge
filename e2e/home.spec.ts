import { test, expect } from '@playwright/test';

test.describe('Home Page & Map View', () => {
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

  test('should load home page with hero title and live stream', async ({ page }) => {
    await page.goto('/');

    // Check main title matches i18n hero_title: "Dhaka Citizen Safety & Hazard Platform"
    await expect(page.locator('h1')).toContainText('Dhaka Citizen Safety');

    // Check Live Hazard Stream section
    await expect(page.getByText('Dhaka Live Hazard Stream')).toBeVisible();

    // Check SOS button presence in hero section (SOSButton component)
    const sosButton = page.getByRole('button', { name: /emergency sos/i });
    await expect(sosButton.first()).toBeVisible();
  });

  test('should toggle category filters on map view', async ({ page }) => {
    await page.goto('/');

    // Click 'Crime Only' filter
    const crimeFilter = page.getByRole('button', { name: /crime only/i });
    await crimeFilter.click();
    await expect(crimeFilter).toHaveClass(/bg-rose-600/);

    // Click 'Infrastructure' filter
    const hazardFilter = page.getByRole('button', { name: /infrastructure/i });
    await hazardFilter.click();
    await expect(hazardFilter).toHaveClass(/bg-amber-600/);

    // Click 'All Reports' filter
    const allFilter = page.getByRole('button', { name: /all reports/i });
    await allFilter.click();
    await expect(allFilter).toHaveClass(/bg-indigo-600/);
  });

  test('should open and dismiss SOS modal from navbar', async ({ page }) => {
    await page.goto('/');

    // The Navbar has an SOS button with text from t('sos_button') = "EMERGENCY SOS"
    // Click the navbar SOS button (there are multiple SOS buttons, navbar one is in header)
    const navbarSosButton = page.locator('header').getByRole('button', { name: /emergency sos/i });
    await navbarSosButton.click();

    // Verify SOS modal pops up with t('sos_sent_title') = "SOS Alert Activated!"
    await expect(page.getByText('SOS Alert Activated!')).toBeVisible({ timeout: 10000 });
    // Check for 999 call button: t('sos_999_btn') = "Call 999 Hotline"
    await expect(page.getByText('Call 999 Hotline')).toBeVisible();

    // Dismiss modal - Navbar SOS modal uses "Dismiss Alert" text
    const dismissButton = page.getByRole('button', { name: /dismiss alert/i });
    await dismissButton.click();

    await expect(page.getByText('SOS Alert Activated!')).not.toBeVisible();
  });

  test('should trigger SOS from hero section SOSButton component', async ({ page }) => {
    await page.goto('/');

    // Click the hero section SOS button (within main content, not header)
    const heroSosButton = page.locator('main').getByRole('button', { name: /emergency sos/i });
    await heroSosButton.click();

    // SOSButton component shows t('sos_sent_title') = "SOS Alert Activated!"
    await expect(page.locator('main').getByText('SOS Alert Activated!')).toBeVisible({ timeout: 10000 });

    // Call 999 button
    await expect(page.locator('main').getByText('Call 999 Hotline')).toBeVisible();

    // Dismiss - SOSButton component uses "Dismiss" text
    const dismissBtn = page.locator('main').getByRole('button', { name: /dismiss/i });
    await dismissBtn.click();

    await expect(page.locator('main').getByText('SOS Alert Activated!')).not.toBeVisible();
  });

  test('should toggle language between English and Bangla', async ({ page }) => {
    await page.goto('/');

    // Toggle to Bangla - button shows "বাংলা" when lang is 'en'
    const langBtn = page.getByRole('button', { name: /বাংলা/i });
    await langBtn.click();

    // Hero title should update to Bangla equivalent from bn.json
    await expect(page.locator('h1')).toContainText('ঢাকা');

    // Toggle back to English - now button shows "English"
    const engBtn = page.getByRole('button', { name: /english/i });
    await engBtn.click();

    await expect(page.locator('h1')).toContainText('Dhaka Citizen Safety');
  });

  test('should display seeded reports in live stream sidebar', async ({ page }) => {
    await page.goto('/');

    // The memory store has pre-seeded demo data; we should see report cards
    // Each report card shows the category name and a "View details →" link
    await expect(page.getByText('View details →').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to report page from hero section', async ({ page }) => {
    await page.goto('/');

    // The "Report Hazard" link in the hero section
    const reportLink = page.locator('main').getByRole('link', { name: /report hazard/i }).first();
    await expect(reportLink).toBeVisible();
    await reportLink.click();

    await expect(page).toHaveURL(/\/report/);
  });
});
