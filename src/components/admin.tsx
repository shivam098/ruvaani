"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardList, Gift, IndianRupee, Package, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { formatPrice } from "@/lib/commerce";
import { formatCataloguePrice, type CatalogueItem } from "@/lib/catalog-data";
import { ProductImage } from "./product-image";
import { HomepageEditor } from "./homepage-editor";
import type { HomepageSettings } from "@/lib/homepage-content";

export interface AdminOrder { id: string; number: string; status: string; paymentStatus: string; total: number; email: string }
export interface AdminQuote { id: string; reference: string; name: string; company: string; email: string; phone: string; quantity: number; budget: number; status: string; occasion: string; locations: string; requirements: string; productName: string; deliveryDate: string; personalization: boolean }

export function Admin({ demo, products, orders, quotes, homepage }: { demo: boolean; products: CatalogueItem[]; orders: AdminOrder[]; quotes: AdminQuote[]; homepage: HomepageSettings }) {
  const router = useRouter();
  const [tab, setTab] = useState("products");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  async function update(id: string, payload: object) {
    if (demo) { setNotice("Read-only demo. Connect MongoDB and sign in as an administrator to change records."); return; }
    setBusy(id); setNotice("");
    try { await apiRequest("/api/admin", payload, "PATCH"); setNotice("Saved. The change is recorded in the audit log."); router.refresh(); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Unable to save the change."); }
    finally { setBusy(""); }
  }
  return <section className="wrap admin-page section"><div className="section-heading"><div><span className="eyebrow">THE THOUGHTFUL DETAILS, BEHIND THE SCENES</span><h1>RUVAANI <em>operations.</em></h1></div><span className="status-chip"><ShieldCheck size={14} />{demo ? "Read-only demo" : "Administrator"}</span></div>{demo && <div className="notice"><ShieldCheck size={20} /><p>Operations preview with the supplied catalogue. There are no invented customers, enquiries, payments or orders. Live access requires an authenticated administrator.</p></div>}<div className="admin-stats"><div><IndianRupee /><span>Paid revenue</span><strong>{formatPrice(orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + o.total, 0))}</strong></div><div><Package /><span>Orders</span><strong>{orders.length}</strong></div><div><ClipboardList /><span>Corporate enquiries</span><strong>{quotes.length}</strong></div><div><Gift /><span>Catalogue gifts</span><strong>{products.length}</strong></div></div><p className="helper-text">Overview of the latest 100 orders and 100 enquiries. Revenue is not an accounting report.</p><div className="admin-tabs" role="tablist" aria-label="Operations sections">{["products", "orders", "enquiries", "homepage"].map((value) => <button role="tab" id={`tab-${value}`} aria-controls={`panel-${value}`} aria-selected={tab === value} className={tab === value ? "active" : ""} onClick={() => setTab(value)} key={value}>{value}</button>)}</div>{notice && <p className="notice" role="status">{notice}</p>}<div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
      {tab === "homepage" && <HomepageEditor initial={homepage} demo={demo} />}
      {tab === "products" && <div className="admin-products"><p className="notice">The public catalogue is read-only here and maintained in the repository. Stock and checkout prices are not assigned to quote-only items.</p>{products.map((product) => <article className="admin-product" key={product.id}><ProductImage product={product} sizes="100px" /><div><h3>{product.name}</h3><p>{product.id} · {formatCataloguePrice(product)}{product.cataloguePrice === undefined ? "" : product.priceType === "starting" ? " starting price" : " catalogue reference"}</p></div><span className="status-chip">Quote only</span></article>)}</div>}
      {tab === "orders" && (orders.length ? <div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Fulfilment</th></tr></thead><tbody>{orders.map((o) => <tr key={o.id}><td>{o.number}</td><td>{o.email}</td><td>{formatPrice(o.total)}</td><td>{o.paymentStatus}</td><td><span>{o.status}</span>{o.paymentStatus === "PAID" && o.status !== "DELIVERED" && <button disabled={busy === o.id} className="text-button" onClick={() => update(o.id, { kind: "order", id: o.id, status: { CONFIRMED: "PROCESSING", PROCESSING: "SHIPPED", SHIPPED: "DELIVERED" }[o.status] })}>Advance status</button>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><Package size={32} /><h2>No existing orders.</h2><p>This view retains historical orders. New gifting requests arrive in the enquiries tab; online checkout is disabled.</p></div>)}
      {tab === "enquiries" && (quotes.length ? <div className="admin-quotes">{quotes.map((q) => <article className="admin-quote" key={q.id}><div><span className="eyebrow">{q.reference} · {q.occasion}</span><h3>{q.company}</h3><p>{q.name} · {q.email} · {q.phone}</p><p>{q.productName || "Bespoke collection"} · {q.quantity} gifts · Budget {formatPrice(q.budget * 100)} per gift · Delivery requested: {q.deliveryDate}</p><p>{q.locations} · Personalization: {q.personalization ? "Yes" : "No"}</p><p>{q.requirements || "No additional requirements."}</p></div><label>Enquiry status<select value={q.status} disabled={busy === q.id} onChange={(e) => update(q.id, { kind: "quote", id: q.id, status: e.target.value })}>{["SUBMITTED", "UNDER_REVIEW", "CONTACTED", "CLOSED"].map((s) => <option key={s}>{s}</option>)}</select></label></article>)}</div> : <div className="empty-state"><ClipboardList size={32} /><h2>A little room for big ideas.</h2><p>Corporate enquiries will appear here after they are submitted.</p></div>)}
    </div></section>;
}
