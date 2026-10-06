import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("one discovery module switches modes and keeps two columns on phones", async ({ page }, info) => {
  await page.goto("/");
  const discovery = page.locator(".collection-discovery");
  await expect(discovery).toHaveCount(1);
  await expect(discovery.locator(".discovery-card")).toHaveCount(8);
  if (info.project.name === "mobile") {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await discovery.locator(".discovery-grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await discovery.getByRole("button", { name: "By festival" }).click();
  await expect(discovery.locator(".discovery-card")).toHaveCount(7);
  await discovery.getByRole("link", { name: /Navratri/ }).click();
  await expect(page).toHaveURL(/\/festivals\/navratri/);
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.goto("/");
  await expect(page.locator(".featured-edit .product-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Diwali", exact: true }).click();
  await expect(page.locator(".featured-edit .product-card")).toHaveCount(3);
  await expect(page.locator(".featured-edit")).not.toContainText("Kanjak");
});

test("navigation menus work with keyboard, outside click and Escape", async ({ page }, info) => {
  await page.goto("/");
  const mobile = info.project.name === "mobile";
  if (mobile) await page.getByRole("button", { name: "Open menu" }).click();
  const nav = page.locator(mobile ? ".studio-mobile-nav" : ".studio-nav");
  const group = nav.locator("details").first();
  await group.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(group).toHaveAttribute("open", "");
  await expect(group.getByRole("link", { name: /Gift Hampers/ })).toBeVisible();
  expect((await new AxeBuilder({ page }).include(".site-header").withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  if (mobile) {
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await page.getByRole("button", { name: "Open menu" }).click();
  } else await expect(group.locator("summary")).toBeFocused();
  await group.locator("summary").click();
  await group.getByRole("link", { name: "Wellness", exact: false }).click();
  await expect(page).toHaveURL(/\/collections\/wellness/);
  if (mobile) await expect(page.locator(".studio-mobile-nav")).toHaveCount(0);
  else await expect(group).not.toHaveAttribute("open", "");
  if (mobile) await page.getByRole("button", { name: "Open menu" }).click();
  await group.locator("summary").click();
  await page.mouse.click(2, page.viewportSize()!.height - 2);
  if (mobile) await expect(page.locator(".studio-mobile-nav")).toHaveCount(0);
  else await expect(group).not.toHaveAttribute("open", "");
});

test("filter combinations remain scoped and enquiry-only categories preserve their brief", async ({ page }, info) => {
  await page.goto("/shop");
  if (info.project.name === "mobile") await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByRole("combobox", { name: "Indicative price", exact: true }).selectOption("under-500");
  await expect(page.locator(".product-card")).toHaveCount(2);
  await expect(page.locator(".catalog-results > .notice")).toContainText("Starting prices are not fixed quotes");
  await page.getByRole("combobox", { name: "Recipient", exact: true }).selectOption("Employees");
  await expect(page.locator(".product-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("combobox", { name: "Indicative price", exact: true }).selectOption("on-request");
  await expect(page.getByText("16 thoughtful finds")).toBeVisible();
  await page.goto("/festivals/navratri?budget=1000-2500");
  await expect(page.locator(".product-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.goto("/collections/wellness");
  await expect(page.locator(".empty-state")).toContainText("not a stock or fulfilment promise");
  await page.locator(".empty-state").getByRole("link", { name: "Discuss your gifting brief" }).click();
  await expect(page.getByLabel("Anything else we should know?")).toContainText("Wellness");
  await page.goto("/occasions/weddings");
  await page.locator(".edit-enquiry").getByRole("link").click();
  await expect(page.getByLabel("The occasion", { exact: true })).toHaveValue("Weddings");
  await expect(page.getByLabel("Anything else we should know?")).toContainText("Wedding guests");
});

test("catalogue editions have actual PDF downloads, correct selections and invalid-route handling", async ({ page, request }, info) => {
  await page.goto("/catalogue");
  await expect(page.locator(".catalogue-edition")).toHaveCount(7);
  for (const slug of ["collection", "navratri", "diwali", "corporate", "wedding", "festive", "premium"]) {
    const response = await request.get(`/catalogues/ruvaani-${slug}.pdf`);
    expect(response.status()).toBe(200);
    expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
  }
  const navratri = page.locator(".catalogue-edition").filter({ has: page.getByRole("heading", { name: "The Navratri Special" }) });
  const downloaded = page.waitForEvent("download");
  await navratri.getByRole("link", { name: "Download PDF" }).click();
  expect((await downloaded).suggestedFilename()).toBe("ruvaani-navratri.pdf");
  await navratri.getByRole("link", { name: "View Catalogue", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.screenshot({ path: `test-results/blueprint-catalogue-${info.project.name}.png`, fullPage: true, scale: "css" });
  for (const route of ["/catalogue/unknown", "/collections/unknown", "/festivals/unknown", "/occasions/unknown"]) {
    const response = await page.goto(route);
    expect([200, 404]).toContain(response?.status());
    await expect(page.getByRole("heading", { name: "A gift of a fresh start." })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
    await expect(page.locator(".product-card")).toHaveCount(0);
  }
});

test("collection intent survives quick looks and the product-detail enquiry", async ({ page }) => {
  await page.goto("/occasions/weddings");
  await page.locator(".product-card").first().getByRole("button", { name: "Quick look" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Request a quote", exact: true }).click();
  await expect(page.getByLabel("The occasion", { exact: true })).toHaveValue("Weddings");
  await expect(page.getByLabel("Anything else we should know?")).toContainText("Wedding Gifting");
  await expect(page.getByLabel("Anything else we should know?")).toContainText("Wedding guests");
  await page.goto("/occasions/clients");
  await page.locator(".product-card h3 a").first().click();
  await expect(page).toHaveURL(/collection=occasion%3Aclients/);
  await page.getByLabel("Quantity for your quote").fill("25");
  await page.getByRole("button", { name: "Request a quote", exact: true }).click();
  await expect(page.getByLabel("The occasion", { exact: true })).toHaveValue("Client gifting");
  await expect(page.getByLabel("Number of gifts")).toHaveValue("25");
  await expect(page.getByLabel("Anything else we should know?")).toContainText("For Clients");
  await page.goto("/products/single-premium-box?collection=invalid");
  await expect(page.locator(".product-page > [role=alert]")).toContainText("preferences in this link were invalid");
});

test("mobile conversion actions remain accessible without obscuring enquiry or footer controls", async ({ page }, info) => {
  await page.goto("/");
  const actions = page.getByRole("navigation", { name: "Quick gifting actions" });
  if (info.project.name === "desktop") { await expect(actions).not.toBeVisible(); return; }
  await expect(actions).toBeVisible();
  for (const link of await actions.getByRole("link").all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  const lastFooterLink = page.locator(".site-footer a").last();
  expect((await lastFooterLink.boundingBox())!.y + (await lastFooterLink.boundingBox())!.height).toBeLessThanOrEqual((await actions.boundingBox())!.y);
  await actions.getByRole("link", { name: "Catalogue", exact: true }).click();
  await expect(page).toHaveURL(/\/catalogue$/);
  await actions.getByRole("link", { name: /curate your gifting/ }).click();
  await expect(page).toHaveURL(/\/corporate#enquiry/);
  await expect(actions).toHaveCount(0);
});

test("demo interactions never transmit telemetry and insights disclose disabled recording", async ({ page, request }) => {
  let writes = 0;
  page.on("request", (request) => { if (request.url().endsWith("/api/analytics")) writes++; });
  await page.goto("/");
  await page.locator(".collection-discovery").getByRole("link", { name: /Gift Hampers/ }).click();
  await page.goto("/catalogue");
  await page.locator(".catalogue-edition").first().getByRole("link", { name: "View Catalogue", exact: true }).click();
  expect(writes).toBe(0);
  expect((await request.post("/api/analytics", { data: { event: "catalogue_view", target: "hub" }, headers: { origin: "http://localhost:3100" } })).status()).toBe(503);
  await page.goto("/admin");
  await page.getByRole("tab", { name: "insights" }).click();
  await expect(page.locator(".analytics-panel")).toContainText("Interaction recording is disabled");
  await expect(page.locator(".analytics-panel")).toContainText("0 saved enquiries");
});
