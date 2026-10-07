import { expect, test } from "@playwright/test";

test("desktop nav link jumps to its section", async ({ page }) => {
  await page.goto("/");
  await page.locator('nav[aria-label="Main"] a[href="#about"]').click();
  await expect(page).toHaveURL(/\/#about$/);
});

test("logo navigates back to the home page", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("main h1")).toBeVisible();
  await page.locator('header a[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#work")).toBeVisible();
});
