import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Navratri opens first and Diwali is one keyboard or pointer action away", async ({ page }, info) => {
  await page.goto("/");
  const selector = page.getByRole("group", { name: "Choose a featured festival" });
  const navratri = selector.getByRole("button", { name: "Navratri", exact: true });
  const diwali = selector.getByRole("button", { name: "Diwali", exact: true });
  await expect(navratri).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator(".festival-status")).toHaveText("Upcoming event · Navratri");
  await expect(page.locator("#featured-event img")).toHaveAttribute("src", /navratri-collection/);
  await expect(page.getByRole("link", { name: "Explore gifts from ₹99", exact: true })).toHaveAttribute("href", "/festivals/navratri");
  await diwali.focus();
  await page.keyboard.press("Enter");
  await expect(diwali).toBeFocused();
  await expect(diwali).toHaveAttribute("aria-pressed", "true");
  await expect(navratri).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Light up their Diwali.");
  await expect(page.locator("#featured-event img")).toHaveAttribute("src", /festive-collection/);
  await expect(page.getByRole("link", { name: "Plan your Diwali gifting" })).toHaveAttribute("href", /occasion=Diwali/);
  await navratri.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Small gifts. Big blessings.");
  const frame = await page.locator("#featured-event").boundingBox();
  expect(frame!.height).toBeLessThanOrEqual(info.project.name === "mobile" ? 600 : 520);
  for (const button of [navratri, diwali]) {
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  await page.locator("#featured-event img").evaluate((image) => (image as HTMLImageElement).decode());
  await page.screenshot({ path: `test-results/navratri-first-${info.project.name}.png`, scale: "css" });
  await page.getByRole("link", { name: "Explore gifts from ₹99", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await expect(page.locator(".product-bottom").nth(0)).toContainText("From ₹99");
  await expect(page.locator(".product-bottom").nth(1)).toContainText("From ₹149");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("both Navratri posters, contents, starting prices and quote prefills stay connected", async ({ page }, info) => {
  for (const gift of [
    { slug: "navratri-kanjak-cone-hamper", id: "rc-020", price: 99, contents: 4 },
    { slug: "navratri-kanjak-hamper", id: "rc-021", price: 149, contents: 8 },
  ]) {
    await page.goto(`/products/${gift.slug}`);
    await expect(page.locator(".detail-price")).toContainText(`From ₹${gift.price}`);
    await expect(page.locator(".product-accordions li")).toHaveCount(gift.contents);
    await page.getByRole("button", { name: "Full catalogue sheet" }).click();
    await expect(page.locator(".catalogue-sheet")).toHaveAttribute("src", new RegExp(`${gift.slug}-sheet`));
    await expect(page.locator(".catalogue-sheet")).toHaveAttribute("width", "1122");
    await expect(page.locator(".catalogue-sheet")).toHaveAttribute("height", "1402");
    await page.getByLabel("Quantity for your quote").fill("20");
    await page.getByRole("button", { name: "Request a quote", exact: true }).click();
    await expect(page.getByLabel("Your catalogue selection")).toHaveValue(gift.id);
    await expect(page.getByRole("combobox", { name: "The occasion", exact: true })).toHaveValue("Navratri");
    await expect(page.getByLabel("Number of gifts")).toHaveValue("20");
    await expect(page.getByLabel("Budget per gift (₹)")).toHaveValue(String(gift.price));
    await expect(page.getByLabel("Budget per gift (₹)")).toHaveAttribute("min", "99");
    expect(await page.getByLabel("Budget per gift (₹)").evaluate((input) => (input as HTMLInputElement).checkValidity())).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto("/shop?q=Navratri");
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((image) => { image.loading = "eager"; });
    await Promise.all(Array.from(document.images, (image) => image.decode()));
  });
  await page.screenshot({ path: `test-results/navratri-catalogue-${info.project.name}.png`, fullPage: true, scale: "css" });
  await page.getByRole("button", { name: "Quick look" }).first().click();
  await expect(page.getByRole("dialog").locator(".large-price")).toHaveText("From ₹99");
  const dialog = page.getByRole("dialog");
  if (info.project.name === "desktop") {
    const image = await dialog.locator(".catalogue-image").boundingBox();
    const copy = await dialog.locator(".quick-dialog-content").boundingBox();
    expect(image!.x + image!.width).toBeLessThanOrEqual(copy!.x + 1);
  }
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await dialog.screenshot({ path: `test-results/navratri-quick-look-${info.project.name}.png`, scale: "css" });
  await page.getByRole("dialog").getByRole("link", { name: "Request a quote", exact: true }).click();
  await expect(page.getByLabel("Your catalogue selection")).toHaveValue("rc-020");
  await expect(page.getByLabel("The occasion", { exact: true })).toHaveValue("Navratri");
  await page.goto("/admin");
  await expect(page.locator(".admin-product").filter({ hasText: "rc-020" })).toContainText("From ₹99 starting price");
  await expect(page.locator(".admin-product").filter({ hasText: "rc-021" })).toContainText("From ₹149 starting price");
  await expect(page.locator(".admin-product").filter({ hasText: "rc-017" })).toContainText("₹1,299 catalogue reference");
});

test("Navratri gift-finder budgets carry into the enquiry without promising matched stock", async ({ page }) => {
  for (const budget of [99, 149]) {
    await page.goto("/gift-finder");
    await page.getByRole("button", { name: "Friends & family", exact: true }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: "Navratri", exact: true }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: `Around ₹${budget}`, exact: true }).click();
    await page.getByRole("button", { name: "Create my brief" }).click();
    await expect(page.getByText("These are catalogue ideas, not budget-matched recommendations.", { exact: false })).toBeVisible();
    await page.getByRole("link", { name: "Continue to my gifting enquiry" }).click();
    await expect(page.getByLabel("Budget per gift (₹)")).toHaveValue(String(budget));
    await expect(page.getByLabel("The occasion", { exact: true })).toHaveValue("Navratri");
    await expect(page.getByLabel("Anything else we should know?")).toContainText("Friends & family");
  }
});

test("a 99-rupee Navratri enquiry can be previewed without submitting personal data", async ({ page }) => {
  let writes = 0;
  page.on("request", (request) => { if (request.url().includes("/api/quotes")) writes++; });
  await page.goto("/");
  await page.getByRole("link", { name: "Plan Navratri gifting" }).click();
  await expect(page.getByLabel("Budget per gift (₹)")).toHaveValue("99");
  await expect(page.getByLabel("The occasion", { exact: true })).toHaveValue("Navratri");
  await page.getByLabel("Your catalogue selection").selectOption("rc-020");
  await page.getByLabel("Your full name").fill("Test Buyer");
  await page.getByLabel("Company name").fill("Example Family");
  await page.getByLabel("Work email").fill("test@example.com");
  await page.getByLabel("Mobile number").fill("9876543210");
  await page.getByLabel("Your ideal delivery date").fill("2099-10-01");
  await page.getByLabel("Delivery locations").fill("Bhopal");
  await page.getByRole("checkbox", { name: /I agree to be contacted/ }).check();
  await page.getByRole("button", { name: "Preview my gifting enquiry" }).click();
  await expect(page.getByText("Your enquiry was not sent or saved", { exact: false })).toBeVisible();
  expect(writes).toBe(0);
});
