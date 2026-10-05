import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { defaultHomepageContent, eventImages, homepageContentSchema, homepageUpdateSchema } from "../src/lib/homepage-content";

test("default event and marquee are valid and all selectable photographs exist", () => {
  assert.deepEqual(homepageContentSchema.parse(defaultHomepageContent), defaultHomepageContent);
  assert.equal(new Set(eventImages.map((image) => image.src)).size, eventImages.length);
  for (const image of eventImages) assert.ok(existsSync(join(process.cwd(), "public", image.src)), image.src);
  assert.equal(homepageUpdateSchema.safeParse({ revision: 0, content: defaultHomepageContent }).success, true);
});

test("homepage links reject off-site, script and URL-normalisation bypasses", () => {
  for (const href of ["https://example.com", "//example.com", "/\\example.com", "javascript:alert(1)", "data:text/html,test", "/%2fexample.com", "/%5cexample.com", "/%0a/example.com", "/bad%escape", "/foo bar"]) {
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, marquee: { ...defaultHomepageContent.marquee, href } }).success, false, href);
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, event: { ...defaultHomepageContent.event, primaryHref: href } }).success, false, href);
  }
  for (const href of ["/shop", "/#featured-event", "/shop?category=Divine%20%26%20festive%20gifts", "/corporate?occasion=Celebrations#enquiry"]) {
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, marquee: { ...defaultHomepageContent.marquee, href } }).success, true, href);
  }
});

test("homepage input rejects unknown fields, unsupported photos and oversized copy", () => {
  for (const event of [{ name: " " }, { title: "x".repeat(61) }, { image: "/catalogue/not-found.webp" }, { image: "https://example.com/photo.jpg" }, { status: "Automatic" }, { arbitrary: true }]) {
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, event: { ...defaultHomepageContent.event, ...event } }).success, false);
  }
  assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, marquee: { ...defaultHomepageContent.marquee, message: "x".repeat(141) } }).success, false);
  for (const revision of [-1, 0.5, "1", Number.MAX_SAFE_INTEGER]) {
    assert.equal(homepageUpdateSchema.safeParse({ revision, content: defaultHomepageContent }).success, false);
  }
  assert.equal(homepageUpdateSchema.safeParse({ revision: 0, content: defaultHomepageContent, userId: "injected" }).success, false);
});

test("event and marquee can be hidden independently without a dead featured-event link", () => {
  const event = { ...defaultHomepageContent.event, enabled: false };
  assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, event }).success, false);
  assert.equal(homepageContentSchema.safeParse({ event, marquee: { ...defaultHomepageContent.marquee, href: "/shop" } }).success, true);
  assert.equal(homepageContentSchema.safeParse({ event, marquee: { ...defaultHomepageContent.marquee, enabled: false } }).success, true);
  assert.equal(homepageContentSchema.safeParse({ event, marquee: { ...defaultHomepageContent.marquee, href: "//" } }).success, false);
  assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, marquee: { ...defaultHomepageContent.marquee, enabled: false } }).success, true);
});
