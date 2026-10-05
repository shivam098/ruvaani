import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("storefront copy, forms and actions keep a readable scale at narrow and wide widths", async ({ page }) => {
  test.setTimeout(60000);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [route, selectors] of [
      ["/", [".premium-hero-copy > p", ".gifting-moments p", ".product-subtitle"]],
      ["/shop", [".product-subtitle", ".catalog-search input"]],
      ["/corporate#enquiry", [".corporate-form input:not([type=checkbox])", ".corporate-form select", ".corporate-form textarea"]],
      ["/contact", [".contact-grid p"]],
    ] as const) {
      await page.goto(route);
      await expect(page.locator("body")).toHaveCSS("font-size", "16px");
      for (const selector of selectors) {
        for (const element of await page.locator(selector).all()) {
          expect(await element.evaluate((node) => parseFloat(getComputedStyle(node).fontSize)), `${route}: ${selector} at ${width}px`).toBeGreaterThanOrEqual(16);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true);
    }
  }
});

test("key controls offer at least 44px touch targets", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/shop");
  for (const selector of [".site-header .icon-button", ".announcement-dismiss", ".product-card .button", ".quick-view", ".pagination button", ".filter-toggle"]) {
    for (const element of await page.locator(selector).all()) {
      if (!(await element.isVisible())) continue;
      const box = await element.boundingBox();
      expect(box?.width, `${selector} width`).toBeGreaterThanOrEqual(44);
      expect(box?.height, `${selector} height`).toBeGreaterThanOrEqual(44);
    }
  }
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  for (const row of await page.locator(".filter-radio, .filter-sidebar .checkbox-label").all()) {
    expect((await row.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
});

test("promotional cards explore real collections without coupon or discount claims", async ({ page }, info) => {
  await page.goto("/");
  const cards = page.getByRole("region", { name: "Gifting occasions" }).getByRole("link");
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toHaveAttribute("href", "/corporate");
  await expect(cards.nth(1)).toHaveAttribute("href", /occasion=Weddings/);
  await expect(cards.nth(2)).toHaveAttribute("href", "/shop?category=Divine%20%26%20festive%20gifts");
  for (const card of await cards.all()) {
    await expect(card.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(card.locator(".discovery-action")).toBeVisible();
    await expect(card).not.toContainText(/coupon|discount|% off|sale ends|claim offer/i);
  }
  await cards.nth(2).click();
  await expect(page.locator(".product-card")).toHaveCount(5);
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((image) => { image.loading = "eager"; });
    await Promise.all(Array.from(document.images, (image) => image.decode()));
  });
  await page.screenshot({ path: `test-results/catalogue-ux-${info.project.name}.png`, fullPage: true, scale: "css" });
});

test("event and gifting process details stay available without crowding the first view", async ({ page }) => {
  await page.goto("/");
  const event = page.locator(".festival-details");
  await expect(event).not.toHaveAttribute("open", "");
  await expect(event.locator("p").first()).not.toBeVisible();
  await event.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(event.locator("p").first()).toContainText("Thoughtful hampers, festive keepsakes");
  await expect(event.locator("p").first()).toBeVisible();
  await expect(event).toContainText("From 10 gifts. Made personal, together.");
  await page.goto("/corporate#enquiry");
  await expect(page.locator(".process-steps")).not.toBeVisible();
  await page.getByText("How your enquiry becomes an order", { exact: true }).click();
  await expect(page.locator(".process-steps")).toBeVisible();
  await expect(page.locator(".process-steps li")).toHaveCount(5);
  await expect(page.locator(".corporate-form .notice")).toContainText("not sent or saved");
  await expect(page.locator(".corporate-form .consent a")).toHaveAttribute("href", "/policies/privacy");
});

test("policy summaries are plain, full details expand and unfinished-policy warnings remain", async ({ page }, info) => {
  for (const policy of ["terms", "privacy", "shipping", "returns"]) {
    await page.goto(`/policies/${policy}`);
    await expect(page.locator(".policy-summary li").first()).toBeVisible();
    await expect(page.locator(".policy-page .notice")).toContainText("not final");
    const details = page.locator(".policy-details details");
    await expect(details).toHaveCount(3);
    for (const item of await details.all()) {
      await expect(item.locator("p")).not.toBeVisible();
      await item.locator("summary").click();
      await expect(item.locator("p")).toBeVisible();
      expect((await item.locator("p").innerText()).length).toBeGreaterThan(50);
    }
  }
  await page.goto("/policies/terms");
  await expect(page.locator(".policy-summary")).toContainText("does not confirm an order");
  await expect(page.locator(".policy-summary")).toContainText("no online checkout");
  await page.locator(".policy-details summary").first().click();
  await page.locator(".policy-details summary").first().focus();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: `test-results/terms-ux-${info.project.name}.png`, fullPage: true, scale: "css" });
});

test("quick look keeps full information, keyboard dismissal and a visible close button", async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/shop");
  const trigger = page.getByRole("button", { name: "Quick look" }).first();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Single Premium Box quick look" });
  await expect(dialog).toBeVisible();
  expect((await dialog.boundingBox())!.height).toBeLessThanOrEqual(608);
  await dialog.getByText("Gift & quote details", { exact: true }).click();
  await expect(dialog.locator("details > p").first()).toBeVisible();
  await expect(dialog).toContainText("Final contents, customisation, taxes and delivery");
  await dialog.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(dialog.getByRole("button", { name: "Close quick look" })).toBeInViewport();
  await page.screenshot({ path: `test-results/quick-look-ux-${info.project.name}.png`, scale: "css" });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("product descriptions are disclosed and saving has a clear reversible state", async ({ page }) => {
  await page.goto("/products/single-premium-box");
  const description = page.locator(".product-accordions details").first();
  await expect(description.locator("p")).not.toBeVisible();
  await description.locator("summary").click();
  await expect(description.locator("p")).toBeVisible();
  const save = page.getByRole("button", { name: "Save gift to wishlist", exact: true });
  await expect(save).toContainText("Save gift");
  await save.click();
  const saved = page.getByRole("button", { name: "Saved gift. Remove from wishlist", exact: true });
  await expect(saved).toHaveAttribute("aria-pressed", "true");
  await saved.click();
  await expect(save).toHaveAttribute("aria-pressed", "false");
});
