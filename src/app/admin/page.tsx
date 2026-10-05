import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/config";
import { connectDb } from "@/lib/db";
import { catalogueProducts } from "@/lib/catalog-data";
import { OrderModel, QuoteModel } from "@/lib/models";
import { Admin } from "@/components/admin";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Operations", robots: { index: false, follow: false } };
export default async function AdminPage() {
  if (isDemoMode()) return <Admin demo products={catalogueProducts} orders={[]} quotes={[]} />;
  const user = await currentUser();
  if (!user) redirect("/account");
  if (user.role !== "ADMIN") redirect("/account");
  await connectDb();
  const [orders, quotes] = await Promise.all([
    OrderModel.find().sort({ createdAt: -1 }).limit(100).lean(),
    QuoteModel.find().sort({ createdAt: -1 }).limit(100).lean(),
  ]);
  return <Admin demo={false} products={catalogueProducts} orders={orders.map((o) => ({ id: o._id.toString(), number: o.number, status: o.status, paymentStatus: o.paymentStatus, total: o.total, email: o.address?.email ?? "" }))} quotes={quotes.map((q) => ({ id: q._id.toString(), reference: q.reference, name: q.name ?? "", company: q.company ?? "", email: q.email ?? "", phone: q.phone ?? "", quantity: q.quantity ?? 0, budget: q.budget ?? 0, status: q.status, occasion: q.occasion ?? "", locations: q.locations ?? "", requirements: q.requirements ?? "", productName: q.productName ?? "", deliveryDate: q.deliveryDate ?? "", personalization: q.personalization ?? false }))} />;
}
