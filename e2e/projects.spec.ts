import { expect, test } from "@playwright/test";

test("projects index lists case studies", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydrat|didn't match/i.test(message.text())
    ) {
      hydrationErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (/hydrat|didn't match/i.test(error.message)) {
      hydrationErrors.push(error.message);
    }
  });

  const response = await page.goto("/projects");
  expect(response?.status()).toBe(200);

  await expect(page.locator("main h1")).toContainText("studies");
  await expect(
    page.locator('nav[aria-label="Filter projects by tag"]'),
  ).toBeVisible();

  const cards = page.locator("main article");
  expect(await cards.count()).toBeGreaterThanOrEqual(1);
  await expect(cards.first().locator("h3 a")).toBeVisible();

  await page.waitForTimeout(1000);
  expect(hydrationErrors).toEqual([]);
});

test("case study detail page renders", async ({ page }) => {
  await page.goto("/projects");
  await page.locator("main article h3 a").first().click();

  await expect(page).toHaveURL(/\/projects\/[^/?]+$/);
  await expect(page.locator("main h1")).toBeVisible();
  await expect(
    page.locator('main section[aria-labelledby="highlights-heading"] li').first(),
  ).toBeVisible();
  await expect(page.locator('a[href="/projects"]')).toBeVisible();
});
