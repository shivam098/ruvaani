import assert from "node:assert/strict";
import { test } from "node:test";
import { catalogueProducts } from "../src/lib/catalog-data";
import { collections, collectionKey, collectionHref, collectionProducts, collectionQuoteHref, filterDiscovery, catalogueEditions, editionProducts, giftCategories } from "../src/lib/discovery";
import { interactionSchema } from "../src/lib/interaction-data";
import { quotePrefillSchema } from "../src/lib/validation";

test("all discovery edits reference distinct real products and unique routes", () => {
  assert.equal(new Set(collections.map(collectionKey)).size, collections.length);
  assert.equal(new Set(collections.map(collectionHref)).size, collections.length);
  for (const collection of collections) {
    assert.equal(new Set(collection.productIds).size, collection.productIds.length);
    assert.equal(collectionProducts(collection).length, collection.productIds.length, collectionKey(collection));
    const prefill = Object.fromEntries(new URL(collectionQuoteHref(collection), "http://localhost").searchParams);
    assert.equal(quotePrefillSchema.parse(prefill).collection, collectionKey(collection));
  }
  assert.equal(giftCategories.length, 8);
  for (const slug of ["wellness", "tech-utility"]) assert.deepEqual(giftCategories.find((item) => item.slug === slug)?.productIds, []);
});

test("price filters preserve starting prices and never infer prices for unpriced gifts", () => {
  const under500 = filterDiscovery(catalogueProducts, { budget: "under-500" });
  assert.deepEqual(under500.map((item) => item.id), ["rc-020", "rc-021"]);
  assert.ok(under500.every((item) => item.priceType === "starting"));
  assert.equal(filterDiscovery(catalogueProducts, { budget: "on-request" }).length, 16);
  assert.equal(filterDiscovery(catalogueProducts, { budget: "1000-2500" }).length, 3);
  assert.equal(filterDiscovery(catalogueProducts, { budget: "premium" }).length, 0);
  assert.equal(filterDiscovery(catalogueProducts, { budget: "made-up" }).length, 0);
  const template = catalogueProducts[0];
  for (const [price, band] of [[49999, "under-500"], [50000, "500-1000"], [100000, "500-1000"], [100001, "1000-2500"], [250000, "1000-2500"], [250001, "premium"]] as const) {
    assert.equal(filterDiscovery([{ ...template, cataloguePrice: price }], { budget: band }).length, 1, `${price} in ${band}`);
  }
});

test("filters intersect route scope, recipient and collection without fallback inventory", () => {
  assert.equal(filterDiscovery(catalogueProducts, { festival: "festival:navratri", budget: "under-500" }).length, 2);
  assert.equal(filterDiscovery(catalogueProducts, { collection: "category:wellness" }).length, 0);
  assert.equal(filterDiscovery(catalogueProducts, { collection: "category:unknown" }).length, 0);
  assert.equal(filterDiscovery(catalogueProducts, { recipient: "Unknown" }).length, 0);
  assert.equal(filterDiscovery(catalogueProducts, { festival: "festival:navratri", recipient: "Employees" }).length, 0);
  assert.equal(filterDiscovery(catalogueProducts, { festival: "festival:navratri", recipient: "Personal" }).length, 2);
});

test("catalogue editions retain all and only their sourced selections", () => {
  assert.equal(catalogueEditions.length, 7);
  assert.equal(editionProducts("collection").length, 21);
  assert.equal(editionProducts("navratri").length, 2);
  assert.equal(editionProducts("premium").length, 3);
  assert.deepEqual(editionProducts("unknown"), []);
  for (const edition of catalogueEditions) {
    const products = editionProducts(edition.slug);
    assert.ok(products.length);
    assert.equal(new Set(products.map((product) => product.id)).size, products.length);
  }
});

test("analytics rejects unbounded destinations and any additional contact or URL data", () => {
  for (const body of [
    { event: "category_click", target: "wellness" }, { event: "catalogue_view", target: "hub" },
    { event: "catalogue_download", target: "diwali" }, { event: "enquiry_start", target: "mobile" },
  ]) assert.equal(interactionSchema.safeParse(body).success, true);
  for (const body of [
    { event: "category_click", target: "diwali" },
    { event: "catalogue_download", target: "hub" },
    { event: "unknown", target: "diwali" },
    { event: "enquiry_start", target: "user@example.com" },
    { event: "catalogue_view", target: "collection", email: "user@example.com" },
    { event: "catalogue_view", target: "collection", url: "/corporate?name=private" },
  ]) assert.equal(interactionSchema.safeParse(body).success, false);
});
