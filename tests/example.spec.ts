import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test('bypass OIDC login with environment variable', async ({ page }) => {
  const loginUrl = `http://localhost:8193/api/login?key=foo-bar-baz&user=<testuser>?&role=<user>`;

  await page.goto(loginUrl);

  await expect(page).toHaveURL('http://localhost:8193');

  await page.goto('http://localhost:8193/dashboard');
  await expect(page).toHaveURL('http://localhost:8193/dashboard');

})