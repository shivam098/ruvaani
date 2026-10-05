import Link from "next/link";
import { ArrowUpRight, Gift, Leaf, PackageCheck, PenLine } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { contactNumbers } from "@/lib/brand";

export function SiteFooter({ demo }: { demo: boolean }) {
  return (
    <>
      <section className="promise-strip" aria-label="The RUVAANI promise"><div className="wrap promise-grid">
        <span><Gift />Thoughtfully curated</span><span><PenLine />Made a little more personal</span><span><PackageCheck />Beautifully presented</span><span><Leaf />Considered, down to the details</span>
      </div></section>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div className="footer-brand"><BrandLogo /><p>Not just a gift.<br />A feeling, beautifully wrapped.</p><span className="footer-tagline">GIFTS THAT CREATE LASTING MOMENTS.</span></div>
          <div><h3>Find your thoughtful</h3><Link href="/shop">The collection</Link><Link href="/shop?category=Curated%20hampers">Curated hampers</Link><Link href="/shop?personalized=true">Personalized gifts</Link><Link href="/shop?category=Divine%20%26%20festive%20gifts">Festive keepsakes</Link><Link href="/gift-finder">The gift finder</Link></div>
          <div><h3>A little about us</h3><Link href="/about">Our story</Link><Link href="/corporate">Corporate gifting</Link><Link href="/contact">Get in touch</Link><Link href="/faq">FAQs</Link><Link href="/account">My orders</Link></div>
          <div className="footer-contact"><h3>Something special in mind?</h3><p>From thoughtful team gifts to a festive celebration, let&apos;s make it meaningful.</p>{contactNumbers.map((phone) => <a href={`tel:+91${phone}`} key={phone}>+91 {phone}</a>)}<Link className="footer-cta" href="/contact">Let&apos;s talk gifting <ArrowUpRight size={18} /></Link><p className="demo-disclosure">Quote-only catalogue · No online checkout.{demo && <><br />Enquiry form is a preview. Call us to enquire.</>}</p></div>
        </div>
        <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} RUVAANI. Thoughtfully yours.</span><div><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link><Link href="/policies/shipping">Shipping</Link><Link href="/policies/returns">Returns</Link></div><span>Made with thought. Given with love.</span></div>
      </footer>
    </>
  );
}
