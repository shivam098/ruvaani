import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { contactNumbers, instagramUrl } from "@/lib/brand";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export function SiteFooter({ demo }: { demo: boolean }) {
  return (
    <>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <BrandLogo />
            <p>Not just a gift.<br />A feeling, beautifully wrapped.</p>
            <span className="footer-tagline">GIFTS THAT CREATE LASTING MOMENTS.</span>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "14px", fontSize: "11px", color: "var(--wine, #7d2638)", fontWeight: 500, textDecoration: "none" }}
              aria-label="RUVAANI on Instagram"
            >
              <InstagramIcon size={16} />
              <span>Follow on Instagram</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
          <div><h3>Discover RUVAANI</h3><Link href="/catalogue">View Catalogue</Link><Link href="/collections">Shop by Category</Link><Link href="/occasions">Shop by Occasion</Link><Link href="/festivals">Festival edits</Link><Link href="/shop">All gifts</Link></div>
          <div>
            <h3>A little about us</h3>
            <Link href="/about">Our story</Link>
            <Link href="/occasions/corporate">Corporate gifting</Link>
            <Link href="/contact">Get in touch</Link>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              Instagram <ArrowUpRight size={11} />
            </a>
            <Link href="/faq">FAQs</Link>
            <Link href="/account">Account &amp; existing orders</Link>
          </div>
          <div className="footer-contact"><h3>Something special in mind?</h3><p>From thoughtful team gifts to a festive celebration, let&apos;s make it meaningful.</p>{contactNumbers.map((phone) => <a href={`tel:+91${phone}`} key={phone}>+91 {phone}</a>)}<Link className="footer-cta" href="/contact">Let&apos;s talk gifting <ArrowUpRight size={18} /></Link><p className="demo-disclosure">Quote-only catalogue · No online checkout.{demo && <><br />Enquiry form is a preview. Call us to enquire.</>}</p></div>
        </div>
        <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} RUVAANI. Thoughtfully yours.</span><div><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link><Link href="/policies/shipping">Shipping</Link><Link href="/policies/returns">Returns</Link></div><span>Made with thought. Given with love.</span></div>
      </footer>
    </>
  );
}
