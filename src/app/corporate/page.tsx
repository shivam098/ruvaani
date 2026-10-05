import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Building2, Gift, MapPin, PenLine, Users } from "lucide-react";
import { CorporateForm } from "@/components/corporate-form";
import { quotePrefillSchema } from "@/lib/validation";
import { contactNumbers } from "@/lib/brand";

export const metadata: Metadata = { title: "Corporate gifting, with a personal touch", description: "Curated corporate hampers, company branding and festive gifts. Request a RUVAANI quotation from 10 gifts." };
const process = [
  ["Select", "Choose your gifts, occasion and budget."],
  ["Customise", "Discuss packaging, branding and your message."],
  ["Approve", "Confirm the quotation and digital or sample presentation."],
  ["Produce", "Your approved gifting selection is prepared."],
  ["Deliver", "Delivery arrangements and timelines are confirmed with you."],
];

export default async function CorporatePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const prefill = quotePrefillSchema.safeParse(params);
  return <>
    <section className="corporate-hero wrap"><div><span className="eyebrow">THOUGHTFUL GIFTS. MEANINGFUL CONNECTIONS.</span><h1>Your people.<br /><em>Your signature.</em></h1><p>Curated products, considered customisation and beautiful packaging. Gifts that feel as personal as the relationships behind them.</p><a href="#enquiry" className="button button-primary">Create your gifting brief <ArrowDownRight size={18} /></a><div className="corporate-hero-note"><Users size={20} />Minimum enquiry: 10 gifts.</div></div><div className="corporate-hero-art catalogue-corporate-hero"><Image src="/catalogue/executive-corporate-hamper.webp" alt="Executive corporate hamper in RUVAANI's cream, emerald, gold and ruby presentation" fill sizes="(max-width: 760px) 90vw, 45vw" /></div></section>
    <section className="corporate-value-strip"><div className="wrap"><span><PenLine />Custom branding</span><span><Gift />Curated selections</span><span><MapPin />Delivery planning</span><span><Building2 />Premium presentation</span></div></section>
    <section className="section wrap"><div className="section-heading centered"><span className="eyebrow">FROM THE FIRST THOUGHT TO THE FINAL RIBBON</span><h2>Made meaningful, <em>together.</em></h2></div><div className="corporate-usecases">{[
      { title: "A warm welcome.", text: "Branded diaries, pens and everyday essentials.", image: "single-premium-box", href: "/products/single-premium-box" },
      { title: "A thoughtful thank-you.", text: "Curated hampers for clients, teams and partners.", image: "corporate-hamper", href: "/products/corporate-hamper" },
      { title: "A season to remember.", text: "Festive keepsakes, gourmet gifts and personal details.", image: "festive-collection", href: "/shop?category=Divine%20%26%20festive%20gifts" },
    ].map((item) => <Link className="corporate-usecase" href={item.href} key={item.title}><div className="usecase-photo"><Image src={`/catalogue/${item.image}.webp`} alt={item.text} fill sizes="(max-width: 760px) 40vw, 30vw" /></div><div><h3>{item.title}</h3><p>{item.text}</p><ArrowUpRight size={20} /></div></Link>)}</div></section>
    <section id="enquiry" className="enquiry-section"><div className="wrap enquiry-grid"><div className="enquiry-copy"><span className="eyebrow">LET&apos;S CREATE SOMETHING MEANINGFUL</span><h2>A thoughtful<br />partnership<br /><em>starts here.</em></h2><p>Tell us about your people and your plans. Your final quotation confirms contents, branding, availability, tax and delivery.</p><ol className="process-steps">{process.map(([title, text], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol><div className="enquiry-contact"><span className="eyebrow">PREFER A CONVERSATION?</span><div className="contact-numbers">{contactNumbers.map((phone) => <a href={`tel:+91${phone}`} key={phone}>+91 {phone}</a>)}</div></div><Link href="/faq" className="text-link">A few thoughtful answers <ArrowUpRight size={16} /></Link></div><div className="enquiry-form-card"><CorporateForm key={JSON.stringify(params)} initial={prefill.success ? prefill.data : {}} warning={prefill.success ? "" : "Some details in this enquiry link were invalid. Please choose your selection and quantities again."} /></div></div></section>
  </>;
}
