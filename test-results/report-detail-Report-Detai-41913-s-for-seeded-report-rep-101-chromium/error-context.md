# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: report-detail.spec.ts >> Report Detail & Community Verification Workflow >> should display report details for seeded report rep_101
- Location: e2e\report-detail.spec.ts:15:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /manhole incident/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /manhole incident/i })

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
- main: Loading Report Details...
- contentinfo: Nirapod Prototype © 2026 — Built for Dhaka Citizen Safety & Emergency Resilience.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Report Detail & Community Verification Workflow', () => {
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
  15  |   test('should display report details for seeded report rep_101', async ({ page }) => {
  16  |     // Navigate to the first seeded report detail page
  17  |     // rep_101 = index 0 = category "manhole", heading: "manhole Incident"
  18  |     await page.goto('/reports/rep_101');
  19  | 
  20  |     // Check heading: "{category} Incident" -> "manhole Incident" (case-insensitive)
> 21  |     await expect(page.getByRole('heading', { name: /manhole incident/i })).toBeVisible({ timeout: 10000 });
      |                                                                            ^ Error: expect(locator).toBeVisible() failed
  22  | 
  23  |     // Check AI Multimodal Summary section
  24  |     await expect(page.getByText('AI Multimodal Summary & Routing Note')).toBeVisible();
  25  | 
  26  |     // Check the English brief section
  27  |     await expect(page.getByText('ENGLISH BRIEF')).toBeVisible();
  28  | 
  29  |     // Check the Bangla brief section
  30  |     await expect(page.getByText('বাংলা সংক্ষিপ্ত বিবরণ')).toBeVisible();
  31  | 
  32  |     // Check "Back to Map" link
  33  |     await expect(page.getByText('Back to Map')).toBeVisible();
  34  | 
  35  |     // Check metadata badges (Type, Status, Dept)
  36  |     await expect(page.getByText(/Type: hazard/i)).toBeVisible();
  37  |     await expect(page.getByText(/Status:/i)).toBeVisible();
  38  |   });
  39  | 
  40  |   test('should allow community confirm voting', async ({ page }) => {
  41  |     await page.goto('/reports/rep_101');
  42  | 
  43  |     // Wait for report to load
  44  |     await expect(page.getByRole('heading', { name: /manhole incident/i })).toBeVisible({ timeout: 10000 });
  45  | 
  46  |     // Confirm verification button: "Confirm Report (N)"
  47  |     const confirmBtn = page.getByRole('button', { name: /confirm report/i });
  48  |     await expect(confirmBtn).toBeVisible();
  49  | 
  50  |     const initialConfirmText = await confirmBtn.innerText();
  51  |     await confirmBtn.click();
  52  | 
  53  |     // After click, count should increase
  54  |     await page.waitForTimeout(1000);
  55  |     const updatedConfirmText = await confirmBtn.innerText();
  56  |     expect(updatedConfirmText).not.toBe(initialConfirmText);
  57  |   });
  58  | 
  59  |   test('should allow community dispute voting', async ({ page }) => {
  60  |     await page.goto('/reports/rep_101');
  61  | 
  62  |     // Wait for report to load
  63  |     await expect(page.getByRole('heading', { name: /manhole incident/i })).toBeVisible({ timeout: 10000 });
  64  | 
  65  |     // Dispute verification button: "Dispute Report (N)"
  66  |     const disputeBtn = page.getByRole('button', { name: /dispute report/i });
  67  |     await expect(disputeBtn).toBeVisible();
  68  | 
  69  |     const initialDisputeText = await disputeBtn.innerText();
  70  |     await disputeBtn.click();
  71  | 
  72  |     // After click, count should increase
  73  |     await page.waitForTimeout(1000);
  74  |     const updatedDisputeText = await disputeBtn.innerText();
  75  |     expect(updatedDisputeText).not.toBe(initialDisputeText);
  76  |   });
  77  | 
  78  |   test('should show citizen description section', async ({ page }) => {
  79  |     await page.goto('/reports/rep_101');
  80  | 
  81  |     await expect(page.getByRole('heading', { name: /manhole incident/i })).toBeVisible({ timeout: 10000 });
  82  | 
  83  |     // Citizen description section
  84  |     await expect(page.getByText('Citizen Description')).toBeVisible();
  85  |     // The seed data description for rep_101 (manhole)
  86  |     await expect(page.getByText(/uncovered manhole/i)).toBeVisible();
  87  |   });
  88  | 
  89  |   test('should show Community Verification section', async ({ page }) => {
  90  |     await page.goto('/reports/rep_101');
  91  | 
  92  |     await expect(page.getByRole('heading', { name: /manhole incident/i })).toBeVisible({ timeout: 10000 });
  93  | 
  94  |     // Community Verification section
  95  |     await expect(page.getByText('Community Verification')).toBeVisible();
  96  |     await expect(page.getByText(/confirming helps city authorities/i)).toBeVisible();
  97  |   });
  98  | 
  99  |   test('should navigate to report detail from home page live feed', async ({ page }) => {
  100 |     await page.goto('/');
  101 | 
  102 |     // Wait for reports to load in live feed
  103 |     await expect(page.getByText('View details →').first()).toBeVisible({ timeout: 10000 });
  104 | 
  105 |     // Click the first report card
  106 |     await page.getByText('View details →').first().click();
  107 | 
  108 |     // Should navigate to /reports/rep_*
  109 |     await expect(page).toHaveURL(/\/reports\/rep_/);
  110 | 
  111 |     // Should show report detail page
  112 |     await expect(page.getByText('AI Multimodal Summary & Routing Note')).toBeVisible({ timeout: 10000 });
  113 |   });
  114 | });
  115 | 
```