# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Workflow >> should navigate to login from navbar
- Location: e2e\auth.spec.ts:106:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('header').getByRole('link', { name: /sign in/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('header').getByRole('link', { name: /sign in/i })

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
  11  |       console.error(`[Browser Unhandled Exception] ${exception.message}`);
  12  |     });
  13  |   });
  14  | 
  15  |   test('should display login page with correct elements', async ({ page }) => {
  16  |     await page.goto('/login');
  17  | 
  18  |     // Check heading: t('auth_login_title') = "Sign In to Nirapod"
  19  |     await expect(page.getByRole('heading', { name: /sign in to nirapod/i })).toBeVisible();
  20  | 
  21  |     // Check the portal subtitle
  22  |     await expect(page.getByText('Dhaka Citizen & Authority Access Portal')).toBeVisible();
  23  | 
  24  |     // Check email field
  25  |     await expect(page.getByPlaceholder('user@example.com')).toBeVisible();
  26  | 
  27  |     // Check password field
  28  |     await expect(page.getByPlaceholder('••••••••')).toBeVisible();
  29  | 
  30  |     // Check submit button: t('auth_submit_login') = "Sign In"
  31  |     await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();
  32  | 
  33  |     // Check sign-up toggle: t('auth_toggle_signup') = "Need an account? Sign up"
  34  |     await expect(page.getByText(/need an account/i)).toBeVisible();
  35  | 
  36  |     // Check "Back to Map" link
  37  |     await expect(page.getByText('Back to Map')).toBeVisible();
  38  |   });
  39  | 
  40  |   test('should toggle between sign in and sign up forms', async ({ page }) => {
  41  |     await page.goto('/login');
  42  | 
  43  |     // Initially in sign-in mode
  44  |     await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();
  45  | 
  46  |     // Toggle to sign up
  47  |     await page.getByText(/need an account/i).click();
  48  | 
  49  |     // Now should show "Create Account" button
  50  |     await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  51  | 
  52  |     // Should show role selection
  53  |     await expect(page.getByText('Citizen')).toBeVisible();
  54  |     await expect(page.getByText('Authority Officer')).toBeVisible();
  55  | 
  56  |     // Toggle back to sign in
  57  |     await page.getByText(/already registered/i).click();
  58  | 
  59  |     // Back to sign-in mode
  60  |     await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();
  61  |   });
  62  | 
  63  |   test('should show role selection in signup mode', async ({ page }) => {
  64  |     await page.goto('/login');
  65  | 
  66  |     // Switch to signup mode
  67  |     await page.getByText(/need an account/i).click();
  68  | 
  69  |     // Check role buttons: t('auth_role_citizen') = "Citizen", t('auth_role_authority') = "Authority Officer"
  70  |     const citizenBtn = page.getByRole('button', { name: /citizen/i }).first();
  71  |     const authorityBtn = page.getByRole('button', { name: /authority officer/i });
  72  | 
  73  |     await expect(citizenBtn).toBeVisible();
  74  |     await expect(authorityBtn).toBeVisible();
  75  | 
  76  |     // Default is citizen - should have active styling
  77  |     await expect(citizenBtn).toHaveClass(/bg-indigo-600/);
  78  | 
  79  |     // Click authority role
  80  |     await authorityBtn.click();
  81  |     await expect(authorityBtn).toHaveClass(/bg-blue-600/);
  82  | 
  83  |     // Should now show department selector
  84  |     await expect(page.getByText('Dhaka City Corporation')).toBeVisible();
  85  |   });
  86  | 
  87  |   test('should show department dropdown when authority role selected in signup', async ({ page }) => {
  88  |     await page.goto('/login');
  89  | 
  90  |     // Switch to signup mode
  91  |     await page.getByText(/need an account/i).click();
  92  | 
  93  |     // Select authority role
  94  |     await page.getByRole('button', { name: /authority officer/i }).click();
  95  | 
  96  |     // Department dropdown should appear with options
  97  |     const deptSelect = page.locator('select');
  98  |     await expect(deptSelect).toBeVisible();
  99  | 
  100 |     // Check department options
  101 |     await expect(page.getByText('Dhaka City Corporation')).toBeVisible();
  102 |     // Select another department
  103 |     await deptSelect.selectOption('police');
  104 |   });
  105 | 
  106 |   test('should navigate to login from navbar', async ({ page }) => {
  107 |     await page.goto('/');
  108 | 
  109 |     // Click Sign In link in header (when not logged in)
  110 |     const signInLink = page.locator('header').getByRole('link', { name: /sign in/i });
> 111 |     await expect(signInLink).toBeVisible();
      |                              ^ Error: expect(locator).toBeVisible() failed
  112 |     await signInLink.click();
  113 | 
  114 |     await expect(page).toHaveURL(/\/login/);
  115 |     await expect(page.getByRole('heading', { name: /sign in to nirapod/i })).toBeVisible();
  116 |   });
  117 | 
  118 |   test('should show error for invalid login credentials', async ({ page }) => {
  119 |     await page.goto('/login');
  120 | 
  121 |     // Fill in invalid credentials
  122 |     await page.getByPlaceholder('user@example.com').fill('invalid@test.com');
  123 |     await page.getByPlaceholder('••••••••').fill('wrongpassword');
  124 | 
  125 |     // Submit
  126 |     await page.getByRole('button', { name: /^sign in$/i }).click();
  127 | 
  128 |     // Should show error message (Supabase auth error)
  129 |     await expect(page.locator('.bg-red-950')).toBeVisible({ timeout: 10000 });
  130 |   });
  131 | });
  132 | 
```