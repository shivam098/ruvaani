import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { contactNumbers } from "@/lib/brand";

export function SiteFooter({ demo }: { demo: boolean }) {
  return (
    <>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div className="footer-brand"><BrandLogo /><p>Not just a gift.<br />A feeling, beautifully wrapped.</p><span className="footer-tagline">GIFTS THAT CREATE LASTING MOMENTS.</span></div>
          <div><h3>Discover RUVAANI</h3><Link href="/catalogue">View Catalogue</Link><Link href="/collections">Shop by Category</Link><Link href="/occasions">Shop by Occasion</Link><Link href="/festivals">Festival edits</Link><Link href="/shop">All gifts</Link></div>
          <div><h3>A little about us</h3><Link href="/about">Our story</Link><Link href="/occasions/corporate">Corporate gifting</Link><Link href="/contact">Get in touch</Link><Link href="/faq">FAQs</Link><Link href="/account">Account &amp; existing orders</Link></div>
          <div className="footer-contact"><h3>Something special in mind?</h3><p>From thoughtful team gifts to a festive celebration, let&apos;s make it meaningful.</p>{contactNumbers.map((phone) => <a href={`tel:+91${phone}`} key={phone}>+91 {phone}</a>)}<Link className="footer-cta" href="/contact">Let&apos;s talk gifting <ArrowUpRight size={18} /></Link><p className="demo-disclosure">Quote-only catalogue · No online checkout.{demo && <><br />Enquiry form is a preview. Call us to enquire.</>}</p></div>
        </div>
        <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} RUVAANI. Thoughtfully yours.</span><div><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link><Link href="/policies/shipping">Shipping</Link><Link href="/policies/returns">Returns</Link></div><span>Made with thought. Given with love.</span></div>
      </footer>
    </>
  );
}
