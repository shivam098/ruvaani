"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Gift, LockKeyhole, ShieldCheck } from "lucide-react";
import { addressSchema } from "@/lib/validation";
import { calculateCart, formatPrice } from "@/lib/commerce";
import { apiRequest } from "@/lib/client-api";
import { completePayment, loadRazorpay, type PaymentOrder } from "@/lib/payment-client";
import type { Address, UserView } from "@/lib/types";
import { useStore } from "./store-provider";

export function Checkout({ user }: { user: UserView | null }) {
  const store = useStore();
  const [address, setAddress] = useState<Address>({ name: user?.name ?? "", email: user?.email ?? "", phone: "", line1: "", city: "", state: "", pincode: "" });
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const attempt = useRef<{ payload: string; key: string } | null>(null);
  let totals;
  let cartError = "";
  if (store.cart.length) {
    try { totals = calculateCart(store.cart, store.products); }
    catch (e) { cartError = e instanceof Error ? e.message : "Please review your bag."; }
  }
  function update(key: keyof Address, value: string) { setAddress((a) => ({ ...a, [key]: value })); }

  async function pay() {
    if (store.demo) { setResult("DEMO"); return; }
    setBusy(true); setError("");
    try {
      const payload = JSON.stringify({ items: store.cart, address });
      if (!attempt.current || attempt.current.payload !== payload) attempt.current = { payload, key: crypto.randomUUID() };
      await loadRazorpay();
      const order = await apiRequest<PaymentOrder>("/api/checkout", { items: store.cart, address, idempotencyKey: attempt.current.key });
      const number = await completePayment(order, { name: address.name, email: address.email, contact: address.phone });
      setResult(number); store.clear();
    } catch (e) { setError(e instanceof Error ? e.message : "Checkout is unavailable. Check My orders before paying again."); }
    finally { setBusy(false); }
  }

  if (result) return <section className="wrap checkout-success empty-state"><span className="success-mark"><Check size={30} /></span><span className="eyebrow">{store.demo ? "YOU'VE REACHED THE END OF THE PREVIEW" : "A LITTLE JOY IS ON ITS WAY"}</span><h1>{store.demo ? "A lovely little preview." : "Your thoughtful moment is confirmed."}</h1><p>{store.demo ? "No order was placed, no payment was collected, and your address was not saved or sent. Your gift bag is still here." : `Thank you. Your payment is verified and order ${result} is confirmed.`}</p><Link className="button button-primary" href={store.demo ? "/shop" : "/account"}>{store.demo ? "Keep exploring" : "View my orders"}<ArrowRight size={17} /></Link></section>;
  if (!store.cart.length || cartError) return <section className="empty-state wrap"><Gift size={32} /><h1>{cartError || "Your bag is waiting for a little joy."}</h1><Link className="button button-primary" href="/cart">Back to your bag</Link></section>;
  if (!store.demo && !user) return <section className="empty-state wrap"><LockKeyhole size={32} /><h1>Make this thoughtful moment yours.</h1><p>Please sign in to keep your order details safe.</p><Link className="button button-primary" href="/account?next=checkout">Sign in to continue <ArrowRight size={17} /></Link></section>;
  return <div className="wrap checkout-layout"><div>
    {store.demo && <div className="notice"><ShieldCheck size={20} /><p><strong>Demo checkout.</strong> Use sample details only. Nothing is submitted or saved, and no payment will be collected.</p></div>}
    <div className="checkout-steps"><span className={step === 1 ? "active" : "complete"}><b>{step > 1 ? <Check size={13} /> : "1"}</b> The destination</span><span className={step === 2 ? "active" : ""}><b>2</b> The little details</span></div>
    {step === 1 ? <form className="form-card" onSubmit={(e) => { e.preventDefault(); const parsed = addressSchema.safeParse(address); if (!parsed.success) { setError(parsed.error.issues[0].message); return; } setAddress(parsed.data); setError(""); setStep(2); }}>
      <span className="eyebrow">WHERE SHOULD THE JOY GO?</span><h2>A happy doorstep.</h2>
      <div className="form-grid">
        <label>Recipient&apos;s full name<input autoComplete="shipping name" value={address.name} onChange={(e) => update("name", e.target.value)} required minLength={2} maxLength={100} /></label>
        <label>Email address<input type="email" autoComplete="email" value={address.email} onChange={(e) => update("email", e.target.value)} required /></label>
        <label>Mobile number<input type="tel" autoComplete="shipping tel-national" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit Indian number" value={address.phone} onChange={(e) => update("phone", e.target.value)} required /></label>
        <label>Pincode<input autoComplete="shipping postal-code" inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} value={address.pincode} onChange={(e) => update("pincode", e.target.value)} required /></label>
        <label className="span-two">Delivery address<input autoComplete="shipping street-address" value={address.line1} onChange={(e) => update("line1", e.target.value)} required minLength={8} maxLength={250} placeholder="House / office, street, area" /></label>
        <label>City<input autoComplete="shipping address-level2" value={address.city} onChange={(e) => update("city", e.target.value)} required minLength={2} maxLength={100} /></label>
        <label>State<input autoComplete="shipping address-level1" value={address.state} onChange={(e) => update("state", e.target.value)} required minLength={2} maxLength={100} /></label>
      </div><p className="helper-text">India delivery only. For multiple recipients, <Link href="/corporate">talk to our corporate gifting team</Link>.</p>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" className="button button-primary">Review my thoughtful details <ArrowRight size={17} /></button>
    </form> : <div className="form-card"><span className="eyebrow">ONE LAST LITTLE LOOK</span><h2>Everything, just right.</h2><div className="address-review"><Gift size={23} /><div><strong>{address.name}</strong><p>{address.line1}<br />{address.city}, {address.state} · {address.pincode}<br />{address.phone}<br />{address.email}</p></div><button className="text-button" disabled={busy} onClick={() => setStep(1)}>Edit</button></div><p className="helper-text">By continuing, you agree to our <Link href="/policies/terms">terms</Link> and <Link href="/policies/privacy">privacy information</Link>.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary full-width" disabled={busy} onClick={pay}>{busy ? "Opening your secure payment..." : store.demo ? "Complete demo preview" : `Pay ${formatPrice(totals!.total)} securely`}<LockKeyhole size={17} /></button>{!store.demo && <p className="secure-note">Payment status is verified on our server. If verification is pending, check My orders before paying again.</p>}</div>}
    <Link className="text-link checkout-back" href="/cart"><ArrowLeft size={15} />Back to your bag</Link>
  </div><aside className="order-summary"><span className="eyebrow">CHOSEN WITH THOUGHT</span><h2>A bag of good feelings.</h2>{totals?.items.map((item, i) => <div className="summary-line" key={i}><span>{item.name}<small>Quantity {item.quantity}{item.personalization.name ? ` · For ${item.personalization.name}` : ""}</small></span><strong>{formatPrice(item.unitPrice * item.quantity)}</strong></div>)}<div className="summary-row"><span>Shipping</span><span>{totals?.shipping ? formatPrice(totals.shipping) : "Complimentary"}</span></div><div className="summary-total"><span>Total</span><strong>{formatPrice(totals!.total)}</strong></div><p className="tax-note">Inclusive of taxes and a whole lot of thought.</p>{store.demo && <span className="demo-inline">Preview only · Not a real order</span>}</aside></div>;
}
