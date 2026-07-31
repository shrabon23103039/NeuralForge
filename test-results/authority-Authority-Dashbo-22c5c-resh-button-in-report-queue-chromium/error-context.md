# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authority.spec.ts >> Authority Dashboard Workflow >> should display refresh button in report queue
- Location: e2e\authority.spec.ts:157:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Routed Incident Queue')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Routed Incident Queue')

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
  - link "Back to Map":
    - /url: /
  - heading "Sign In to Nirapod" [level=1]
  - paragraph: Dhaka Citizen & Authority Access Portal
  - text: Email Address
  - textbox "user@example.com"
  - text: Password
  - textbox "••••••••"
  - button "Sign In"
  - button "Need an account? Sign up"
- contentinfo: Nirapod Prototype © 2026 — Built for Dhaka Citizen Safety & Emergency Resilience.
```

# Test source

```ts
  60  |     const deptSelect = page.locator('select').first();
  61  |     await deptSelect.selectOption('police');
  62  | 
  63  |     // Wait for filtered results
  64  |     await page.waitForTimeout(1000);
  65  | 
  66  |     // The table should still be visible (even if showing different data)
  67  |     await expect(page.getByText('Routed Incident Queue')).toBeVisible();
  68  |   });
  69  | 
  70  |   test('should filter reports by status', async ({ page }) => {
  71  |     await page.goto('/authority');
  72  | 
  73  |     // Wait for reports to load
  74  |     await expect(page.getByText('Routed Incident Queue')).toBeVisible({ timeout: 10000 });
  75  | 
  76  |     // Select a specific status
  77  |     const statusSelect = page.locator('select').nth(1);
  78  |     await statusSelect.selectOption('received');
  79  | 
  80  |     // Wait for filtered results
  81  |     await page.waitForTimeout(1000);
  82  | 
  83  |     await expect(page.getByText('Routed Incident Queue')).toBeVisible();
  84  |   });
  85  | 
  86  |   test('should filter reports by category', async ({ page }) => {
  87  |     await page.goto('/authority');
  88  | 
  89  |     // Wait for reports to load
  90  |     await expect(page.getByText('Routed Incident Queue')).toBeVisible({ timeout: 10000 });
  91  | 
  92  |     // Select a specific category
  93  |     const categorySelect = page.locator('select').nth(2);
  94  |     await categorySelect.selectOption('manhole');
  95  | 
  96  |     // Wait for filtered results
  97  |     await page.waitForTimeout(1000);
  98  | 
  99  |     await expect(page.getByText('Routed Incident Queue')).toBeVisible();
  100 |   });
  101 | 
  102 |   test('should display report table with correct columns', async ({ page }) => {
  103 |     await page.goto('/authority');
  104 | 
  105 |     // Wait for the table to load
  106 |     await expect(page.getByText('Routed Incident Queue')).toBeVisible({ timeout: 10000 });
  107 | 
  108 |     // Check table headers
  109 |     await expect(page.getByText('AI Triage')).toBeVisible();
  110 |     await expect(page.getByText('Incident Category')).toBeVisible();
  111 |     await expect(page.getByText('Description', { exact: true })).toBeVisible();
  112 |     await expect(page.getByText('Routed Dept')).toBeVisible();
  113 |     await expect(page.getByText('Votes')).toBeVisible();
  114 |     await expect(page.getByText('Update Status')).toBeVisible();
  115 |   });
  116 | 
  117 |   test('should update report status via dropdown', async ({ page }) => {
  118 |     await page.goto('/authority');
  119 | 
  120 |     // Wait for reports table to load with data
  121 |     await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
  122 | 
  123 |     // Find the status dropdown in the first report row
  124 |     const statusDropdown = page.locator('tbody tr').first().locator('select');
  125 |     await expect(statusDropdown).toBeVisible();
  126 | 
  127 |     // Change status to "verified"
  128 |     await statusDropdown.selectOption('verified');
  129 | 
  130 |     // Wait for API response
  131 |     await page.waitForTimeout(1000);
  132 | 
  133 |     // The dropdown should now show "verified"
  134 |     await expect(statusDropdown).toHaveValue('verified');
  135 |   });
  136 | 
  137 |   test('should show AI Executive Briefing button', async ({ page }) => {
  138 |     await page.goto('/authority');
  139 | 
  140 |     // Check the AI Briefing button: t('authority_summary_btn') = "Generate AI Executive Briefing"
  141 |     const briefingBtn = page.getByRole('button', { name: /generate ai executive briefing/i });
  142 |     await expect(briefingBtn).toBeVisible();
  143 |   });
  144 | 
  145 |   test('should navigate to authority from navbar', async ({ page }) => {
  146 |     await page.goto('/');
  147 | 
  148 |     // Click the Authority Portal link in navbar
  149 |     const authorityLink = page.locator('header').getByRole('link', { name: /authority portal/i });
  150 |     await expect(authorityLink).toBeVisible();
  151 |     await authorityLink.click();
  152 | 
  153 |     await expect(page).toHaveURL(/\/authority/);
  154 |     await expect(page.getByRole('heading', { name: /authority triage dashboard/i })).toBeVisible();
  155 |   });
  156 | 
  157 |   test('should display refresh button in report queue', async ({ page }) => {
  158 |     await page.goto('/authority');
  159 | 
> 160 |     await expect(page.getByText('Routed Incident Queue')).toBeVisible({ timeout: 10000 });
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  161 | 
  162 |     // The refresh button is next to the queue header
  163 |     // It's a small icon button - find it by its parent section
  164 |     const refreshButton = page.locator('.bg-slate-900').locator('button').filter({ has: page.locator('svg') }).last();
  165 |     await expect(refreshButton).toBeVisible();
  166 |   });
  167 | });
  168 | 
```