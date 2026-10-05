import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { catalogueProducts, categories, filterCatalogue, MINIMUM_QUOTE_QUANTITY, quoteHref } from "../src/lib/catalog-data";
import { quotePrefillSchema, quoteSchema } from "../src/lib/validation";

test("catalogue contains the sixteen supplied options and three additional hampers", () => {
  assert.equal(catalogueProducts.length, 19);
  assert.equal(new Set(catalogueProducts.map((product) => product.id)).size, 19);
  assert.equal(new Set(catalogueProducts.map((product) => product.slug)).size, 19);
  for (const product of catalogueProducts) {
    assert.ok(product.source);
    assert.ok(categories.includes(product.category));
    assert.ok(existsSync(join(process.cwd(), "public", product.image)));
    if (product.sheet) assert.ok(existsSync(join(process.cwd(), "public", product.sheet)));
    assert.ok(!("stock" in product));
    assert.ok(!("price" in product));
    assert.ok(!("compareAtPrice" in product));
  }
});

test("only the three supplied sheets provide catalogue prices and exact contents", () => {
  const priced = catalogueProducts.filter((product) => product.cataloguePrice !== undefined);
  assert.deepEqual(priced.map((product) => [product.name, product.cataloguePrice]), [
    ["Single Premium Box", 129900], ["Corporate Hamper", 159900], ["Executive Corporate Hamper", 219900],
  ]);
  assert.ok(priced.every((product) => product.sheet && product.contents?.length));
  assert.equal(MINIMUM_QUOTE_QUANTITY, 10);
});

test("catalogue filters include unpriced products and do not invent budget matches", () => {
  assert.equal(filterCatalogue(catalogueProducts, { category: "Corporate essentials" }).length, 5);
  assert.equal(filterCatalogue(catalogueProducts, { category: "Divine & festive gifts" }).length, 5);
  assert.equal(filterCatalogue(catalogueProducts, { query: "CASHEWS" })[0]?.id, "rc-012");
  assert.ok(filterCatalogue(catalogueProducts, { personalizable: true }).every((product) => product.personalizable));
  assert.equal(filterCatalogue(catalogueProducts, { query: "not-a-real-gift" }).length, 0);
  const sorted = filterCatalogue(catalogueProducts, { sort: "name" }).map((product) => product.name);
  assert.deepEqual(sorted, [...sorted].sort((a, b) => a.localeCompare(b)));
});

test("quote links retain product, whole-number quantity and brief preferences", () => {
  const url = new URL(quoteHref({ product: "rc-017", quantity: 25, budget: 1299, occasion: "Diwali", recipient: "Clients" }), "https://example.test");
  assert.equal(url.pathname, "/corporate");
  assert.equal(url.hash, "#enquiry");
  assert.equal(url.searchParams.get("product"), "rc-017");
  assert.equal(url.searchParams.get("quantity"), "25");
  assert.ok(quotePrefillSchema.safeParse(Object.fromEntries(url.searchParams)).success);
  for (const quantity of ["9", "10.5", "100001", "", "NaN"]) assert.equal(quotePrefillSchema.safeParse({ quantity }).success, false);
  assert.equal(quotePrefillSchema.safeParse({ product: "rv-001" }).success, false);
  assert.equal(quotePrefillSchema.safeParse({ product: "rc-999" }).success, false);
  assert.equal(quotePrefillSchema.safeParse({ budget: "298" }).success, false);
});

test("quote payload preserves the catalogue selection but rejects injected commercial claims", () => {
  const brief = { name: "Test Buyer", company: "Sample Company", email: "buyer@example.com", phone: "9876543210", occasion: "Diwali", quantity: 10, budget: 299, productId: "rc-017", deliveryDate: "2099-10-01", locations: "Bengaluru", personalization: true, requirements: "A catalogue quote", consent: true };
  assert.equal(quoteSchema.parse(brief).productId, "rc-017");
  for (const extra of [{ price: 1 }, { productName: "Changed name" }, { stock: 100 }]) assert.equal(quoteSchema.safeParse({ ...brief, ...extra }).success, false);
  assert.equal(quoteSchema.safeParse({ ...brief, productId: "rc-999" }).success, false);
  assert.equal(quoteSchema.safeParse({ ...brief, quantity: 9 }).success, false);
  assert.equal(quoteSchema.safeParse({ ...brief, quantity: 10.5 }).success, false);
});
