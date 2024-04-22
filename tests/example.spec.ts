import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test('bypass OIDC login with environment variable', async ({ page }) => {
  const loginUrl = `http://127.0.0.1:31000/api/login?key=foo-bar-baz&user=testuser?&role=user`;

  await page.goto(loginUrl);
  await page.click('Add Task');
})