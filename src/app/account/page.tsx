import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { OrderModel } from "@/lib/models";
import { Account } from "@/components/account";
import type { OrderView } from "@/lib/types";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your little corner of RUVAANI", robots: { index: false, follow: false } };
export default async function AccountPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await currentUser();
  const stored = user ? await OrderModel.find({ userId: user.id }).sort({ createdAt: -1 }).limit(100).lean() : [];
  const orders: OrderView[] = stored.map((o) => ({ id: o._id.toString(), number: o.number, total: o.total, createdAt: o.createdAt.toISOString(), status: o.status, paymentStatus: o.paymentStatus, items: o.items.map((i) => ({ productId: i.productId, name: i.name, quantity: i.quantity, unitPrice: i.unitPrice, personalization: { name: i.personalization?.name ?? "", message: i.personalization?.message ?? "" } })) }));
  return <Account user={user} orders={orders} next={(await searchParams).next} />;
}
