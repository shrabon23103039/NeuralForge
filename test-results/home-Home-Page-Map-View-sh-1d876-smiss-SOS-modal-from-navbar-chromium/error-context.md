# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> Home Page & Map View >> should open and dismiss SOS modal from navbar
- Location: e2e\home.spec.ts:48:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('SOS Alert Activated!')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('SOS Alert Activated!')

```

```yaml
- banner:
  - link "Nirapod Dhaka Safety Net":
    - /url: /
  - navigation:
    - link "Risk Map":
      - /url: /
    - link "Report Hazard":
      - /url: /report
    - link "Authority Portal":
      - /url: /authority
  - button "EMERGENCY SOS"
  - button "বাংলা"
- main:
  - text: Dhaka Hackathon Prototype
  - heading "Dhaka Citizen Safety & Hazard Platform" [level=1]
  - paragraph: AI-verified real-time hazard reporting and emergency alerts for a safer Dhaka.
  - button "Seed Demo Data (Dhaka)"
  - link "Report Hazard":
    - /url: /report
  - button "EMERGENCY SOS"
  - link "Call 999 Hotline":
    - /url: tel:999
  - text: "Filter:"
  - button "All Reports (0)"
  - button "🚨 Crime Only"
  - button "🛠️ Infrastructure"
  - button "⚠️ High Severity"
  - checkbox "Show AI Risk Heatmap" [checked]
  - text: Show AI Risk Heatmap
  - button "Refresh Map Data"
  - paragraph: Loading Dhaka Interactive Map...
  - heading "Dhaka Live Hazard Stream (0)" [level=3]
  - text: LIVE No reports match your filters.
