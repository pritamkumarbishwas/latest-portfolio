import { expect, test } from "@playwright/test";

test("shows validation errors when submitted empty", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.locator("#contact-name-error")).toHaveText(
    "Please enter your name (at least 2 characters)",
  );
  await expect(page.locator("#contact-email-error")).toHaveText(
    "Email is required",
  );
  await expect(page.locator("#contact-message-error")).toHaveText(
    "Message must be at least 10 characters",
  );
  await expect(page.getByRole("status")).toBeEmpty();
});

test("rejects an invalid email address", async ({ page }) => {
  await page.goto("/contact");
  await page.locator("#contact-name").fill("Ada Lovelace");
  await page.locator("#contact-email").fill("not-an-email");
  await page
    .locator("#contact-message")
    .fill("I would like to talk about a new project.");

  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.locator("#contact-email-error")).toHaveText(
    "Enter a valid email address",
  );
  await expect(page.locator("#contact-name-error")).toHaveCount(0);
  await expect(page.locator("#contact-message-error")).toHaveCount(0);
});

test("shows success state when the API accepts the message", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    }),
  );

  await page.goto("/contact");
  await page.locator("#contact-name").fill("Ada Lovelace");
  await page.locator("#contact-email").fill("ada@example.com");
  await page
    .locator("#contact-message")
    .fill("I would like to talk about a new project.");

  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status")).toContainText(
    "your message is on its way",
  );
  await expect(page.locator("#contact-name")).toHaveValue("");
  await expect(page.locator("#contact-email")).toHaveValue("");
  await expect(page.locator("#contact-message")).toHaveValue("");
});

test("surfaces a server error when the API fails", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, error: "Something went wrong." }),
    }),
  );

  await page.goto("/contact");
  await page.locator("#contact-name").fill("Ada Lovelace");
  await page.locator("#contact-email").fill("ada@example.com");
  await page
    .locator("#contact-message")
    .fill("I would like to talk about a new project.");

  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status")).toContainText(
    "Something went wrong",
  );
  await expect(page.locator("#contact-name")).toHaveValue("Ada Lovelace");
});
