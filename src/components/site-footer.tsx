import Link from "next/link";
import { ArrowUpRight, Gift, Leaf, PackageCheck, PenLine } from "lucide-react";

export function SiteFooter({ demo }: { demo: boolean }) {
  return (
    <>
      <section className="promise-strip" aria-label="The RUVAANI promise"><div className="wrap promise-grid">
        <span><Gift />Thoughtfully curated</span><span><PenLine />Made a little more personal</span><span><PackageCheck />Beautifully presented</span><span><Leaf />Considered, down to the details</span>
      </div></section>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div className="footer-brand"><Link href="/" className="wordmark">ruvaani</Link><p>Not just a gift.<br />A feeling, beautifully wrapped.</p><span className="footer-tagline">GIFTS THAT CREATE LASTING MOMENTS.</span></div>
          <div><h3>Find your thoughtful</h3><Link href="/shop">All gifts</Link><Link href="/shop?category=Hampers">Gift hampers</Link><Link href="/shop?personalized=true">Personalized gifts</Link><Link href="/shop?occasion=Diwali">Festive collections</Link><Link href="/gift-finder">The gift finder</Link></div>
          <div><h3>A little about us</h3><Link href="/about">Our story</Link><Link href="/corporate">Corporate gifting</Link><Link href="/contact">Get in touch</Link><Link href="/faq">FAQs</Link><Link href="/account">My orders</Link></div>
          <div className="footer-contact"><h3>Something special in mind?</h3><p>From a single thank-you to a whole team celebration, let&apos;s make it meaningful.</p><Link className="footer-cta" href="/contact">Let&apos;s talk gifting <ArrowUpRight size={18} /></Link>{demo && <p className="demo-disclosure"><span className="status-dot" />Demo store · Illustrative products<br />No real payments or orders.</p>}</div>
        </div>
        <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} RUVAANI. Thoughtfully yours.</span><div><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link><Link href="/policies/shipping">Shipping</Link><Link href="/policies/returns">Returns</Link></div><span>Made with thought. Given with love.</span></div>
      </footer>
    </>
  );
}