- contentinfo: Nirapod Prototype © 2026 — Built for Dhaka Citizen Safety & Emergency Resilience.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Home Page & Map View', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     page.on('console', (msg) => {
  6   |       if (msg.type() === 'error') {
  7   |         console.error(`[Browser Console Error] ${msg.text()}`);
  8   |       }
  9   |     });
  10  |     page.on('pageerror', (exception) => {
  11  |       console.error(`[Browser Unhandled Exception] ${exception.message}`);
  12  |     });
  13  |   });
  14  | 
  15  |   test('should load home page with hero title and live stream', async ({ page }) => {
  16  |     await page.goto('/');
  17  | 
  18  |     // Check main title matches i18n hero_title: "Dhaka Citizen Safety & Hazard Platform"
  19  |     await expect(page.locator('h1')).toContainText('Dhaka Citizen Safety');
  20  | 
  21  |     // Check Live Hazard Stream section
  22  |     await expect(page.getByText('Dhaka Live Hazard Stream')).toBeVisible();
  23  | 
  24  |     // Check SOS button presence in hero section (SOSButton component)
  25  |     const sosButton = page.getByRole('button', { name: /emergency sos/i });
  26  |     await expect(sosButton.first()).toBeVisible();
  27  |   });
  28  | 
  29  |   test('should toggle category filters on map view', async ({ page }) => {
  30  |     await page.goto('/');
  31  | 
  32  |     // Click 'Crime Only' filter
  33  |     const crimeFilter = page.getByRole('button', { name: /crime only/i });
  34  |     await crimeFilter.click();
  35  |     await expect(crimeFilter).toHaveClass(/bg-rose-600/);
  36  | 
  37  |     // Click 'Infrastructure' filter
  38  |     const hazardFilter = page.getByRole('button', { name: /infrastructure/i });
  39  |     await hazardFilter.click();
  40  |     await expect(hazardFilter).toHaveClass(/bg-amber-600/);
  41  | 
  42  |     // Click 'All Reports' filter
  43  |     const allFilter = page.getByRole('button', { name: /all reports/i });
  44  |     await allFilter.click();
  45  |     await expect(allFilter).toHaveClass(/bg-indigo-600/);
  46  |   });
  47  | 
  48  |   test('should open and dismiss SOS modal from navbar', async ({ page }) => {
  49  |     await page.goto('/');
  50  | 
  51  |     // The Navbar has an SOS button with text from t('sos_button') = "EMERGENCY SOS"
  52  |     // Click the navbar SOS button (there are multiple SOS buttons, navbar one is in header)
  53  |     const navbarSosButton = page.locator('header').getByRole('button', { name: /emergency sos/i });
  54  |     await navbarSosButton.click();
  55  | 
  56  |     // Verify SOS modal pops up with t('sos_sent_title') = "SOS Alert Activated!"
> 57  |     await expect(page.getByText('SOS Alert Activated!')).toBeVisible({ timeout: 10000 });
      |                                                          ^ Error: expect(locator).toBeVisible() failed
  58  |     // Check for 999 call button: t('sos_999_btn') = "Call 999 Hotline"
  59  |     await expect(page.getByText('Call 999 Hotline')).toBeVisible();
  60  | 
  61  |     // Dismiss modal - Navbar SOS modal uses "Dismiss Alert" text
  62  |     const dismissButton = page.getByRole('button', { name: /dismiss alert/i });
  63  |     await dismissButton.click();
  64  | 
  65  |     await expect(page.getByText('SOS Alert Activated!')).not.toBeVisible();
  66  |   });
  67  | 
  68  |   test('should trigger SOS from hero section SOSButton component', async ({ page }) => {
  69  |     await page.goto('/');
  70  | 
  71  |     // Click the hero section SOS button (within main content, not header)
  72  |     const heroSosButton = page.locator('main').getByRole('button', { name: /emergency sos/i });
  73  |     await heroSosButton.click();
  74  | 
  75  |     // SOSButton component shows t('sos_sent_title') = "SOS Alert Activated!"
  76  |     await expect(page.locator('main').getByText('SOS Alert Activated!')).toBeVisible({ timeout: 10000 });
  77  | 
  78  |     // Call 999 button
  79  |     await expect(page.locator('main').getByText('Call 999 Hotline')).toBeVisible();
  80  | 
  81  |     // Dismiss - SOSButton component uses "Dismiss" text
  82  |     const dismissBtn = page.locator('main').getByRole('button', { name: /dismiss/i });
  83  |     await dismissBtn.click();
  84  | 
  85  |     await expect(page.locator('main').getByText('SOS Alert Activated!')).not.toBeVisible();
  86  |   });
  87  | 
  88  |   test('should toggle language between English and Bangla', async ({ page }) => {
  89  |     await page.goto('/');
  90  | 
  91  |     // Toggle to Bangla - button shows "বাংলা" when lang is 'en'
  92  |     const langBtn = page.getByRole('button', { name: /বাংলা/i });
  93  |     await langBtn.click();
  94  | 
  95  |     // Hero title should update to Bangla equivalent from bn.json
  96  |     await expect(page.locator('h1')).toContainText('ঢাকা');
  97  | 
  98  |     // Toggle back to English - now button shows "English"
  99  |     const engBtn = page.getByRole('button', { name: /english/i });
  100 |     await engBtn.click();
  101 | 
  102 |     await expect(page.locator('h1')).toContainText('Dhaka Citizen Safety');
  103 |   });
  104 | 
  105 |   test('should display seeded reports in live stream sidebar', async ({ page }) => {
  106 |     await page.goto('/');
  107 | 
  108 |     // The memory store has pre-seeded demo data; we should see report cards
  109 |     // Each report card shows the category name and a "View details →" link
  110 |     await expect(page.getByText('View details →').first()).toBeVisible({ timeout: 10000 });
  111 |   });
  112 | 
  113 |   test('should navigate to report page from hero section', async ({ page }) => {
  114 |     await page.goto('/');
  115 | 
  116 |     // The "Report Hazard" link in the hero section
  117 |     const reportLink = page.locator('main').getByRole('link', { name: /report hazard/i }).first();
  118 |     await expect(reportLink).toBeVisible();
  119 |     await reportLink.click();
  120 | 
  121 |     await expect(page).toHaveURL(/\/report/);
  122 |   });
  123 | });
  124 | 
```