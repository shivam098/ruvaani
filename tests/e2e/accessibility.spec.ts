import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("essential pages pass automated WCAG A/AA checks", async ({ page }) => {
  test.setTimeout(180000);
  const failures = [];
  for (const route of ["/", "/shop", "/products/single-premium-box", "/corporate", "/gift-finder", "/account", "/contact", "/policies/terms", "/collections", "/collections/wellness", "/festivals/diwali", "/occasions/weddings", "/catalogue", "/catalogue/navratri"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    for (const violation of results.violations) {
      failures.push({ route, rule: violation.id, nodes: violation.nodes.map((node) => ({ selector: node.target.join(" "), detail: node.failureSummary })) });
    }
    if (route === "/") {
      await page.getByRole("button", { name: "Search gifts", exact: true }).click();
      const modal = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      for (const violation of modal.violations) failures.push({ route: "search dialog", rule: violation.id, nodes: violation.nodes.map((node) => ({ selector: node.target.join(" "), detail: node.failureSummary })) });
    }
  }
  expect(failures).toEqual([]);
});
