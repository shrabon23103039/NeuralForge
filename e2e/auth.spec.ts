import { test, expect } from '@playwright/test';

test.describe('Authentication Workflow', () => {
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

  test('should display login page with correct elements', async ({ page }) => {
    await page.goto('/login');

    // Check heading: t('auth_login_title') = "Sign In to Nirapod"
    await expect(page.getByRole('heading', { name: /sign in to nirapod/i })).toBeVisible();

    // Check the portal subtitle
    await expect(page.getByText('Dhaka Citizen & Authority Access Portal')).toBeVisible();

    // Check email field
    await expect(page.getByPlaceholder('user@example.com')).toBeVisible();

    // Check password field
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();

    // Check submit button: t('auth_submit_login') = "Sign In"
    await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();

    // Check sign-up toggle: t('auth_toggle_signup') = "Need an account? Sign up"
    await expect(page.getByText(/need an account/i)).toBeVisible();

    // Check "Back to Map" link
    await expect(page.getByText('Back to Map')).toBeVisible();
  });

  test('should toggle between sign in and sign up forms', async ({ page }) => {
    await page.goto('/login');

    // Initially in sign-in mode
    await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();

    // Toggle to sign up by clicking the toggle button
    const toggleBtn = page.getByRole('button', { name: /need an account/i });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // Wait for sign up mode — "Create Account" button should appear
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible({ timeout: 5000 });

    // Should show role selection
    await expect(page.getByText('Citizen')).toBeVisible();
    await expect(page.getByText('Authority Officer')).toBeVisible();

    // Toggle back to sign in
    await page.getByText(/already registered/i).click();

    // Back to sign-in mode
    await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();
  });

  test('should show role selection in signup mode', async ({ page }) => {
    await page.goto('/login');

    // Switch to signup mode
    await page.getByRole('button', { name: /need an account/i }).click();

    // Wait for signup mode to be active
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible({ timeout: 5000 });

    // Check role buttons: t('auth_role_citizen') = "Citizen", t('auth_role_authority') = "Authority Officer"
    const citizenBtn = page.getByRole('button', { name: /citizen/i }).first();
    const authorityBtn = page.getByRole('button', { name: /authority officer/i });

    await expect(citizenBtn).toBeVisible();
    await expect(authorityBtn).toBeVisible();

    // Default is citizen - should have active styling
    await expect(citizenBtn).toHaveClass(/bg-indigo-600/);

    // Click authority role
    await authorityBtn.click();
    await expect(authorityBtn).toHaveClass(/bg-blue-600/);

    // Should now show department selector
    await expect(page.getByText('Dhaka City Corporation')).toBeVisible();
  });

  test('should show department dropdown when authority role selected in signup', async ({ page }) => {
    await page.goto('/login');

    // Switch to signup mode
    await page.getByRole('button', { name: /need an account/i }).click();

    // Wait for signup mode to be active
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible({ timeout: 5000 });

    // Select authority role
    await page.getByRole('button', { name: /authority officer/i }).click();

    // Department dropdown should appear with options
    const deptSelect = page.locator('select');
    await expect(deptSelect).toBeVisible();

    // Check department options
    await expect(page.getByText('Dhaka City Corporation')).toBeVisible();
    // Select another department
    await deptSelect.selectOption('police');
  });

  test('should navigate to login from navbar', async ({ page }) => {
    await page.goto('/');

    // Click Sign In link in header (when not logged in)
    const signInLink = page.locator('header').getByRole('link', { name: /sign in/i });
    await expect(signInLink).toBeVisible();
    await signInLink.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /sign in to nirapod/i })).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.getByPlaceholder('user@example.com').fill('invalid@test.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');

    // Submit
    await page.getByRole('button', { name: /^sign in$/i }).click();

    // Should show error message (Supabase auth error)
    await expect(page.locator('.bg-red-950')).toBeVisible({ timeout: 10000 });
  });

  test('should redirect /signup to /login with signup mode', async ({ page }) => {
    await page.goto('/signup');

    // Should redirect to /login?mode=signup
    await expect(page).toHaveURL(/\/login\?mode=signup/, { timeout: 10000 });

    // Should auto-open signup mode — "Create Account" button should be visible
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible({ timeout: 5000 });
  });

  test('should redirect /register to /login with signup mode', async ({ page }) => {
    await page.goto('/register');

    // Should redirect to /login?mode=signup
    await expect(page).toHaveURL(/\/login\?mode=signup/, { timeout: 10000 });

    // Should auto-open signup mode — "Create Account" button should be visible
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible({ timeout: 5000 });
  });
});
