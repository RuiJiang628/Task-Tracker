import { test, expect } from "@playwright/test";

test.describe.serial("Task Operations", () => {
  test("Create Tasks", async ({ page }) => {
    const loginUrl = `http://127.0.0.1:31000/api/login?key=foo-bar-baz&user=wl275&role=user`;
    await page.goto(loginUrl);

    // create a new task
    await page.getByRole("button", { name: "Add Task" }).click();
    await page.getByPlaceholder("Add title").click();
    await page.getByPlaceholder("Add title").fill("Here you go");
    await page.getByPlaceholder("Add description (optional)").click();
    await page
      .getByPlaceholder("Add description (optional)")
      .fill("This is a description");
    await page.waitForTimeout(1000);
    await page.waitForSelector(".modal:visible");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(1000);

    // create another task
    await page.getByRole("button", { name: "Add Task" }).click();
    await page.getByPlaceholder("Add title").click();
    await page.getByPlaceholder("Add title").fill("Here you go again");
    await page.getByPlaceholder("Add description (optional)").click();
    await page
      .getByPlaceholder("Add description (optional)")
      .fill("This is a description again");
    await page.waitForTimeout(1000);
    await page.waitForSelector(".modal:visible");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: "Add Task" }).click();
    await page.getByPlaceholder("Add title").click();
    await page
      .getByPlaceholder("Add title")
      .fill("Here you go again and again");
    await page.getByPlaceholder("Add description (optional)").click();
    await page
      .getByPlaceholder("Add description (optional)")
      .fill("This is a description again and again");
    await page.waitForTimeout(1000);
    await page.waitForSelector(".modal:visible");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(1000);
  });

  test("Edit Tasks", async ({ page }) => {
    const loginUrl = `http://127.0.0.1:31000/api/login?key=foo-bar-baz&user=wl275&role=user`;
    await page.goto(loginUrl);

    await page.locator(".task-list .task-item").first().click();
    await expect(page.locator(".modal-content")).toBeVisible();
    await page.fill('input[placeholder="Edit title"]', "Updated Task Title");
    await page.waitForTimeout(1000);
    await page.fill(
      'textarea[placeholder="Add description (optional)"]',
      "Updated task description"
    );
    await page.waitForTimeout(1000);
    await page.locator("button.save-button").click();
    await page.waitForTimeout(1000);
    await page.locator(".task-list .task-item").first().click();
  });

  test("Check Completed Tasks", async ({ page }) => {
    const loginUrl = `http://127.0.0.1:31000/api/login?key=foo-bar-baz&user=wl275&role=user`;
    await page.goto(loginUrl);

    const checkbox = page.locator(
      '.task-list .task-item:first-child .custom-checkbox input[type="checkbox"]'
    );
    await checkbox.click();
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Completed" }).click();
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Active" }).click();
    await page.waitForTimeout(1000);
  });

  test("Delete Tasks", async ({ page }) => {
    const loginUrl = `http://127.0.0.1:31000/api/login?key=foo-bar-baz&user=wl275&role=user`;
    await page.goto(loginUrl);

    await page.locator(".task-list .task-item").first().click();
    await page.waitForTimeout(1000);
    await expect(page.locator(".modal-content")).toBeVisible();
    await page.locator("button.delete-button").click();
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Delete All" }).click();
    await page.waitForTimeout(1000);
  });

  test("Edit User Info", async ({ page }) => {
    const loginUrl = `http://127.0.0.1:31000/api/login?key=foo-bar-baz&user=wl275&role=user`;
    await page.goto(loginUrl);

    await page.click(".profile-button");
    await page.waitForSelector(".edit-profile", { state: "visible" });
    await page.fill("#username", "Akemi");
    await page.fill("#email", "akemi0310@meow.com");
    await page.selectOption("#gender", "female");
    await page.fill("#birthday", "2022-04-22");
    await page.click(".button.save-button");
    await page.waitForTimeout(1000);
    await page.goto(loginUrl);
    await page.waitForTimeout(1000);
  });

  test("Admin User Info Edited", async ({ page }) => {
    const loginUrl = `http://127.0.0.1:31000/api/login?key=foo-bar-baz&user=rj153?&role=admin`;
    await page.goto(loginUrl);
    await page.locator(".task-list .task-item").first().click();
    await expect(page.locator(".modal-content")).toBeVisible();
    await page.waitForTimeout(1000);

    await page.fill('input[placeholder="Edit username"]', "Wendy");
    await page.fill('input[placeholder="Edit email"]', "123@123.com")
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Save")');
  });
});