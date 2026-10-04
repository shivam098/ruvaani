"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardList, Gift, IndianRupee, Package, Save, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { formatPrice } from "@/lib/commerce";
import type { Product } from "@/lib/types";
import { GiftArtwork } from "./gift-artwork";

export interface AdminOrder { id: string; number: string; status: string; paymentStatus: string; total: number; email: string }
export interface AdminQuote { id: string; reference: string; name: string; company: string; email: string; phone: string; quantity: number; budget: number; status: string; occasion: string; locations: string; requirements: string; deliveryDate: string; personalization: boolean }

export function Admin({ demo, products, orders, quotes }: { demo: boolean; products: Product[]; orders: AdminOrder[]; quotes: AdminQuote[] }) {
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
  return <section className="wrap admin-page section"><div className="section-heading"><div><span className="eyebrow">THE THOUGHTFUL DETAILS, BEHIND THE SCENES</span><h1>RUVAANI <em>operations.</em></h1></div><span className="status-chip"><ShieldCheck size={14} />{demo ? "Read-only demo" : "Administrator"}</span></div>{demo && <div className="notice"><ShieldCheck size={20} /><p>Demo catalogue only. There are no invented customers, enquiries, payments or orders. Live access requires an authenticated administrator.</p></div>}<div className="admin-stats"><div><IndianRupee /><span>Paid revenue</span><strong>{formatPrice(orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + o.total, 0))}</strong></div><div><Package /><span>Orders</span><strong>{orders.length}</strong></div><div><ClipboardList /><span>Corporate enquiries</span><strong>{quotes.length}</strong></div><div><Gift /><span>Catalogue gifts</span><strong>{products.length}</strong></div></div><p className="helper-text">Overview of the latest 100 orders and 100 enquiries. Revenue is not an accounting report.</p><div className="admin-tabs" role="tablist" aria-label="Operations sections">{["products", "orders", "enquiries"].map((value) => <button role="tab" id={`tab-${value}`} aria-controls={`panel-${value}`} aria-selected={tab === value} className={tab === value ? "active" : ""} onClick={() => setTab(value)} key={value}>{value}</button>)}</div>{notice && <p className="notice" role="status">{notice}</p>}<div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
      {tab === "products" && <div className="admin-products">{products.map((product) => <form className="admin-product" key={`${product.id}-${product.stock}-${product.active}`} onSubmit={(e) => { e.preventDefault(); const form = new FormData(e.currentTarget); update(product.id, { kind: "product", id: product.id, stock: Number(form.get("stock")), active: form.get("active") === "on" }); }}><GiftArtwork kind={product.artwork} color={product.color} /><div><h3>{product.name}</h3><p>{product.id} · {formatPrice(product.price)}</p></div><label>Available stock<input name="stock" type="number" min={0} max={100000} defaultValue={product.stock} disabled={demo} required /></label><label className="checkbox-label"><input name="active" type="checkbox" defaultChecked={product.active} disabled={demo} />Published</label><button className="button button-outline" disabled={demo || busy === product.id}><Save size={16} />Save</button></form>)}</div>}
      {tab === "orders" && (orders.length ? <div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Fulfilment</th></tr></thead><tbody>{orders.map((o) => <tr key={o.id}><td>{o.number}</td><td>{o.email}</td><td>{formatPrice(o.total)}</td><td>{o.paymentStatus}</td><td><span>{o.status}</span>{o.paymentStatus === "PAID" && o.status !== "DELIVERED" && <button disabled={busy === o.id} className="text-button" onClick={() => update(o.id, { kind: "order", id: o.id, status: { CONFIRMED: "PROCESSING", PROCESSING: "SHIPPED", SHIPPED: "DELIVERED" }[o.status] })}>Advance status</button>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><Package size={32} /><h2>No orders yet.</h2><p>Real checkout orders will appear here when services are connected.</p></div>)}
      {tab === "enquiries" && (quotes.length ? <div className="admin-quotes">{quotes.map((q) => <article className="admin-quote" key={q.id}><div><span className="eyebrow">{q.reference} · {q.occasion}</span><h3>{q.company}</h3><p>{q.name} · {q.email} · {q.phone}</p><p>{q.quantity} gifts · {formatPrice(q.budget * 100)} per gift · Delivery requested: {q.deliveryDate}</p><p>{q.locations} · Personalization: {q.personalization ? "Yes" : "No"}</p><p>{q.requirements || "No additional requirements."}</p></div><label>Enquiry status<select value={q.status} disabled={busy === q.id} onChange={(e) => update(q.id, { kind: "quote", id: q.id, status: e.target.value })}>{["SUBMITTED", "UNDER_REVIEW", "CONTACTED", "CLOSED"].map((s) => <option key={s}>{s}</option>)}</select></label></article>)}</div> : <div className="empty-state"><ClipboardList size={32} /><h2>A little room for big ideas.</h2><p>Corporate enquiries will appear here after they are submitted.</p></div>)}
    </div></section>;
}
