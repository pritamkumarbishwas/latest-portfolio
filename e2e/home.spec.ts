import { expect, test } from "@playwright/test";

test("home page loads with hero, featured work, and footer", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("#work")).toBeVisible();
  await expect(page.locator("#work article").first()).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});
