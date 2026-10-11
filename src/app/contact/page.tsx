import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Gift, MapPin, Phone } from "lucide-react";
import { contactNumbers, instagramUrl } from "@/lib/brand";

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export const metadata: Metadata = { title: "Let's create something meaningful", description: "Contact RUVAANI for corporate gifts, festive hampers, wedding gifting and customised presentation." };
export default function ContactPage() {
  return <section className="wrap contact-page section"><div className="page-heading centered"><span className="eyebrow">GOOD THINGS START WITH A LITTLE HELLO</span><h1>Let&apos;s talk <em>thoughtful.</em></h1><p>Your people. Your occasion. Your next meaningful gesture.<br />Let&apos;s create something memorable together.</p></div><div className="contact-grid">
    <article><Phone size={30} strokeWidth={1.2} /><h2>A little conversation.</h2><p>Call us about your gifting ideas, catalogue selections or a bespoke quotation.</p><div className="contact-numbers">{contactNumbers.map((number) => <a href={`tel:+91${number}`} key={number}>+91 {number}</a>)}</div></article>
    <article><Gift size={30} strokeWidth={1.2} /><h2>A thoughtful brief.</h2><p>Share your selection, quantity, budget, branding and delivery plans. Enquiries start at 10 gifts.</p><Link className="text-link" href="/corporate#enquiry">Start your gifting brief <ArrowUpRight size={16} /></Link><a className="text-link" href={instagramUrl} target="_blank" rel="noopener noreferrer"><InstagramIcon size={17} />Follow RUVAANI on Instagram <ArrowUpRight size={16} /></a></article>
    <article><MapPin size={30} strokeWidth={1.2} /><h2>Find us in Bhopal.</h2><p>Rolta Incubation Centre<br />Room No. 1, MANIT<br />Bhopal, Madhya Pradesh</p><Link className="text-link" href="/about">The thought behind RUVAANI <ArrowUpRight size={16} /></Link></article>
  </div></section>;
}
