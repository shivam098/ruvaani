import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Flower2, Gift, Heart, Package, PenLine, Sparkles, Users } from "lucide-react";
import { getProducts } from "@/lib/catalog";
import { quoteHref } from "@/lib/catalog-data";
import { ProductCard } from "@/components/product-card";

const collections = [
  { label: "Curated hampers", category: "Curated hampers", icon: Gift, color: "sand", detail: "Good things, beautifully together" },
  { label: "Festive keepsakes", category: "Divine & festive gifts", icon: Flower2, color: "sage", detail: "Light, blessings & celebration" },
  { label: "Corporate essentials", category: "Corporate essentials", icon: PenLine, color: "rose", detail: "Your identity in every detail" },
  { label: "Gourmet delights", category: "Gourmet & festive delights", icon: Package, color: "butter", detail: "A thoughtful taste of joy" },
  { label: "Finishing touches", category: "Branding & presentation", icon: Sparkles, color: "olive", detail: "Beautifully, unmistakably yours" },
];

export default async function Home() {
  const products = await getProducts();
  return <>
    <section className="premium-hero">
      <div className="wrap premium-hero-grid">
        <div className="premium-hero-copy">
          <h1>Gifts that create<br /><em>lasting moments.</em></h1>
          <p>Considered gifts. Beautiful details.<br />For your people, your celebrations, and everything worth remembering.</p>
          <div className="premium-hero-actions"><Link href="/shop" className="button button-primary">Explore the collection <ArrowUpRight size={18} /></Link><Link href="/corporate#enquiry" className="text-link">Create a bespoke gift <ArrowRight size={17} /></Link></div>
          <div className="premium-hero-signature"><span />Thoughtfully crafted. Beautifully gifted.</div>
        </div>
        <figure className="premium-hero-figure">
          <div className="premium-hero-frame"><Image src="/catalogue/single-premium-box.webp" alt="RUVAANI's cream gift box with emerald diary, branded tumbler, indoor plant and ruby ribbon" fill preload sizes="(max-width: 760px) 90vw, 44vw" className="hero-photo" /></div>
          <figcaption><span>THE ART OF A THOUGHTFUL GESTURE</span><Link href="/products/single-premium-box" aria-label="Discover the Single Premium Box"><ArrowUpRight size={19} /></Link></figcaption>
        </figure>
      </div>
    </section>
    <section className="gifting-moments wrap" aria-label="Gifting occasions">
      <Link href="/corporate"><Users size={22} strokeWidth={1.2} /><span>Corporate gifting</span><ArrowUpRight size={15} /></Link>
      <Link href={quoteHref({ occasion: "Weddings" })}><Heart size={22} strokeWidth={1.2} /><span>Wedding gifting</span><ArrowUpRight size={15} /></Link>
      <Link href={quoteHref({ occasion: "Diwali" })}><Sparkles size={22} strokeWidth={1.2} /><span>Occasions & hampers</span><ArrowUpRight size={15} /></Link>
    </section>
    <section id="diwali" className="festival-highlight wrap" aria-labelledby="diwali-heading">
      <div className="festival-copy">
        <span className="festival-label"><Sparkles size={17} aria-hidden="true" />THE DIWALI EDIT</span>
        <h2 id="diwali-heading">Light up their <em>Diwali.</em></h2>
        <p>Thoughtful hampers, festive keepsakes and personal details for the people who make your year brighter.</p>
        <div className="festival-actions">
          <Link href="/shop?category=Divine%20%26%20festive%20gifts" className="button button-light">Explore festive gifts <ArrowUpRight size={17} /></Link>
          <Link href={quoteHref({ occasion: "Diwali" })} className="text-link">Plan your Diwali gifting <ArrowRight size={17} /></Link>
        </div>
        <span className="festival-note">From 10 gifts. Made personal, together.</span>
      </div>
      <div className="festival-image"><Image src="/catalogue/festive-collection.webp" alt="Festive hampers, a glowing diya and gold-ribbon gift boxes from the RUVAANI catalogue" fill sizes="(max-width: 760px) 100vw, 45vw" /></div>
    </section>
    <section className="section wrap signature-section">
      <div className="section-heading"><div><span className="eyebrow">THE SIGNATURE COLLECTION</span><h2>A little more <em>extraordinary.</em></h2></div><Link href="/shop?category=Curated%20hampers" className="text-link">Discover our hampers <ArrowRight size={17} /></Link></div>
      <p className="collection-intro">Three considered collections, each with room for your own signature.</p>
      <div className="product-grid signature-grid">{products.filter((product) => product.featured).map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
    <section className="section wrap categories-section">
      <div className="section-heading"><div><span className="eyebrow">MAKE IT MEANINGFUL</span><h2>Your gift. <em>Your kind of thoughtful.</em></h2></div><Link href="/shop" className="text-link">The complete edit <ArrowRight size={17} /></Link></div>
      <div className="category-grid">{collections.map(({ label, category, icon: Icon, color, detail }) => <Link className={`category-card ${color}`} key={category} href={`/shop?category=${encodeURIComponent(category)}`}><div className="category-icon"><Icon size={31} strokeWidth={1.15} /></div><h3>{label}</h3><p>{detail}</p><ArrowUpRight className="category-arrow" size={16} /></Link>)}</div>
      <p className="catalogue-footnote">A first look at our growing catalogue. More collections will follow.</p>
    </section>
    <section className="section wrap">
      <div className="corporate-feature">
        <div className="corporate-photo"><Image src="/catalogue/executive-corporate-hamper.webp" alt="RUVAANI executive hamper with branded gifts, golden details and a ruby ribbon" fill sizes="(max-width: 760px) 90vw, 45vw" /></div>
        <div className="corporate-feature-copy"><span className="eyebrow">YOUR BRAND. THEIR MOMENT.</span><h2>Appreciation,<br /><em>beautifully expressed.</em></h2><p>For the people behind your business. Thoughtful hampers, branded essentials and presentation tailored to your occasion.</p><div className="corporate-benefits"><span><Check />From 10 gifts</span><span><Check />Custom branding</span><span><Check />Curated to your brief</span><span><Check />Presentation options</span></div><Link href="/corporate#enquiry" className="button button-light">Let&apos;s create something meaningful <ArrowUpRight size={18} /></Link><p className="corporate-footnote">Select. Customise. Approve. Produce. Deliver.</p></div>
      </div>
    </section>
    <section className="finder-banner wrap"><div className="finder-stars"><Sparkles size={45} strokeWidth={1} /></div><div><span className="eyebrow">A LITTLE GUIDANCE. A LOT OF HEART.</span><h2>Not sure where to begin?</h2><p>Start with your people and your occasion. We&apos;ll help shape the brief.</p></div><Link href="/gift-finder" className="button button-primary">Find your thoughtful <ArrowUpRight size={18} /></Link></section>
    <section className="brand-note wrap"><Image src="/brand/monogram.webp" alt="" width={86} height={79} className="brand-note-monogram" /><span className="eyebrow">THE THOUGHT BEHIND RUVAANI</span><h2>More than a gift.<br /><em>A meaningful connection.</em></h2><p>Premium experiences begin with a little thought.<br />A carefully chosen gift, a personal detail, a beautifully tied ribbon.<br />Something that says: you matter.</p><Link href="/about" className="text-link">Discover our story <ArrowRight size={17} /></Link></section>
  </>;
}
