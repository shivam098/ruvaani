import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { defaultHomepageContent, defaultMarqueeMessages, eventImages, homepageContentSchema, homepageUpdateSchema } from "../src/lib/homepage-content";

test("default event and marquee are valid and all selectable photographs exist", () => {
  assert.deepEqual(homepageContentSchema.parse(defaultHomepageContent), defaultHomepageContent);
  assert.equal(new Set(eventImages.map((image) => image.src)).size, eventImages.length);
  for (const image of eventImages) assert.ok(existsSync(join(process.cwd(), "public", image.src)), image.src);
  assert.equal(homepageUpdateSchema.safeParse({ revision: 0, content: defaultHomepageContent }).success, true);
});

test("legacy single-message settings retain their content and gain the new default messages", () => {
  const legacy = { enabled: true, message: "Owner's saved announcement", href: "/shop" };
  const parsed = homepageContentSchema.parse({ ...defaultHomepageContent, marquee: legacy });
  assert.deepEqual(parsed.marquee, { ...legacy, additionalMessages: defaultMarqueeMessages });
  assert.equal(new Set([defaultHomepageContent.marquee.message, ...defaultMarqueeMessages]).size, 3);
  assert.deepEqual(homepageContentSchema.parse({ ...defaultHomepageContent, marquee: { ...legacy, additionalMessages: [] } }).marquee.additionalMessages, []);
  for (const additionalMessages of [[""], [" "], ["x".repeat(141)], Array(5).fill("Too many"), "not an array", null]) {
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, marquee: { ...legacy, additionalMessages } }).success, false);
  }
});

test("saved single-event settings gain Navratri without overwriting the original event or marquee", () => {
  const event = { ...defaultHomepageContent.event, name: "Owner's event", enabled: false };
  const marquee = { enabled: true, message: "Owner's message", additionalMessages: [], href: "/shop" };
  const parsed = homepageContentSchema.parse({ event, marquee });
  assert.deepEqual(parsed.event, event);
  assert.deepEqual(parsed.marquee, marquee);
  assert.equal(parsed.additionalEvent.name, "Navratri");
  assert.equal(parsed.defaultEvent, "additionalEvent");
  assert.equal(parsed.additionalEvent.enabled, true);
  const hidden = { ...parsed, additionalEvent: { ...parsed.additionalEvent, enabled: false }, defaultEvent: "event" };
  assert.deepEqual(homepageContentSchema.parse(hidden), hidden);
  assert.equal(homepageContentSchema.safeParse({ ...parsed, defaultEvent: "missing" }).success, false);
});

test("homepage links reject off-site, script and URL-normalisation bypasses", () => {
  for (const href of ["https://example.com", "//example.com", "/\\example.com", "javascript:alert(1)", "data:text/html,test", "/%2fexample.com", "/%5cexample.com", "/%0a/example.com", "/bad%escape", "/foo bar"]) {
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, marquee: { ...defaultHomepageContent.marquee, href } }).success, false, href);
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, event: { ...defaultHomepageContent.event, primaryHref: href } }).success, false, href);
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, additionalEvent: { ...defaultHomepageContent.additionalEvent, secondaryHref: href } }).success, false, href);
  }
  for (const href of ["/shop", "/#featured-event", "/shop?category=Divine%20%26%20festive%20gifts", "/corporate?occasion=Celebrations#enquiry"]) {
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, marquee: { ...defaultHomepageContent.marquee, href } }).success, true, href);
  }
});

test("homepage input rejects unknown fields, unsupported photos and oversized copy", () => {
  for (const event of [{ name: " " }, { title: "x".repeat(61) }, { image: "/catalogue/not-found.webp" }, { image: "https://example.com/photo.jpg" }, { status: "Automatic" }, { arbitrary: true }]) {
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, event: { ...defaultHomepageContent.event, ...event } }).success, false);
    assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, additionalEvent: { ...defaultHomepageContent.additionalEvent, ...event } }).success, false);
  }
  assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, marquee: { ...defaultHomepageContent.marquee, message: "x".repeat(141) } }).success, false);
  for (const revision of [-1, 0.5, "1", Number.MAX_SAFE_INTEGER]) {
    assert.equal(homepageUpdateSchema.safeParse({ revision, content: defaultHomepageContent }).success, false);
  }
  assert.equal(homepageUpdateSchema.safeParse({ revision: 0, content: defaultHomepageContent, userId: "injected" }).success, false);
});

test("either festival can be hidden but the featured-event link requires at least one visible festival", () => {
  const event = { ...defaultHomepageContent.event, enabled: false };
  const additionalEvent = { ...defaultHomepageContent.additionalEvent, enabled: false };
  assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, event }).success, true);
  assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, additionalEvent }).success, true);
  assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, event, additionalEvent }).success, false);
  assert.equal(homepageContentSchema.safeParse({ event, additionalEvent, marquee: { ...defaultHomepageContent.marquee, href: "/shop" } }).success, true);
  assert.equal(homepageContentSchema.safeParse({ event, additionalEvent, marquee: { ...defaultHomepageContent.marquee, enabled: false } }).success, true);
  assert.equal(homepageContentSchema.safeParse({ event, additionalEvent, marquee: { ...defaultHomepageContent.marquee, href: "//" } }).success, false);
  assert.equal(homepageContentSchema.safeParse({ ...defaultHomepageContent, marquee: { ...defaultHomepageContent.marquee, enabled: false } }).success, true);
});
