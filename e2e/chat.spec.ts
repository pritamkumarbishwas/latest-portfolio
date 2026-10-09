import { expect, test } from "@playwright/test";

test.describe("chat assistant", () => {
  test("launcher opens an accessible dialog; Esc closes and restores focus", async ({
    page,
  }) => {
    await page.goto("/");

    const launcher = page.getByRole("button", {
      name: "Chat with Pritam's AI assistant",
    });
    await expect(launcher).toBeVisible();
    await expect(launcher).toHaveAttribute("aria-haspopup", "dialog");
    await expect(launcher).toHaveAttribute("aria-expanded", "false");

    await launcher.click();

    const dialog = page.getByRole("dialog", {
      name: "Pritam's Portfolio Assistant",
    });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog.getByText("AI assistant. Answers may be imperfect.")).toBeVisible();
    await expect(
      dialog.getByRole("group", { name: "Suggested questions" }),
    ).toBeVisible();
    await expect(dialog.locator("#chat-input-counter")).toHaveText("0/500");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeFocused();
  });

  test("Enter sends a message; Shift+Enter inserts a newline", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Chat with Pritam's AI assistant" })
      .click();

    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("textbox", { name: "Message" });
    const log = dialog.getByRole("log");

    await input.pressSequentially("Shift+Enter check");
    await input.press("Shift+Enter");
    await expect(input).toHaveValue("Shift+Enter check\n");
    await expect(log.getByText("Shift+Enter check")).toHaveCount(0);

    await input.fill("What is Pritam's current role?");
    await input.press("Enter");
    await expect(
      log.getByText("What is Pritam's current role?"),
    ).toBeVisible();
    await expect(input).toHaveValue("");
  });

  test("suggestion chip sends its question", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Chat with Pritam's AI assistant" })
      .click();

    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("button", { name: "What is Pritam's current role and experience?" })
      .click();
    await expect(
      dialog.getByRole("log").getByText("What is Pritam's current role and experience?"),
    ).toBeVisible();
  });
});
