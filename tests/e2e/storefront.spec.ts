import { test, expect } from "@playwright/test";

test("premium hero uses supplied branding and remains responsive", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Gifts that create");
  await expect(page.locator(".site-header .brand-monogram")).toBeVisible();
  await expect(page.locator(".site-header .brand-wordmark")).toBeVisible();
  for (const area of [".site-header", ".site-footer"]) {
    const logo = page.locator(`${area} .brand-logo`);
    await expect(logo).toHaveAccessibleName("RUVAANI Creations & Packaging home");
    await expect(logo.locator(".brand-wordmark")).toHaveAttribute("alt", "RUVAANI");
    await expect(logo.locator(".brand-wordmark")).toHaveAttribute("src", /ruvaani-wordmark/);
    await expect(logo.locator(".brand-tagline")).toHaveText("Creations & Packaging");
    const monogram = await logo.locator(".brand-monogram").boundingBox();
    const wordmark = await logo.locator(".brand-wordmark").boundingBox();
    const tagline = await logo.locator(".brand-tagline").boundingBox();
    expect(monogram).not.toBeNull();
    expect(wordmark).not.toBeNull();
    expect(tagline).not.toBeNull();
    expect(monogram!.x + monogram!.width).toBeLessThan(wordmark!.x);
    expect(tagline!.y).toBeGreaterThanOrEqual(wordmark!.y + wordmark!.height);
  }
  await expect(page.locator(".hero-photo")).toBeVisible();
  expect(await page.locator(".button-primary").first().evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(6, 76, 60)");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((image) => { image.loading = "eager"; });
    await Promise.all(Array.from(document.images, (image) => image.decode()));
  });
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".site-footer")).toBeInViewport();
  await page.locator(".site-footer .brand-logo").screenshot({ path: `test-results/logo-footer-${info.project.name}.png`, scale: "css" });
  await page.screenshot({ path: `test-results/footer-${info.project.name}.png`, scale: "css" });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.locator(".site-header .brand-logo").screenshot({ path: `test-results/logo-header-${info.project.name}.png`, scale: "css" });
  await page.screenshot({ path: `test-results/home-${info.project.name}.png`, fullPage: true, scale: "css" });
  await page.getByRole("link", { name: "Explore the collection", exact: true }).first().click();
  await expect(page).toHaveURL(/\/shop/);
  expect(errors).toEqual([]);
});

