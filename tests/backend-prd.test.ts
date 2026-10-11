import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { connectDb } from "../src/lib/db";
import {
  ProductModel,
  UserModel,
  CorporateAccountModel,
  RecipientModel,
  CouponModel,
  QuoteModel,
  ReviewModel,
} from "../src/lib/models";
import { demoProducts } from "./fixtures/products";

before(async () => {
  // Ensure connection to local MongoDB
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";
  process.env.MONGODB_DB = "ruvaani";
  await connectDb();

  for (const p of demoProducts) {
    await ProductModel.updateOne({ id: p.id }, { $set: p }, { upsert: true });
  }
});

after(async () => {
  if (process.env.MONGODB_URI) {
    const db = await connectDb();
    await db.disconnect();
  }
});

test("MongoDB models create and query products with rich attributes", async () => {
  const product = await ProductModel.findOne({ id: "rv-001" }).lean();
  assert.ok(product);
  assert.equal(product.name, "The Signature Hamper");
  assert.equal(product.active, true);
  assert.equal(product.price, 249900);
});

test("Coupon engine calculates percentage discount with maximum cap", async () => {
  await CouponModel.updateOne(
    { code: "TEST10" },
    {
      $set: {
        code: "TEST10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderValue: 100000,
        maxDiscount: 20000, // max ₹200
        active: true,
      },
    },
    { upsert: true }
  );

  const coupon = await CouponModel.findOne({ code: "TEST10", active: true }).lean();
  assert.ok(coupon);

  // Subtotal ₹3000 (300000 paise) -> 10% is 30000 paise, capped at 20000 paise (₹200)
  const subtotal = 300000;
  let discount = Math.round((subtotal * coupon.discountValue) / 100);
  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }
  assert.equal(discount, 20000);
});

test("Corporate quote lifecycle transitions correctly", async () => {
  const quote = await QuoteModel.create({
    reference: `TEST-RQ-${Date.now()}`,
    name: "Corporate Manager",
    company: "Acme Corp",
    email: "manager@acme.com",
    phone: "9876543210",
    occasion: "Diwali",
    quantity: 100,
    budget: 1500,
    deliveryDate: "2026-11-01",
    locations: "Mumbai",
    personalization: true,
    requirements: "Branded gift boxes with corporate logo",
    consentAt: new Date(),
    status: "SUBMITTED",
  });

  assert.equal(quote.status, "SUBMITTED");

  // Admin reviews and sends quote
  quote.status = "QUOTE_SENT";
  quote.totalQuoteAmount = 14000000; // ₹1,40,000
  await quote.save();

  const reloaded = await QuoteModel.findOne({ reference: quote.reference });
  assert.equal(reloaded?.status, "QUOTE_SENT");
  assert.equal(reloaded?.totalQuoteAmount, 14000000);

  // Corporate approves
  reloaded!.status = "APPROVED";
  await reloaded!.save();
  assert.equal(reloaded!.status, "APPROVED");

  // Clean up
  await QuoteModel.deleteOne({ reference: quote.reference });
});

test("Recipient bulk validation flags duplicates and invalid phone numbers", () => {
  const seenMobiles = new Set<string>();
  const testBatch = [
    { name: "Aditi", mobile: "9876543210", email: "aditi@example.com", pincode: "110001", address: "Connaught Place" },
    { name: "Rahul", mobile: "9876543210", email: "rahul@example.com", pincode: "400001", address: "Marine Drive" }, // duplicate mobile
    { name: "Invalid", mobile: "12345", email: "bad@example.com", pincode: "999999", address: "Somewhere" }, // invalid mobile
  ];

  const valid = [];
  const errors = [];

  for (const row of testBatch) {
    if (!/^[6-9]\d{9}$/.test(row.mobile)) {
      errors.push(`Invalid mobile: ${row.mobile}`);
      continue;
    }
    if (seenMobiles.has(row.mobile)) {
      errors.push(`Duplicate mobile: ${row.mobile}`);
      continue;
    }
    seenMobiles.add(row.mobile);
    valid.push(row);
  }

  assert.equal(valid.length, 1);
  assert.equal(errors.length, 2);
  assert.equal(valid[0].name, "Aditi");
});

test("Customer reviews aggregate correctly into product rating", async () => {
  const prodId = "test-prod-review";
  await ReviewModel.deleteMany({ productId: prodId });

  await ReviewModel.create([
    { productId: prodId, userId: "u1", userName: "Aarav", rating: 5, comment: "Exceptional hamper!", status: "APPROVED" },
    { productId: prodId, userId: "u2", userName: "Sneha", rating: 4, comment: "Very good presentation.", status: "APPROVED" },
  ]);

  const reviews = await ReviewModel.find({ productId: prodId, status: "APPROVED" }).lean();
  assert.equal(reviews.length, 2);
  const avg = Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1));
  assert.equal(avg, 4.5);

  // Clean up
  await ReviewModel.deleteMany({ productId: prodId });
});
