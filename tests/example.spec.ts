import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test('bypass OIDC login with environment variable', async ({ page }) => {
  const loginUrl = `http://127.0.0.1:31000/api/login?key=foo-bar-baz&user=testuser?&role=user`;

  await page.goto(loginUrl);

  await expect(page).toHaveURL('http://127.0.0.1:31000');

  await page.goto('http://127.0.0.1:31000/dashboard');
  await expect(page).toHaveURL('http://127.0.0.1:31000/dashboard');

})