test("corrected logo stays clear of the menu and actions on narrow phones", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const header = page.locator(".site-header");
  await expect(header.locator(".brand-tagline")).toBeVisible();
  const menu = await header.getByRole("button", { name: "Open menu" }).boundingBox();
  const logo = await header.locator(".brand-logo").boundingBox();
  const actions = await header.locator(".header-actions").boundingBox();
  expect(menu).not.toBeNull();
  expect(logo).not.toBeNull();
  expect(actions).not.toBeNull();
  expect(menu!.x + menu!.width).toBeLessThanOrEqual(logo!.x);
  expect(logo!.x + logo!.width).toBeLessThanOrEqual(actions!.x);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("catalogue filters, search, pagination and quick view use supplied entries", async ({ page }, info) => {
  await page.goto("/shop");
  await expect(page.locator(".product-card")).toHaveCount(6);
  await expect(page.getByText("19 thoughtful finds")).toBeVisible();
  await page.getByRole("button", { name: "Page 4", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("searchbox", { name: "Search gifts", exact: true }).fill("cashews");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Roasted Cashews" })).toBeVisible();
  await expect(page.locator(".product-bottom")).toContainText("Price on request");
  await expect(page.getByRole("slider")).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Search gifts", exact: true }).fill("");
  if (info.project.name === "mobile") await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByRole("radio", { name: "Divine & festive gifts" }).check();
  await expect(page.locator(".product-card")).toHaveCount(5);
  await page.locator(".product-visual").first().hover();
  await page.getByRole("button", { name: "Quick look" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Price on request");
  await expect(page.getByRole("dialog").getByRole("link", { name: "Request a quote", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close quick look" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("hamper details show supplied price, contents and full sheet; quantity carries into quote", async ({ page }) => {
  await page.goto("/products/single-premium-box");
  await expect(page.locator(".detail-price")).toContainText("₹1,299");
  await expect(page.locator(".product-accordions")).toContainText("Premium scented candle jars (2)");
  await expect(page.getByRole("button", { name: /Add to.*bag/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Full catalogue sheet" }).click();
  await expect(page.locator(".catalogue-sheet")).toBeVisible();
  await page.getByLabel("Quantity for your quote").fill("25");
  await page.getByRole("button", { name: "Request a quote", exact: true }).click();
  await expect(page).toHaveURL(/\/corporate\?product=rc-017&quantity=25#enquiry/);
  await expect(page.getByLabel("Your catalogue selection")).toHaveValue("rc-017");
  await expect(page.getByLabel("How many thoughtful gifts?")).toHaveValue("25");
  await expect(page.getByLabel("Budget per gift (₹)")).toHaveValue("1299");
});

test("wishlist saves and removes catalogue gifts without retaining contact information", async ({ page }) => {
  await page.goto("/shop");
  await page.getByRole("button", { name: "Save Single Premium Box to wishlist", exact: true }).click();
  await page.goto("/wishlist");
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem("ruvaani-wishlist-v1"))).toBe('{"wishlist":["rc-017"]}');
  await page.getByRole("button", { name: "Remove Single Premium Box from wishlist", exact: true }).click();
  await expect(page.getByRole("heading", { name: "A little room for your favorites." })).toBeVisible();
});

test("gift finder carries preferences without claiming budget-matched stock", async ({ page }) => {
  await page.goto("/gift-finder");
  await page.getByRole("button", { name: "Clients", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Diwali", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Around ₹299" }).click();
  await page.getByRole("button", { name: "Create my brief" }).click();
  await expect(page.getByText("These are catalogue ideas, not budget-matched recommendations.", { exact: false })).toBeVisible();
  await page.getByRole("link", { name: "Continue to my gifting enquiry" }).click();
  await expect(page.getByLabel("Budget per gift (₹)")).toHaveValue("299");
  await expect(page.getByRole("combobox", { name: "The occasion", exact: true })).toHaveValue("Diwali");
  await expect(page.getByLabel("Anything else we should know?")).toContainText("Clients");
});

test("corporate enquiry preview does not send or save personal details", async ({ page }) => {
  let writes = 0;
  page.on("request", (request) => { if (request.url().includes("/api/quotes")) writes++; });
  await page.goto("/corporate?product=rc-019#enquiry");
  await expect(page.getByLabel("Budget per gift (₹)")).toHaveValue("2199");
  await page.getByLabel("Your full name").fill("Test Person");
  await page.getByLabel("Company name").fill("Example Company");
  await page.getByLabel("Work email").fill("test@example.com");
  await page.getByLabel("Mobile number").fill("9876543210");
  await page.getByRole("combobox", { name: "The occasion", exact: true }).selectOption("Diwali");
  await page.getByLabel("Your ideal delivery date").fill("2099-10-01");
  await page.getByLabel("Where are they headed?").fill("Bengaluru");
  await page.getByRole("checkbox", { name: /I agree to be contacted/ }).check();
  await page.getByRole("button", { name: "Preview my gifting enquiry" }).click();
  await expect(page.getByRole("heading", { name: "Your thoughtful brief looks lovely." })).toBeVisible();
  await expect(page.getByText("Your enquiry was not sent or saved", { exact: false })).toBeVisible();
  expect(writes).toBe(0);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain("test@example.com");
});

test("stale checkout URLs and direct API calls cannot start purchases", async ({ page, request }) => {
  for (const route of ["/cart", "/checkout"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/corporate#enquiry/);
  }
  const checkout = await request.post("/api/checkout", { data: { items: [{ productId: "rc-017", price: 1 }] }, headers: { origin: "http://localhost:3100" } });
  expect(checkout.status()).toBe(410);
  expect((await checkout.json()).error).toContain("quote-only");
  const crossOrigin = await request.post("/api/quotes", { data: {}, headers: { origin: "https://not-ruvaani.example" } });
  expect(crossOrigin.status()).toBe(403);
  await page.goto("/admin");
  await expect(page.getByText("The public catalogue is read-only here", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Available stock")).toHaveCount(0);
});

test("invalid quote presets are explained rather than silently accepted", async ({ page }) => {
  await page.goto("/corporate?product=rc-999&quantity=1#enquiry");
  await expect(page.locator(".corporate-form").getByRole("alert")).toContainText("Some details in this enquiry link were invalid");
  await expect(page.getByLabel("Your catalogue selection")).toHaveValue("");
  await expect(page.getByLabel("How many thoughtful gifts?")).toHaveValue("10");
});

test("header search, mobile navigation and unavailable product routes remain usable", async ({ page }, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search gifts", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search the gift catalogue" }).fill("cashews");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/q=cashews/);
  await expect(page.locator(".product-card")).toHaveCount(1);
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Our story" }).click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeVisible();
  }
  await page.goto("/products/the-signature-hamper");
  await expect(page.getByRole("heading", { name: "A gift of a fresh start." })).toBeVisible();
});

test("all supplied contacts are present and pages remain within the viewport", async ({ page }) => {
  await page.goto("/contact");
  for (const phone of ["9039580202", "9038580202", "8287588545"]) await expect(page.locator(`main a[href="tel:+91${phone}"]`)).toBeVisible();
  for (const route of ["/about", "/contact", "/faq", "/account", "/gift-finder", "/corporate", "/policies/privacy", "/products/customised-insulated-temperature-water-bottle"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
  }
});
