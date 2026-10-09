import { expect, test } from "@playwright/test";

const SSE_HEADERS = { "content-type": "text/event-stream" };

function uiStream(parts: unknown[]): string {
  return (
    parts.map((part) => `data: ${JSON.stringify(part)}\n\n`).join("") +
    "data: [DONE]\n\n"
  );
}

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

  test("429 rate-limit response shows a friendly message, not raw JSON", async ({
    page,
  }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 429,
        headers: {
          "content-type": "application/json",
          "Retry-After": "60",
        },
        body: JSON.stringify({
          ok: false,
          error:
            "That’s a lot of questions in a row — please wait a moment and try again.",
        }),
      }),
    );

    await page.goto("/");
    await page
      .getByRole("button", { name: "Chat with Pritam's AI assistant" })
      .click();

    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("textbox", { name: "Message" });
    await input.fill("Hello");
    await input.press("Enter");

    const alert = dialog.getByRole("alert");
    await expect(alert).toContainText(
      "That’s a lot of questions in a row — please wait a moment and try again.",
    );
    await expect(alert).not.toContainText('"ok"');
  });

  test("empty state offers resume download; answers get follow-up chips", async ({
    page,
  }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 200,
        headers: SSE_HEADERS,
        body: uiStream([
          { type: "start" },
          { type: "start-step" },
          { type: "text-start", id: "t1" },
          {
            type: "text-delta",
            id: "t1",
            delta: "Pritam has 3 years of experience building Next.js products.",
          },
          { type: "text-end", id: "t1" },
          { type: "finish-step" },
          { type: "finish" },
        ]),
      }),
    );

    await page.goto("/");
    await page
      .getByRole("button", { name: "Chat with Pritam's AI assistant" })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("link", { name: "Download resume" }),
    ).toHaveAttribute("href", "/resume.pdf");

    const input = dialog.getByRole("textbox", { name: "Message" });
    await input.fill("How much experience does Pritam have?");
    await input.press("Enter");

    await expect(
      dialog.getByRole("log").getByText("Pritam has 3 years"),
    ).toBeVisible();
    await expect(
      dialog.getByRole("group", { name: "Suggested questions" }),
    ).toHaveCount(0);

    const followUps = dialog.getByRole("group", {
      name: "Follow-up suggestions",
    });
    await expect(followUps).toBeVisible();
    await expect(followUps).toContainText("What is his current role?");
  });

  test("showProject tool output renders a project card", async ({ page }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 200,
        headers: SSE_HEADERS,
        body: uiStream([
          { type: "start" },
          { type: "start-step" },
          {
            type: "tool-input-available",
            toolCallId: "call_1",
            toolName: "showProject",
            input: { slug: "gurukul" },
          },
          {
            type: "tool-output-available",
            toolCallId: "call_1",
            output: {
              slug: "gurukul",
              title: "Gurukul",
              summary: "Full-stack e-learning platform covering course discovery and more.",
              cover: "/work/gurukul.svg",
              period: "Feb 2025 – Present",
              liveUrl: "https://gurukul.definedgesecurities.com/",
              techStack: ["Next.js", "React.js", "MySQL"],
            },
          },
          { type: "finish-step" },
          { type: "start-step" },
          { type: "text-start", id: "t1" },
          { type: "text-delta", id: "t1", delta: "Here is the Gurukul project." },
          { type: "text-end", id: "t1" },
          { type: "finish-step" },
          { type: "finish" },
        ]),
      }),
    );

    await page.goto("/");
    await page
      .getByRole("button", { name: "Chat with Pritam's AI assistant" })
      .click();

    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("textbox", { name: "Message" });
    await input.fill("Show me the Gurukul project");
    await input.press("Enter");

    const card = dialog.getByRole("article", { name: "Project card: Gurukul" });
    await expect(card).toBeVisible();
    await expect(card).toContainText("Feb 2025 – Present");
    await expect(card).toContainText("MySQL");
    await expect(
      card.getByRole("link", { name: /Visit live site/ }),
    ).toHaveAttribute("href", "https://gurukul.definedgesecurities.com/");
    await expect(card.locator("img")).toBeVisible();
  });

  test("sendMessageToPritam renders a confirm card; Send posts to /api/contact", async ({
    page,
  }) => {
    let posted: Record<string, unknown> | null = null;
    await page.route("**/api/contact", async (route) => {
      posted = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 200,
        headers: SSE_HEADERS,
        body: uiStream([
          { type: "start" },
          { type: "start-step" },
          {
            type: "tool-input-available",
            toolCallId: "call_9",
            toolName: "sendMessageToPritam",
            input: {
              name: "Ada Lovelace",
              email: "ada@example.com",
              message: "Hi Pritam, I would love to discuss a frontend role.",
              confirmed: true,
            },
          },
          {
            type: "tool-output-available",
            toolCallId: "call_9",
            output: {
              status: "awaiting-confirmation",
              name: "Ada Lovelace",
              email: "ada@example.com",
              message: "Hi Pritam, I would love to discuss a frontend role.",
            },
          },
          { type: "finish-step" },
          { type: "finish" },
        ]),
      }),
    );

    await page.goto("/");
    await page
      .getByRole("button", { name: "Chat with Pritam's AI assistant" })
      .click();

    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("textbox", { name: "Message" });
    await input.fill("Send Pritam a message");
    await input.press("Enter");

    const card = dialog.getByRole("region", {
      name: /awaiting your confirmation/,
    });
    await expect(card).toBeVisible();
    await expect(card).toContainText("Ada Lovelace");
    await expect(card).toContainText("ada@example.com");
    await expect(card).toContainText("Nothing is sent until you press Send.");

    await card.getByRole("button", { name: "Send message" }).click();

    await expect(dialog.getByRole("status")).toContainText("Sent to Pritam");
    expect(posted).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hi Pritam, I would love to discuss a frontend role.",
      website: "",
    });
  });
  test("Stop, Retry after a failed request, and Clear chat", async ({ page }) => {
    let requestCount = 0;
    await page.route("**/api/chat", async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Simulated error" }),
        });
      } else {
        await new Promise((r) => setTimeout(r, 1000));
        await route.fulfill({
          status: 200,
          headers: SSE_HEADERS,
          body: uiStream([
            { type: "start" },
            { type: "text-start", id: "t1" },
            { type: "text-delta", id: "t1", delta: "Successful reply" },
            { type: "text-end", id: "t1" },
            { type: "finish" },
          ]),
        });
      }
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Chat with Pritam's AI assistant" }).click();
    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("textbox", { name: "Message" });
    
    await input.fill("Fail first");
    await input.press("Enter");

    const alert = dialog.getByRole("alert");
    await expect(alert).toContainText("Simulated error");
    
    const retry = dialog.getByRole("button", { name: /Retry/i });
    await retry.click();

    const stop = dialog.getByRole("button", { name: "Stop response" });
    await expect(stop).toBeVisible();
    await stop.click();

    const clear = dialog.getByRole("button", { name: "Clear conversation" });
    await clear.click();
    await expect(dialog.getByRole("log")).not.toContainText("Fail first");
  });

  test("chat state survives a page navigation within the session", async ({ page }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 200,
        headers: SSE_HEADERS,
        body: uiStream([
          { type: "start" },
          { type: "text-start", id: "t1" },
          { type: "text-delta", id: "t1", delta: "I am an AI." },
          { type: "text-end", id: "t1" },
          { type: "finish" },
        ]),
      }),
    );

    await page.goto("/");
    await page.getByRole("button", { name: "Chat with Pritam's AI assistant" }).click();
    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("textbox", { name: "Message" });
    await input.fill("Who are you?");
    await input.press("Enter");

    await expect(dialog.getByRole("log").getByText("I am an AI.")).toBeVisible();

    await page.goto("/#projects");
    await page.getByRole("button", { name: "Chat with Pritam's AI assistant" }).click();

    const newDialog = page.getByRole("dialog");
    await expect(newDialog.getByRole("log").getByText("Who are you?")).toBeVisible();
    await expect(newDialog.getByRole("log").getByText("I am an AI.")).toBeVisible();
  });
}); 
 