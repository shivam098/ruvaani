import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { connectDb } from "../../src/lib/db";
import { ProductModel, UserModel, SessionModel, OrderModel, QuoteModel, RateModel, AuditModel } from "../../src/lib/models";
import { demoProducts } from "../../src/lib/catalog-data";

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
  assert.equal((await request("/api/checkout", {}, "")).status, 401);
  assert.equal((await request("/api/admin", { kind: "product", id: "rv-001", stock: 9999, active: true }, cookie, "PATCH")).status, 403);
});

test("corporate enquiry is persisted with consent and rejected if invalid", async () => {
  const body = { name: "Test Buyer", company: "Sample Company", email: "buyer@example.com", phone: "9876543210", occasion: "Diwali", quantity: 50, budget: 1500, deliveryDate: "2099-10-01", locations: "Bengaluru", personalization: true, requirements: "Test enquiry", consent: true };
  const response = await request("/api/quotes", body, "");
  assert.equal(response.status, 201, await response.clone().text());
  const quote = await QuoteModel.findOne({ reference: (await response.json()).reference });
  assert.equal(quote?.company, body.company);
  assert.ok(quote?.consentAt);
  assert.equal((await request("/api/quotes", { ...body, consent: false }, "")).status, 400);
});

test("checkout prices server-side, reserves atomically and replays an idempotency key", async () => {
  const body = { address, items: [{ productId: "rv-001", quantity: 2, name: "A", message: "Thank you" }], idempotencyKey: randomUUID() };
  const first = await request("/api/checkout", body);
  assert.equal(first.status, 200, await first.clone().text());
  const created = await first.json();
  assert.equal(created.amount, (249900 + 9900) * 2);
  assert.equal((await ProductModel.findOne({ id: "rv-001" }))?.stock, 178);
  const replay = await request("/api/checkout", body);
  assert.equal(replay.status, 200);
  assert.equal((await replay.json()).orderId, created.orderId);
  assert.equal((await ProductModel.findOne({ id: "rv-001" }))?.stock, 178);
  assert.equal(await OrderModel.countDocuments({ idempotencyKey: body.idempotencyKey }), 1);
  assert.equal((await request("/api/checkout", { ...body, items: [{ ...body.items[0], quantity: 3 }] })).status, 409);
  assert.equal((await request("/api/checkout", { ...body, idempotencyKey: randomUUID(), items: [{ ...body.items[0], price: 1 }] })).status, 400);
});

test("captured payment and duplicate webhooks confirm only the existing order", async () => {
  const order = await OrderModel.findOne({ paymentStatus: "PAYMENT_PENDING" });
  assert.ok(order);
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

test("concurrent checkouts cannot reserve the same last unit twice", async () => {
  await ProductModel.updateOne({ id: "rv-008" }, { $set: { stock: 1 } });
  const payload = { address, items: [{ productId: "rv-008", quantity: 1, name: "", message: "" }] };
  const responses = await Promise.all([request("/api/checkout", { ...payload, idempotencyKey: randomUUID() }), request("/api/checkout", { ...payload, idempotencyKey: randomUUID() })]);
  assert.equal(responses.filter((r) => r.status === 200).length, 1, await Promise.all(responses.map((r) => r.clone().text())).then((v) => v.join(";")));
  assert.ok(responses.some((r) => r.status === 400 || r.status === 409));
  assert.equal((await ProductModel.findOne({ id: "rv-008" }))?.stock, 0);
});

test("resuming an unpaid order neither creates a new order nor reserves more stock", async () => {
  const order = await OrderModel.findOne({ paymentStatus: "PAYMENT_PENDING" });
  assert.ok(order);
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
