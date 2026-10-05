import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Gift, MapPin, MessageCircle, Phone } from "lucide-react";
import { contactNumbers } from "@/lib/brand";
export const metadata: Metadata = { title: "Let's create something meaningful", description: "Contact RUVAANI for corporate gifts, festive hampers, wedding gifting and customised presentation." };
export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsapp = phone && /^\d{10,15}$/.test(phone) ? `https://wa.me/${phone}` : null;
  return <section className="wrap contact-page section"><div className="page-heading centered"><span className="eyebrow">GOOD THINGS START WITH A LITTLE HELLO</span><h1>Let&apos;s talk <em>thoughtful.</em></h1><p>Your people. Your occasion. Your next meaningful gesture.<br />Let&apos;s create something memorable together.</p></div><div className="contact-grid">
    <article><Phone size={30} strokeWidth={1.2} /><h2>A little conversation.</h2><p>Call us about your gifting ideas, catalogue selections or a bespoke quotation.</p><div className="contact-numbers">{contactNumbers.map((number) => <a href={`tel:+91${number}`} key={number}>+91 {number}</a>)}</div></article>
    <article><Gift size={30} strokeWidth={1.2} /><h2>A thoughtful brief.</h2><p>Share your selection, quantity, budget, branding and delivery plans. Enquiries start at 10 gifts.</p><Link className="text-link" href="/corporate#enquiry">Start your gifting brief <ArrowUpRight size={16} /></Link>{whatsapp && <a className="text-link" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} />Chat on WhatsApp <ArrowUpRight size={16} /></a>}</article>
    <article><MapPin size={30} strokeWidth={1.2} /><h2>Find us in Bhopal.</h2><p>Rolta Incubation Centre<br />Room No. 1, MANIT<br />Bhopal, Madhya Pradesh</p><Link className="text-link" href="/about">The thought behind RUVAANI <ArrowUpRight size={16} /></Link></article>
  </div></section>;
}
