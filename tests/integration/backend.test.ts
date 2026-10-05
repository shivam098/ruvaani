import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { connectDb } from "../../src/lib/db";
import { ProductModel, UserModel, SessionModel, OrderModel, QuoteModel, RateModel, AuditModel } from "../../src/lib/models";
import { demoProducts } from "../fixtures/products";

const base = "http://127.0.0.1:3101";
let replica: MongoMemoryReplSet;
let server: ChildProcess;
let cookie = "";
let adminCookie = "";
let serverOutput = "";
const customer = { name: "Test Customer", email: "customer@example.com", password: "test-only-long-password" };
const address = { name: "Test Recipient", email: "recipient@example.com", phone: "9876543210", line1: "42 Sample Street", city: "Bengaluru", state: "Karnataka", pincode: "560001" };

async function request(path: string, body?: object, sessionCookie = cookie, method = "POST") {
  return fetch(`${base}${path}`, {
    method, headers: { "Content-Type": "application/json", Origin: base, Cookie: sessionCookie },
    body: body ? JSON.stringify(body) : undefined,
  });
}

before(async () => {
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = replica.getUri();
  process.env.MONGODB_DB = "ruvaani_integration_test";
  await connectDb();
  for (const model of [ProductModel, UserModel, SessionModel, OrderModel, QuoteModel, RateModel, AuditModel]) await model.createIndexes();
  await ProductModel.insertMany(demoProducts);
  server = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "dev", "--port", "3101", "--hostname", "127.0.0.1"], {
    cwd: process.cwd(),
    env: {
      ...process.env, DEMO_MODE: "false", NEXT_PUBLIC_SITE_URL: base,
      RUVAANI_INTEGRATION_TEST: "1",
      NEXT_TELEMETRY_DISABLED: "1",
      RAZORPAY_KEY_ID: "rzp_test_fixture", RAZORPAY_KEY_SECRET: "test-only-key",
      RAZORPAY_WEBHOOK_SECRET: "test-only-webhook",
      NODE_OPTIONS: `--require="${resolve("tests/fixtures/razorpay-preload.cjs").replaceAll("\\", "\\\\")}"`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout?.on("data", (chunk) => { serverOutput += chunk.toString(); });
  server.stderr?.on("data", (chunk) => { serverOutput += chunk.toString(); });
  const deadline = Date.now() + 120000;
  let ready = false;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Test server exited: ${serverOutput}`);
    try { ready = (await fetch(`${base}/api/auth/me`)).ok; }
    catch { ready = false; }
    if (ready) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert.ok(ready, `Test server did not become ready: ${serverOutput}`);
}, { timeout: 240000 });

after(async () => {
  if (server?.pid && server.exitCode === null) {
    if (process.platform === "win32") execFileSync("powershell.exe", ["-NoProfile", "-Command", `function Stop-TestProcessTree([int]$ProcessId) { Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId" | ForEach-Object { Stop-TestProcessTree $_.ProcessId }; Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue }; Stop-TestProcessTree ${server.pid}`], { stdio: "ignore" });
    else server.kill("SIGTERM");
  }
  if (process.env.MONGODB_URI) await (await connectDb()).disconnect();
  if (replica) await replica.stop();
});

test("registration stores only hashed credentials and issues a protected session", async () => {
  const response = await request("/api/auth/register", customer, "");
  assert.equal(response.status, 200, await response.clone().text());
  cookie = response.headers.get("set-cookie")!.split(";")[0];
  assert.match(response.headers.get("set-cookie")!, /HttpOnly/i);
  assert.match(response.headers.get("set-cookie")!, /SameSite=lax/i);
  const user = await UserModel.findOne({ email: customer.email }).select("+passwordHash");
  assert.ok(user);
  assert.notEqual(user.passwordHash, customer.password);
  assert.equal(user.role, "CUSTOMER");
  const session = await SessionModel.findOne({ userId: user._id });
  assert.ok(session);
  assert.notEqual(session.tokenHash, cookie.split("=")[1]);
  const me = await fetch(`${base}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal((await me.json()).user.email, customer.email);
});

test("bad passwords, role injection, anonymous access and unauthorized admin changes fail", async () => {
  assert.equal((await request("/api/auth/login", { email: customer.email, password: "incorrect-password" }, "")).status, 401);
  assert.equal((await request("/api/auth/register", { ...customer, email: "inject@example.com", role: "ADMIN" }, "")).status, 400);
  assert.equal((await request("/api/checkout", {}, "")).status, 410);
  assert.equal((await request("/api/admin", { kind: "product", id: "rv-001", stock: 9999, active: true }, cookie, "PATCH")).status, 403);
});

test("corporate enquiry is persisted with consent and rejected if invalid", async () => {
  const body = { name: "Test Buyer", company: "Sample Company", email: "buyer@example.com", phone: "9876543210", occasion: "Diwali", quantity: 10, budget: 299, productId: "rc-017", deliveryDate: "2099-10-01", locations: "Bengaluru", personalization: true, requirements: "Test enquiry", consent: true };
  const response = await request("/api/quotes", body, "");
  assert.equal(response.status, 201, await response.clone().text());
  const quote = await QuoteModel.findOne({ reference: (await response.json()).reference });
  assert.equal(quote?.company, body.company);
  assert.ok(quote?.consentAt);
  assert.equal(quote?.productId, "rc-017");
  assert.equal(quote?.productName, "Single Premium Box");
  assert.equal(quote?.budget, 299);
  assert.equal((await request("/api/quotes", { ...body, consent: false }, "")).status, 400);
  assert.equal((await request("/api/quotes", { ...body, quantity: 9 }, "")).status, 400);
  assert.equal((await request("/api/quotes", { ...body, productId: "rc-999" }, "")).status, 400);
  assert.equal((await request("/api/quotes", { ...body, productName: "Injected name" }, "")).status, 400);
  assert.equal(await QuoteModel.countDocuments(), 1);
});

test("quote-only checkout rejects legacy and new catalogue items without reserving stock", async () => {
  for (const productId of ["rv-001", "rc-017", "rc-001"]) {
    const response = await request("/api/checkout", { address, items: [{ productId, quantity: 10 }], idempotencyKey: randomUUID() });
    assert.equal(response.status, 410);
    assert.match((await response.json()).error, /quote-only/);
  }
  assert.equal((await ProductModel.findOne({ id: "rv-001" }))?.stock, 180);
  assert.equal(await OrderModel.countDocuments(), 0);
  const response = await fetch(`${base}/api/checkout`, { method: "POST", headers: { Origin: "https://untrusted.example" } });
  assert.equal(response.status, 403);
});

test("captured payment and duplicate webhooks confirm only the existing order", async () => {
  const user = await UserModel.findOne({ email: customer.email });
  const order = await OrderModel.create({
    number: "RV-LEGACY-1", userId: user!._id.toString(), idempotencyKey: randomUUID(), requestHash: "historical-fixture",
    razorpayOrderId: "order_1111111111111111", address, subtotal: 519600, shipping: 0, total: 519600,
    items: [{ productId: "rv-001", name: "Historical gift", quantity: 2, unitPrice: 259800, personalization: { name: "A", message: "Thank you" } }],
  });
  await ProductModel.updateOne({ id: "rv-001" }, { $set: { stock: 178 } });
  const paymentId = `pay_${order.razorpayOrderId.slice(6)}`;
  const signature = createHmac("sha256", "test-only-key").update(`${order.razorpayOrderId}|${paymentId}`).digest("hex");
  assert.equal((await request("/api/payments/verify", { razorpay_order_id: order.razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: "0".repeat(64) })).status, 400);
  const response = await request("/api/payments/verify", { razorpay_order_id: order.razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature });
  assert.equal(response.status, 200, await response.clone().text());
  const raw = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: paymentId } } } });
  const webhookSignature = createHmac("sha256", "test-only-webhook").update(raw).digest("hex");
  for (let i = 0; i < 2; i++) {
    const response = await fetch(`${base}/api/webhooks/razorpay`, { method: "POST", body: raw, headers: { "Content-Type": "application/json", "x-razorpay-signature": webhookSignature } });
    assert.equal(response.status, 200, await response.clone().text());
  }
  const stored = await OrderModel.findById(order._id);
  assert.equal(stored?.paymentStatus, "PAID");
  assert.equal(stored?.status, "CONFIRMED");
  assert.equal((await ProductModel.findOne({ id: "rv-001" }))?.stock, 178);
  assert.equal(await OrderModel.countDocuments(), 1);
});

test("public catalogue stays quote-only with a database containing legacy products", async () => {
  const response = await fetch(`${base}/products/single-premium-box`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Single Premium Box/);
  assert.doesNotMatch(html, /Add to my bag/);
  const structuredData = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  assert.ok(structuredData.some((data) => data["@type"] === "Product"));
  assert.ok(structuredData.every((data) => !data.offers));
  const removed = await fetch(`${base}/products/the-signature-hamper`);
  const removedHtml = await removed.text();
  // Next.js may have started streaming before notFound() resolves the catalogue.
  assert.ok(removed.status === 200 || removed.status === 404);
  assert.match(removedHtml, /A gift of a fresh/);
  assert.match(removedHtml, /<meta name="robots" content="noindex"/);
  assert.doesNotMatch(removedHtml, /<script type="application\/ld\+json">/);
});

test("resuming an unpaid order neither creates a new order nor reserves more stock", async () => {
  const user = await UserModel.findOne({ email: customer.email });
  const order = await OrderModel.create({
    number: "RV-LEGACY-2", userId: user!._id.toString(), idempotencyKey: randomUUID(), requestHash: "historical-fixture",
    razorpayOrderId: "order_2222222222222222", address, subtotal: 89900, shipping: 9900, total: 99800,
    items: [{ productId: "rv-008", name: "Historical gift", quantity: 1, unitPrice: 89900, personalization: { name: "", message: "" } }],
  });
  const previous = await OrderModel.countDocuments();
  const stock = (await ProductModel.findOne({ id: "rv-008" }))?.stock;
  const response = await request(`/api/orders/${order._id}/payment`, {});
  assert.equal(response.status, 200, await response.clone().text());
  assert.equal((await response.json()).orderId, order.razorpayOrderId);
  assert.equal(await OrderModel.countDocuments(), previous);
  assert.equal((await ProductModel.findOne({ id: "rv-008" }))?.stock, stock);
});

test("admin changes require authorization, enforce transitions, and create audit records", async () => {
  const response = await request("/api/auth/register", { ...customer, name: "Test Admin", email: "admin@example.com" }, "");
  assert.equal(response.status, 200);
  adminCookie = response.headers.get("set-cookie")!.split(";")[0];
  await UserModel.updateOne({ email: "admin@example.com" }, { $set: { role: "ADMIN" } });
  const paid = await OrderModel.findOne({ paymentStatus: "PAID" });
  assert.ok(paid);
  assert.equal((await request("/api/admin", { kind: "order", id: paid._id.toString(), status: "DELIVERED" }, adminCookie, "PATCH")).status, 409);
  assert.equal((await request("/api/admin", { kind: "order", id: paid._id.toString(), status: "PROCESSING" }, adminCookie, "PATCH")).status, 200);
  assert.equal(await AuditModel.countDocuments(), 1);
  assert.equal((await OrderModel.findById(paid._id))?.status, "PROCESSING");
});

test("logout revokes the session", async () => {
  assert.equal((await request("/api/auth/logout", {})).status, 200);
  const response = await fetch(`${base}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal((await response.json()).user, null);
});
