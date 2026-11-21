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
import type { AnalyticsSummary } from "@/lib/interaction-data";
import { AnalyticsPanel } from "./analytics-panel";

export interface AdminOrder { id: string; number: string; status: string; paymentStatus: string; total: number; email: string }
export interface AdminQuote { id: string; reference: string; name: string; company: string; email: string; phone: string; quantity: number; budget: number; status: string; occasion: string; locations: string; requirements: string; productName: string; deliveryDate: string; personalization: boolean }
export interface AdminCorporate { id: string; companyName: string; workEmail: string; mobile: string; designation?: string; gstin?: string; status: string; createdAt: string }
export interface AdminTicket { id: string; ticketNumber: string; name: string; email: string; phone: string; subject: string; category: string; message: string; status: string; priority: string; createdAt: string }

export function Admin({
  demo,
  products,
  orders,
  quotes,
  corporateAccounts = [],
  supportTickets = [],
  homepage,
  analytics = { enabled: false, interactions: [], submittedEnquiries: 0 },
}: {
  demo: boolean;
  products: (CatalogueItem & { stock?: number; active?: boolean })[];
  orders: AdminOrder[];
  quotes: AdminQuote[];
  corporateAccounts?: AdminCorporate[];
  supportTickets?: AdminTicket[];
  homepage: HomepageSettings;
  analytics?: AnalyticsSummary;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("products");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [productEdits, setProductEdits] = useState<Record<string, { stock: number; active: boolean }>>({});

  async function update(id: string, payload: object) {
    if (demo) { setNotice("Demo preview mode. Changes are recorded in local view."); return; }
    setBusy(id); setNotice("");
    try {
      await apiRequest("/api/admin", payload, "PATCH");
      setNotice("Saved to database successfully. The change is recorded in the audit log.");
      router.refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Unable to save the change.");
    } finally {
      setBusy("");
    }
  }

  function handleProductStockChange(id: string, currentStock: number, newStock: number, currentActive: boolean) {
    setProductEdits((prev) => ({
      ...prev,
      [id]: { stock: newStock, active: prev[id]?.active ?? currentActive },
    }));
  }

  function handleProductActiveToggle(id: string, currentStock: number, newActive: boolean) {
    setProductEdits((prev) => ({
      ...prev,
      [id]: { stock: prev[id]?.stock ?? currentStock, active: newActive },
    }));
  }

  return (
    <section className="wrap admin-page section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE THOUGHTFUL DETAILS, BEHIND THE SCENES</span>
          <h1>RUVAANI <em>operations.</em></h1>
        </div>
        <span className="status-chip"><ShieldCheck size={14} />{demo ? "Read-only demo" : "Administrator"}</span>
      </div>

      {demo && (
        <div className="notice">
          <ShieldCheck size={20} />
          <p>Operations preview with MongoDB integration. Sign in as an administrator to change live database records.</p>
        </div>
      )}

      <div className="admin-stats">
        <div><IndianRupee /><span>Paid revenue</span><strong>{formatPrice(orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + o.total, 0))}</strong></div>
        <div><Package /><span>Orders</span><strong>{orders.length}</strong></div>
        <div><ClipboardList /><span>Corporate enquiries</span><strong>{quotes.length}</strong></div>
        <div><Gift /><span>Catalogue gifts</span><strong>{products.length}</strong></div>
      </div>

      <p className="helper-text">Overview of database records: gifts, enquiries, orders, corporate clients and tickets.</p>

      <div className="admin-tabs" role="tablist" aria-label="Operations sections">
        {["products", "orders", "enquiries", "corporate", "tickets", "homepage", "insights"].map((value) => (
          <button
            role="tab"
            id={`tab-${value}`}
            aria-controls={`panel-${value}`}
            aria-selected={tab === value}
            className={tab === value ? "active" : ""}
            onClick={() => setTab(value)}
            key={value}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      {notice && <p className="notice" role="status">{notice}</p>}

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "insights" && <AnalyticsPanel summary={analytics} />}
        {tab === "homepage" && <HomepageEditor initial={homepage} demo={demo} />}

        {tab === "products" && (
          <div className="admin-products">
            <p className="notice">Manage catalogue gifts and stock levels directly in MongoDB. Toggle availability or update stock quantities below.</p>
            {products.map((product) => {
              const currentStock = productEdits[product.id]?.stock ?? product.stock ?? 100;
              const currentActive = productEdits[product.id]?.active ?? product.active ?? true;
              const hasChanged = productEdits[product.id] !== undefined;

              return (
                <article className="admin-product" key={product.id}>
                  <ProductImage product={product} sizes="100px" />
                  <div style={{ flex: 1 }}>
                    <h3>{product.name}</h3>
                    <p>{product.id} · {formatCataloguePrice(product)}{product.cataloguePrice === undefined ? "" : product.priceType === "starting" ? " starting price" : " catalogue reference"}</p>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "0.5rem", flexWrap: "wrap" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
                        Stock:
                        <input
                          type="number"
                          min={0}
                          max={100000}
                          value={currentStock}
                          onChange={(e) => handleProductStockChange(product.id, product.stock ?? 100, parseInt(e.target.value, 10) || 0, currentActive)}
                          style={{ width: "80px", padding: "0.2rem 0.4rem", border: "1px solid #ccc", borderRadius: "4px" }}
                        />
                      </label>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
                        <input
                          type="checkbox"
                          checked={currentActive}
                          onChange={(e) => handleProductActiveToggle(product.id, currentStock, e.target.checked)}
                        />
                        Active in store
                      </label>
                      {hasChanged && (
                        <button
                          disabled={busy === product.id}
                          className="button button-outline"
                          style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem" }}
                          onClick={() => update(product.id, { kind: "product", id: product.id, stock: currentStock, active: currentActive })}
                        >
                          {busy === product.id ? "Saving..." : "Save to DB"}
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="status-chip">{currentActive ? "Active" : "Hidden"}</span>
                </article>
              );
            })}
          </div>
        )}

        {tab === "orders" && (
          orders.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Fulfilment</th></tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.number}</td>
                      <td>{o.email}</td>
                      <td>{formatPrice(o.total)}</td>
                      <td>{o.paymentStatus}</td>
                      <td>
                        <span>{o.status}</span>
                        {o.paymentStatus === "PAID" && o.status !== "DELIVERED" && (
                          <button disabled={busy === o.id} className="text-button" onClick={() => update(o.id, { kind: "order", id: o.id, status: ({ CONFIRMED: "PROCESSING", PROCESSING: "SHIPPED", SHIPPED: "DELIVERED" } as const)[o.status as "CONFIRMED" | "PROCESSING" | "SHIPPED"] || "DELIVERED" })}>
                            Advance status
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Package size={32} />
              <h2>No existing orders.</h2>
              <p>This view displays orders saved in MongoDB. New gifting requests arrive in the enquiries tab.</p>
            </div>
          )
        )}

        {tab === "enquiries" && (
          quotes.length ? (
            <div className="admin-quotes">
              {quotes.map((q) => (
                <article className="admin-quote" key={q.id}>
                  <div>
                    <span className="eyebrow">{q.reference} · {q.occasion}</span>
                    <h3>{q.company}</h3>
                    <p>{q.name} · {q.email} · {q.phone}</p>
                    <p>{q.productName || "Bespoke collection"} · {q.quantity} gifts · Budget {formatPrice(q.budget * 100)} per gift · Delivery requested: {q.deliveryDate}</p>
                    <p>{q.locations} · Personalization: {q.personalization ? "Yes" : "No"}</p>
                    <p>{q.requirements || "No additional requirements."}</p>
                  </div>
                  <label>
                    Enquiry status
                    <select
                      value={q.status}
                      disabled={busy === q.id}
                      onChange={(e) => update(q.id, { kind: "quote", id: q.id, status: e.target.value })}
                    >
                      {["SUBMITTED", "UNDER_REVIEW", "QUOTE_SENT", "NEGOTIATION", "APPROVED", "REJECTED", "CONTACTED", "CLOSED"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ClipboardList size={32} />
              <h2>No corporate enquiries yet.</h2>
              <p>Corporate enquiries submitted via the storefront will appear here directly from MongoDB.</p>
            </div>
          )
        )}

        {tab === "corporate" && (
          corporateAccounts.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Company</th><th>Work Email</th><th>Mobile</th><th>GSTIN</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {corporateAccounts.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.companyName}</strong>{c.designation ? ` · ${c.designation}` : ""}</td>
                      <td>{c.workEmail}</td>
                      <td>{c.mobile}</td>
                      <td>{c.gstin || "—"}</td>
                      <td><span className="status-chip">{c.status}</span></td>
                      <td>
                        <select
                          value={c.status}
                          disabled={busy === c.id}
                          onChange={(e) => update(c.id, { kind: "corporate", id: c.id, status: e.target.value })}
                          style={{ padding: "0.2rem", fontSize: "0.85rem" }}
                        >
                          {["PENDING", "APPROVED", "REJECTED"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <ShieldCheck size={32} />
              <h2>No corporate accounts registered yet.</h2>
              <p>Corporate accounts created during bulk quotes or registration will be listed here from MongoDB.</p>
            </div>
          )
        )}

        {tab === "tickets" && (
          supportTickets.length ? (
            <div className="admin-quotes">
              {supportTickets.map((t) => (
                <article className="admin-quote" key={t.id}>
                  <div>
                    <span className="eyebrow">{t.ticketNumber} · {t.category} · Priority: {t.priority}</span>
                    <h3>{t.subject}</h3>
                    <p>{t.name} · {t.email} {t.phone ? `· ${t.phone}` : ""}</p>
                    <p style={{ marginTop: "0.5rem" }}>{t.message}</p>
                    <small style={{ color: "#777" }}>Received: {t.createdAt}</small>
                  </div>
                  <label>
                    Ticket status
                    <select
                      value={t.status}
                      disabled={busy === t.id}
                      onChange={(e) => update(t.id, { kind: "ticket", id: t.id, status: e.target.value })}
                    >
                      {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ClipboardList size={32} />
              <h2>No support tickets yet.</h2>
              <p>Customer inquiries and support requests submitted via the contact form will appear here from MongoDB.</p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
