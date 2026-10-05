"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, Send } from "lucide-react";
import { quoteSchema, type QuotePrefill } from "@/lib/validation";
import { catalogueProducts, occasions } from "@/lib/catalog-data";
import { contactNumbers } from "@/lib/brand";
import { apiRequest } from "@/lib/client-api";
import { useStore } from "./store-provider";

export function CorporateForm({ initial = {}, warning = "" }: { initial?: QuotePrefill; warning?: string }) {
  const { demo } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [quantity, setQuantity] = useState(initial.quantity ?? 10);
  const [productId, setProductId] = useState(initial.product ?? "");
  const [budget, setBudget] = useState(initial.budget ?? (catalogueProducts.find((product) => product.id === initial.product)?.cataloguePrice ?? 149900) / 100);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget);
    const data = quoteSchema.safeParse({
      name: form.get("name"), company: form.get("company"), email: form.get("email"), phone: form.get("phone"),
      occasion: form.get("occasion"), quantity, budget, productId, deliveryDate: form.get("deliveryDate"),
      locations: form.get("locations"), personalization: form.get("personalization") === "on",
      requirements: form.get("requirements"), consent: form.get("consent") === "on",
    });
    if (!data.success) { setError(data.error.issues[0].message); return; }
    if (demo) { setReference("DEMO"); return; }
    setBusy(true);
    try { const result = await apiRequest<{ reference: string }>("/api/quotes", data.data); setReference(result.reference); }
    catch (e) { setError(e instanceof Error ? e.message : "We could not save your enquiry. Please try again."); }
    finally { setBusy(false); }
  }
  if (reference) return <div className="quote-success"><span className="success-mark"><Check size={30} /></span><h2>{demo ? "Your thoughtful brief looks lovely." : "A thoughtful beginning."}</h2><p>{demo ? "This was a form preview. Your enquiry was not sent or saved, and no one will contact you from this demo. Call our team to discuss your brief." : `Your enquiry has been saved. Your reference is ${reference}. Our team can now review your gifting brief.`}</p>{demo && <div className="contact-numbers">{contactNumbers.map((phone) => <a href={`tel:+91${phone}`} key={phone}>+91 {phone}</a>)}</div>}<button className="button button-outline" onClick={() => setReference("")}>Start another brief <ArrowUpRight size={17} /></button></div>;
  return <form className="corporate-form" onSubmit={submit}>
    {demo && <div className="notice"><Send size={18} /><p><strong>Enquiry form preview.</strong> Use sample details. This form is not sent or saved yet. For a real enquiry, <a href="/contact">call our team</a>.</p></div>}
    {warning && <p className="form-error" role="alert">{warning}</p>}
    <div className="form-grid">
      <label className="span-two">Your catalogue selection<select name="product" value={productId} onChange={(event) => { setProductId(event.target.value); const selected = catalogueProducts.find((product) => product.id === event.target.value); if (selected?.cataloguePrice) setBudget(selected.cataloguePrice / 100); }}><option value="">A bespoke collection / not decided yet</option>{catalogueProducts.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select></label>
      <label>Your full name<input name="name" autoComplete="name" placeholder="Full name" required minLength={2} maxLength={100} /></label>
      <label>Company name<input name="company" autoComplete="organization" placeholder="Company or organisation" required minLength={2} maxLength={150} /></label>
      <label>Work email<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength={254} /></label>
      <label>Mobile number<input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit Indian number" required pattern="[6-9][0-9]{9}" maxLength={10} /></label>
      <label htmlFor="enquiry-occasion">The occasion<select id="enquiry-occasion" name="occasion" aria-label="The occasion" required defaultValue={initial.occasion ?? ""}><option value="" disabled>What are we celebrating?</option>{occasions.map((occasion) => <option key={occasion}>{occasion}</option>)}<option>Something else</option></select></label>
      <label>Number of gifts<input name="quantity" type="number" min={10} max={100000} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required /></label>
      <label>Budget per gift (₹)<input name="budget" type="number" min={299} max={1000000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} required /></label>
      <label>Your ideal delivery date<input name="deliveryDate" type="date" min={new Date().toISOString().slice(0, 10)} required /></label>
      <label className="span-two">Delivery locations<input name="locations" placeholder="City, office or multiple destinations" required minLength={2} maxLength={500} /></label>
      <label className="span-two">Anything else we should know?<textarea name="requirements" rows={3} maxLength={2000} defaultValue={initial.recipient ? `Gifts for: ${initial.recipient}.` : ""} placeholder="Your brand, their interests, a special little detail..." /></label>
    </div>
    <label className="checkbox-label"><input type="checkbox" name="personalization" defaultChecked />I&apos;d love to include our branding or a personal message.</label>
    <div className="quote-estimate"><span>Your starting gift budget</span><strong>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(quantity * budget)}</strong><small>Planning estimate only. Your final quote includes confirmed customization, tax and delivery.</small></div>
    <label className="checkbox-label consent"><input name="consent" type="checkbox" required /><span>I agree to be contacted about this gifting enquiry. See how my details are handled in the <Link href="/policies/privacy">privacy information</Link>.</span></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary full-width" disabled={busy}>{busy ? "Sending enquiry..." : demo ? "Preview my gifting enquiry" : "Send quote enquiry"}<ArrowUpRight size={18} /></button>
    <p className="form-footnote">{demo ? "Preview only. No real enquiry is created." : "This is an enquiry, not a confirmed order or price commitment."}</p>
  </form>;
}
