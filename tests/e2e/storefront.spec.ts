import { test, expect } from "@playwright/test";

test("home is responsive, accessible by landmark, and has working primary navigation", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Some gifts");
  await expect(page.getByRole("link", { name: "Find your perfect gift" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator(".hero-photo")).toBeVisible();
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((img) => { img.loading = "eager"; });
    await Promise.all(Array.from(document.images, (img) => img.decode().catch(() => undefined)));
  });
  await page.screenshot({ path: `test-results/home-${info.project.name}.png`, fullPage: true });
  await page.getByRole("link", { name: "Find your perfect gift" }).click();
  await expect(page).toHaveURL(/\/shop/);
  expect(errors).toEqual([]);
});

test("catalogue search, filters, pagination and quick view work", async ({ page }, info) => {
  await page.goto("/shop");
  await expect(page.locator(".product-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.getByRole("searchbox", { name: "Search gifts", exact: true }).fill("Coffee");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Coffee & Conversations" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search gifts", exact: true }).fill("");
  if (info.project.name === "mobile") await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByRole("radio", { name: "Wellness" }).check();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.locator(".product-visual").hover();
  await page.getByRole("button", { name: "Quick look" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close quick look" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("personalized bag persists and demo checkout never submits real details", async ({ page }) => {
  let writes = 0;
  page.on("request", (request) => { if (request.url().includes("/api/") && request.method() === "POST") writes++; });
  await page.goto("/products/the-signature-hamper");
  await page.getByRole("checkbox", { name: "Add personalization" }).check();
  await page.getByLabel("Their name", { exact: true }).fill("Ananya");
  await page.getByLabel("Your little note").fill("Thank you for everything.");
  await page.getByRole("button", { name: "Preview your message card" }).click();
  await expect(page.locator(".artwork-personalization")).toContainText("Ananya");
  await page.getByRole("button", { name: "Add to my bag" }).click();
  await page.goto("/cart");
  await expect(page.locator(".bag-item")).toContainText("Ananya");
  await expect(page.locator(".summary-total")).toContainText("₹2,598");
  await page.reload();
  await expect(page.locator(".bag-item")).toHaveCount(1);
  await page.getByRole("link", { name: "Preview checkout" }).click();
  await page.getByLabel("Recipient's full name").fill("Test Person");
  await page.getByLabel("Email address", { exact: true }).fill("test@example.com");
  await page.getByLabel("Mobile number").fill("9876543210");
  await page.getByLabel("Pincode", { exact: true }).fill("560001");
  await page.getByLabel("Delivery address").fill("42 Sample Street");
  await page.getByLabel("City", { exact: true }).fill("Bengaluru");
  await page.getByLabel("State", { exact: true }).fill("Karnataka");
  await page.getByRole("button", { name: "Review my thoughtful details" }).click();
  await page.getByRole("button", { name: "Complete demo preview" }).click();
  await expect(page.getByRole("heading", { name: "A lovely little preview." })).toBeVisible();
  await expect(page.getByText("No order was placed", { exact: false })).toBeVisible();
  expect(writes).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem("ruvaani-bag-v1"))).not.toContain("test@example.com");
});

test("wishlist saves and removes gifts", async ({ page }) => {
  await page.goto("/shop");
  await page.getByRole("button", { name: "Save The Signature Hamper to wishlist", exact: true }).click();
  await page.goto("/wishlist");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Remove The Signature Hamper from wishlist", exact: true }).click();
  await expect(page.getByRole("heading", { name: "A little room for your favorites." })).toBeVisible();
});

test("guided finder honors every preference and does not invent a match", async ({ page }) => {
  await page.goto("/gift-finder");
  await page.getByRole("button", { name: "Clients", exact: true }).click();
  await page.getByRole("button", { name: "A little further" }).click();
  await page.getByRole("button", { name: "Diwali", exact: true }).click();
  await page.getByRole("button", { name: "A little further" }).click();
  await page.getByRole("button", { name: "Up to ₹1,000" }).click();
  await page.getByRole("button", { name: "Find my thoughtful" }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Sweet Little Things" })).toBeVisible();
});

test("corporate enquiry preview validates the brief without saving it", async ({ page }) => {
  let writes = 0;
  page.on("request", (request) => { if (request.url().includes("/api/quotes")) writes++; });
  await page.goto("/corporate#enquiry");
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
  expect(writes).toBe(0);
});

test("admin demo is read-only and real mutations are blocked", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page.getByRole("button", { name: "Save", exact: true }).first()).toBeDisabled();
  await page.getByRole("tab", { name: "orders", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No orders yet." })).toBeVisible();
  const response = await request.post("/api/checkout", { data: {}, headers: { origin: "http://localhost:3100" } });
  expect(response.status()).toBe(503);
  const crossOrigin = await request.post("/api/quotes", { data: {}, headers: { origin: "https://not-ruvaani.example" } });
  expect(crossOrigin.status()).toBe(403);
  const register = await request.post("/api/auth/register", { data: {}, headers: { origin: "http://localhost:3100" } });
  expect(register.status()).toBe(503);
});

test("search dialog, error routes and mobile navigation are usable", async ({ page }, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search gifts", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search the gift catalogue" }).fill("coffee");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/q=coffee/);
  await expect(page.locator(".product-card")).toHaveCount(1);
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Our story" }).click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeVisible();
  }
  await page.goto("/products/not-a-gift");
  await expect(page.getByRole("heading", { name: "A gift of a fresh start." })).toBeVisible();
});

test("secondary routes remain within the viewport", async ({ page }) => {
  for (const route of ["/about", "/contact", "/faq", "/account", "/gift-finder", "/corporate", "/policies/privacy"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true);
  }
});
