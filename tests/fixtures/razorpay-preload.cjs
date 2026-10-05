// Test-process-only provider double. Production never loads this file.
/* eslint-disable @typescript-eslint/no-require-imports */
const { randomBytes } = require("node:crypto");
const originalFetch = globalThis.fetch;
const orders = new Map([
  ["order_1111111111111111", { amount: 519600 }],
  ["order_2222222222222222", { amount: 99800 }],
]);

globalThis.fetch = async function(input, init) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (!url.startsWith("https://api.razorpay.com/v1/")) return originalFetch(input, init);
  const path = url.slice("https://api.razorpay.com/v1/".length);
  if (path === "orders" && init?.method === "POST") {
    const body = JSON.parse(init.body);
    const id = `order_${randomBytes(8).toString("hex")}`;
    orders.set(id, body);
    return Response.json({ id, ...body });
  }
  if (/^orders\/order_[a-f0-9]+\/payments$/.test(path)) return Response.json({ items: [] });
  if (/^payments\/pay_[a-f0-9]+$/.test(path)) {
    const suffix = path.split("pay_")[1];
    const id = `order_${suffix}`;
    const order = orders.get(id);
    if (!order) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ id: `pay_${suffix}`, order_id: id, amount: order.amount, currency: "INR", status: "captured" });
  }
  return Response.json({ error: "Unexpected mock request" }, { status: 400 });
};
