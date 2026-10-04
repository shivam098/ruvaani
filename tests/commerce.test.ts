import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateCart, cartLineKey, filterProducts, FREE_SHIPPING_THRESHOLD, PERSONALIZATION_FEE, SHIPPING_FEE } from "../src/lib/commerce";
import { demoProducts } from "../src/lib/catalog-data";
import { addressSchema, cartLineSchema, checkoutSchema, quoteSchema, registerSchema } from "../src/lib/validation";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { verifySignature } from "../src/lib/razorpay";
import { createHmac } from "node:crypto";

const line = { productId: "rv-001", quantity: 1, name: "", message: "" };
test("prices are calculated from trusted catalogue data in integer paise", () => {
  const result = calculateCart([line], demoProducts);
  assert.equal(result.total, 249900);
  assert.equal(result.shipping, 0);
  assert.equal(result.items[0].unitPrice, demoProducts[0].price);
});
test("shipping applies below the inclusive free-shipping threshold", () => {
  assert.equal(calculateCart([{ ...line, productId: "rv-008" }], demoProducts).shipping, SHIPPING_FEE);
  assert.equal(calculateCart([line], [{ ...demoProducts[0], price: FREE_SHIPPING_THRESHOLD }]).shipping, 0);
  assert.equal(calculateCart([line], [{ ...demoProducts[0], price: FREE_SHIPPING_THRESHOLD - 1 }]).shipping, SHIPPING_FEE);
});
test("personalization is charged once per gift, not once per field or order", () => {
  const result = calculateCart([{ ...line, quantity: 2, name: "Ananya", message: "Thank you" }], demoProducts);
  assert.equal(result.total, (demoProducts[0].price + PERSONALIZATION_FEE) * 2);
});
test("non-personalizable gifts reject personalization", () => {
  assert.throws(() => calculateCart([{ ...line, productId: "rv-006", name: "A" }], demoProducts), /cannot be personalized/);
});
test("cumulative quantity across personalization variants cannot oversell", () => {
  assert.throws(() => calculateCart([{ ...line, quantity: 100, name: "A" }, { ...line, quantity: 100, name: "B" }], demoProducts), /Only 180/);
});
test("empty and overlarge selections are rejected", () => {
  assert.throws(() => calculateCart([], demoProducts));
  assert.throws(() => calculateCart(Array.from({ length: 31 }, () => line), demoProducts));
});
test("invalid and fractional quantities are rejected", () => {
  for (const quantity of [0, -1, 1.5, NaN, Infinity, 1001]) assert.throws(() => calculateCart([{ ...line, quantity }], demoProducts));
});
test("inactive and missing products cannot be purchased", () => {
  assert.throws(() => calculateCart([line], [{ ...demoProducts[0], active: false }]), /no longer available/);
  assert.throws(() => calculateCart([{ ...line, productId: "rv-099" }], demoProducts), /no longer available/);
});
test("minimum quantities are enforced", () => {
  assert.throws(() => calculateCart([line], [{ ...demoProducts[0], minimumOrderQuantity: 10 }]), /valid quantity/);
});
test("invalid catalogue prices fail closed", () => {
  for (const price of [0, -1, 100.5, Infinity, NaN]) {
    assert.throws(() => calculateCart([line], [{ ...demoProducts[0], price }]), /Pricing is unavailable/);
  }
});
test("cart identity preserves distinct personalization", () => {
  assert.notEqual(cartLineKey({ ...line, name: "A|B", message: "C" }), cartLineKey({ ...line, name: "A", message: "B|C" }));
});
test("category, recipient, budget and occasion filters all apply", () => {
  const results = filterProducts(demoProducts, { recipient: "Clients", occasion: "Diwali", maxPrice: 100000 });
  assert.deepEqual(results.map((p) => p.id), ["rv-008"]);
});
test("search is case insensitive and results sort by price", () => {
  assert.ok(filterProducts(demoProducts, { query: "COFFEE" }).some((p) => p.id === "rv-006"));
  const results = filterProducts(demoProducts, { sort: "price-asc" });
  assert.equal(results[0].id, "rv-008");
  assert.equal(results.at(-1)?.id, "rv-004");
});
test("gift finder returns no fake alternatives outside the requested budget", () => {
  assert.equal(filterProducts(demoProducts, { maxPrice: 100, recipient: "Employees", occasion: "Diwali" }).length, 0);
});
test("client-provided price and role fields are rejected", () => {
  assert.equal(cartLineSchema.safeParse({ ...line, price: 1 }).success, false);
  assert.equal(registerSchema.safeParse({ name: "Test Person", email: "test@example.com", password: "long-test-password", role: "ADMIN" }).success, false);
});
test("address validation rejects malformed Indian details", () => {
  const address = { name: "Test Person", email: "test@example.com", phone: "9876543210", pincode: "560001", line1: "42 Sample Street", city: "Bengaluru", state: "Karnataka" };
  assert.equal(addressSchema.safeParse(address).success, true);
  assert.equal(addressSchema.safeParse({ ...address, pincode: "012345" }).success, false);
  assert.equal(addressSchema.safeParse({ ...address, phone: "1234567890" }).success, false);
  assert.equal(checkoutSchema.safeParse({ items: [line], address, idempotencyKey: "not-a-uuid" }).success, false);
});
test("corporate enquiries require valid budgets, dates and explicit consent", () => {
  const quote = { name: "Test Person", company: "Example", email: "test@example.com", phone: "9876543210", occasion: "Diwali", quantity: 50, budget: 1500, deliveryDate: "2099-10-01", locations: "Bengaluru", personalization: true, requirements: "", consent: true };
  assert.equal(quoteSchema.safeParse(quote).success, true);
  assert.equal(quoteSchema.safeParse({ ...quote, consent: false }).success, false);
  assert.equal(quoteSchema.safeParse({ ...quote, deliveryDate: "2020-01-01" }).success, false);
  assert.equal(quoteSchema.safeParse({ ...quote, quantity: 9 }).success, false);
});
test("passwords are salted, hashed and verified without storing plaintext", async () => {
  const password = "A test password, not a credential.";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.ok(!first.includes(password));
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("incorrect password", first), false);
  assert.equal(await verifyPassword(password, "malformed"), false);
});
test("HMAC verification rejects modified payloads and malformed signatures", () => {
  const payload = "order_test|pay_test";
  const secret = "test-only-secret";
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  assert.equal(verifySignature(payload, signature, secret), true);
  assert.equal(verifySignature(`${payload}X`, signature, secret), false);
  assert.equal(verifySignature(payload, "a", secret), false);
  assert.equal(verifySignature(payload, "g".repeat(64), secret), false);
});
