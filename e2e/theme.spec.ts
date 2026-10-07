import { expect, test } from "@playwright/test";

test("starts in dark mode, toggles to light, and persists", async ({
  page,
}) => {
  await page.goto("/");
  const html = page.locator("html");

  await expect(html).toHaveClass(/\bdark\b/);

  const toggle = page.getByRole("button", { name: /theme/i });

  await toggle.click();
  await expect(html).toHaveClass(/\blight\b/);
  await expect(html).not.toHaveClass(/\bdark\b/);

  await page.reload();
  await expect(html).toHaveClass(/\blight\b/);
  await expect(html).not.toHaveClass(/\bdark\b/);
});
