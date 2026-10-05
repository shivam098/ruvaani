"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Gift, LayoutDashboard, LogOut, Package, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { completePayment, type PaymentOrder, type PaymentPrefill } from "@/lib/payment-client";
import { formatPrice } from "@/lib/commerce";
import type { OrderView, UserView } from "@/lib/types";
import { useStore } from "./store-provider";

export function Account({ user, orders, next }: { user: UserView | null; orders: OrderView[]; next?: string }) {
  const { demo } = useStore();
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest(`/api/auth/${register ? "register" : "login"}`, { email: form.get("email"), password: form.get("password"), ...(register ? { name: form.get("name") } : {}) });
      router.push(next === "checkout" ? "/corporate#enquiry" : "/account"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Sign-in is unavailable. Please try again."); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError("");
    try { await apiRequest("/api/auth/logout", {}); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to sign out."); }
    finally { setBusy(false); }
  }
  async function resumeOrder(id: string) {
    setBusy(true); setError("");
    try {
      const result = await apiRequest<{ paid: true } | ({ paid: false; prefill: PaymentPrefill } & PaymentOrder)>(`/api/orders/${id}/payment`, {});
      if (!result.paid) await completePayment(result, result.prefill);
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Payment is unavailable. Check your order before paying again."); }
    finally { setBusy(false); }
  }
  if (user) return <section className="wrap account-dashboard section"><div className="section-heading"><div><span className="eyebrow">YOUR LITTLE CORNER OF RUVAANI</span><h1>Hello, <em>{user.name.split(" ")[0]}.</em></h1><p>All your thoughtful moments, in one place.</p></div><div className="account-actions">{user.role === "ADMIN" && <Link href="/admin" className="button button-outline"><LayoutDashboard size={16} />Operations</Link>}<button className="text-link" disabled={busy} onClick={logout}><LogOut size={16} />Sign out</button></div></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="account-stats"><div><Package /><span>Your orders</span><strong>{orders.length}</strong></div><div><Gift /><span>Thoughtfully spent</span><strong>{formatPrice(orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + o.total, 0))}</strong></div></div><h2>Your thoughtful moments</h2>{orders.length ? <div className="orders-list">{orders.map((order) => <article key={order.id} className="order-card"><div className="order-card-heading"><div><strong>{order.number}</strong><span>{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span></div><span className="status-chip">{order.status.replaceAll("_", " ")}</span></div>{order.items.map((item, i) => <p key={i}>{item.name} <span>× {item.quantity}</span>{item.personalization?.name && <small>For {item.personalization.name}</small>}</p>)}<div className="order-card-footer"><span>{order.paymentStatus === "PAID" ? "Payment verified" : "Payment not confirmed"}</span><strong>{formatPrice(order.total)}</strong></div>{order.paymentStatus === "PAYMENT_PENDING" && <div><p className="helper-text">This resumes the existing order without reserving stock again. Any captured payment is checked before reopening checkout.</p><button className="button button-outline" disabled={busy} onClick={() => resumeOrder(order.id)}>{busy ? "Checking your payment..." : "Check / resume payment"}<ArrowRight size={15} /></button></div>}</article>)}</div> : <div className="empty-state"><Gift size={35} /><h3>Your story is just beginning.</h3><p>No existing orders. Our current collection is available by quotation.</p><Link className="button button-primary" href="/shop">Discover something lovely <ArrowRight size={17} /></Link></div>}</section>;
  return <section className="wrap auth-layout"><div className="auth-story"><span className="eyebrow">A PLACE FOR YOUR THOUGHTFUL MOMENTS</span><h1>A little hello.<br /><em>A lovely beginning.</em></h1><p>Your favorite gifts. Your special people.<br />All the thoughtful details, in one place.</p><Gift size={100} strokeWidth={.6} /><span>THOUGHTFULLY YOURS. ALWAYS.</span></div><div className="auth-card"><span className="eyebrow">{register ? "LET'S GET TO KNOW YOU" : "IT'S LOVELY TO SEE YOU"}</span><h2>{register ? "Make yourself at home." : "Welcome back."}</h2><p>{register ? "A few little details to start your RUVAANI story." : "Sign in to your little corner of RUVAANI."}</p>{demo && <div className="notice"><ShieldCheck size={20} /><p><strong>Demo mode.</strong> Account creation and sign-in are disabled. Connect MongoDB and turn off demo mode to enable secure accounts.</p></div>}<form onSubmit={submit}>{register && <label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={80} required disabled={demo} /></label>}<label>Email address<input name="email" type="email" autoComplete="email" required disabled={demo} /></label><label>Password<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={12} maxLength={128} disabled={demo} /></label><p className="helper-text">Use at least 12 characters. Never reuse a password from another service.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary full-width" disabled={busy || demo}>{busy ? "Just a little moment..." : register ? "Create my account" : "Sign in"}<ArrowRight size={17} /></button></form><p className="auth-switch">{register ? "Already part of the story?" : "New to RUVAANI?"} <button onClick={() => { setRegister(!register); setError(""); }}>{register ? "Sign in" : "Make yourself at home"}</button></p>{demo && <Link className="text-link" href="/admin">Explore the demo operations view <ArrowRight size={15} /></Link>}</div></section>;
}
