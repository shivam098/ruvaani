import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/config";
import { connectDb } from "@/lib/db";
import { catalogueProducts, type CatalogueItem, categories } from "@/lib/catalog-data";
import { OrderModel, QuoteModel, ProductModel, CorporateAccountModel, SupportTicketModel } from "@/lib/models";
import { Admin, type AdminCorporate, type AdminOrder, type AdminQuote, type AdminTicket } from "@/components/admin";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { getAnalyticsSummary } from "@/lib/analytics";
import type { AnalyticsSummary } from "@/lib/interaction-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Operations", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const homepage = await getHomepageSettings();
  const user = await currentUser();

  // If live mode or user is authenticated, verify role
  if (!isDemoMode()) {
    if (!user) redirect("/account");
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/account");
  }

  let dbProducts: CatalogueItem[] = catalogueProducts;
  let orders: AdminOrder[] = [];
  let quotes: AdminQuote[] = [];
  let corporateAccounts: AdminCorporate[] = [];
  let supportTickets: AdminTicket[] = [];
  let analytics: AnalyticsSummary = { enabled: false, interactions: [], submittedEnquiries: 0 };

  try {
    await connectDb();
    const [storedProducts, storedOrders, storedQuotes, storedCorporate, storedTickets, storedAnalytics] = await Promise.all([
      ProductModel.find().sort({ createdAt: -1 }).lean(),
      OrderModel.find().sort({ createdAt: -1 }).limit(100).lean(),
      QuoteModel.find().sort({ createdAt: -1 }).limit(100).lean(),
      CorporateAccountModel.find().sort({ createdAt: -1 }).limit(100).lean(),
      SupportTicketModel.find().sort({ createdAt: -1 }).limit(100).lean(),
      getAnalyticsSummary().catch(() => ({ enabled: false, interactions: [], submittedEnquiries: 0 })),
    ]);

    if (storedProducts.length > 0) {
      dbProducts = storedProducts.map((p) => {
        const match = catalogueProducts.find((cp) => cp.id === p.id || cp.slug === p.slug);
        const validCategory = (categories as readonly string[]).includes(p.category)
          ? (p.category as (typeof categories)[number])
          : match?.category || "Curated hampers";

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          subtitle: p.subtitle || match?.subtitle || "Thoughtfully curated gifting",
          description: p.description || match?.description || p.name,
          category: validCategory,
          image: p.images?.[0] || match?.image || `/catalogue/${p.slug}.webp`,
          imageAlt: match?.imageAlt || `${p.name} from RUVAANI`,
          sheet: match?.sheet,
          sheetSize: match?.sheetSize,
          cataloguePrice: p.price ?? match?.cataloguePrice,
          priceType: match?.priceType,
          occasion: (p.occasions && p.occasions[0]) || match?.occasion,
          contents: (p.includes && p.includes.length > 0) ? p.includes : match?.contents,
          personalizable: Boolean(p.personalizable),
          featured: Boolean(p.featured),
          source: match?.source || "MongoDB Product Inventory",
          stock: p.stock,
          active: p.active,
        };
      });
    }

    orders = storedOrders.map((o) => ({
      id: o._id.toString(),
      number: o.number,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: o.total,
      email: o.address?.email ?? "",
    }));

    quotes = storedQuotes.map((q) => ({
      id: q._id.toString(),
      reference: q.reference,
      name: q.name ?? "",
      company: q.company ?? "",
      email: q.email ?? "",
      phone: q.phone ?? "",
      quantity: q.quantity ?? 0,
      budget: q.budget ?? 0,
      status: q.status,
      occasion: q.occasion ?? "",
      locations: q.locations ?? "",
      requirements: q.requirements ?? "",
      productName: q.productName ?? "",
      deliveryDate: q.deliveryDate ?? "",
      personalization: q.personalization ?? false,
    }));

    corporateAccounts = storedCorporate.map((c) => ({
      id: c._id.toString(),
      companyName: c.companyName,
      workEmail: c.workEmail,
      mobile: c.mobile,
      designation: c.designation ?? "",
      gstin: c.gstin ?? "",
      status: c.status,
      createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "",
    }));

    supportTickets = storedTickets.map((t) => ({
      id: t._id.toString(),
      ticketNumber: t.ticketNumber,
      name: t.name,
      email: t.email,
      phone: t.phone ?? "",
      subject: t.subject,
      category: t.category,
      message: t.message,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "",
    }));

    analytics = storedAnalytics;
  } catch {
    // If DB is offline, fallback gracefully
  }

  const isDemo = isDemoMode() && !user;
  return (
    <Admin
      demo={isDemo}
      analytics={analytics}
      homepage={homepage}
      products={dbProducts}
      orders={orders}
      quotes={quotes}
      corporateAccounts={corporateAccounts}
      supportTickets={supportTickets}
    />
  );
}
