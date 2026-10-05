import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Flower2, Gift, Heart, Package, PenLine, Sparkles, Users } from "lucide-react";
import { getProducts } from "@/lib/catalog";
import { quoteHref } from "@/lib/catalog-data";
import { ProductCard } from "@/components/product-card";
import { EventHighlight } from "@/components/event-highlight";
import { getHomepageSettings } from "@/lib/homepage-settings";

const collections = [
  { label: "Curated hampers", category: "Curated hampers", icon: Gift, color: "sand", detail: "Good things, beautifully together" },
  { label: "Festive keepsakes", category: "Divine & festive gifts", icon: Flower2, color: "sage", detail: "Light, blessings & celebration" },
  { label: "Corporate essentials", category: "Corporate essentials", icon: PenLine, color: "rose", detail: "Your identity in every detail" },
  { label: "Gourmet delights", category: "Gourmet & festive delights", icon: Package, color: "butter", detail: "A thoughtful taste of joy" },
  { label: "Finishing touches", category: "Branding & presentation", icon: Sparkles, color: "olive", detail: "Beautifully, unmistakably yours" },
];

export default async function Home() {
  const [products, homepage] = await Promise.all([getProducts(), getHomepageSettings()]);
  const SloganHeading = homepage.content.event.enabled ? "h2" : "h1";
  return <>
    <EventHighlight event={homepage.content.event} />
    <section className="premium-hero">
      <div className="wrap premium-hero-grid">
        <div className="premium-hero-copy">
          <SloganHeading>Gifts that create<br /><em>lasting moments.</em></SloganHeading>
          <p>Personalised gifts for teams, weddings and celebrations. Start with 10 gifts.</p>
          <div className="premium-hero-actions"><Link href="/shop" className="button button-primary">Explore the collection <ArrowUpRight size={18} /></Link><Link href="/corporate#enquiry" className="text-link">Request a custom quote <ArrowRight size={17} /></Link></div>
          <div className="premium-hero-signature"><span />Thoughtfully crafted. Beautifully gifted.</div>
        </div>
        <figure className="premium-hero-figure">
          <div className="premium-hero-frame"><Image src="/catalogue/single-premium-box.webp" alt="RUVAANI's cream gift box with emerald diary, branded tumbler, indoor plant and ruby ribbon" fill preload={!homepage.content.event.enabled} sizes="(max-width: 760px) 90vw, 44vw" className="hero-photo" /></div>
          <figcaption><Link href="/products/single-premium-box">Discover the Single Premium Box <ArrowUpRight size={19} /></Link></figcaption>
        </figure>
      </div>
    </section>
    <section className="gifting-moments wrap" aria-label="Gifting occasions">
      <Link href="/corporate"><span className="discovery-badge"><Users size={20} />From 10 gifts</span><h2>Gifts for your team</h2><p>Branded hampers for colleagues, clients and partners.</p><span className="discovery-action">Explore corporate gifts <ArrowUpRight size={18} /></span></Link>
      <Link href={quoteHref({ occasion: "Weddings" })}><span className="discovery-badge"><Heart size={20} />Made personal</span><h2>A wedding to remember</h2><p>Personal touches for the people celebrating with you.</p><span className="discovery-action">Plan wedding gifts <ArrowUpRight size={18} /></span></Link>
      <Link href="/shop?category=Divine%20%26%20festive%20gifts"><span className="discovery-badge"><Sparkles size={20} />The festive collection</span><h2>Make it a celebration</h2><p>Discover keepsakes, lights and thoughtful festive details.</p><span className="discovery-action">Browse festive gifts <ArrowUpRight size={18} /></span></Link>
    </section>
    <section className="section wrap signature-section">
      <div className="section-heading"><div><span className="eyebrow">THE SIGNATURE COLLECTION</span><h2>Find your <em>perfect hamper.</em></h2></div><Link href="/shop?category=Curated%20hampers" className="text-link">Browse all hampers <ArrowRight size={17} /></Link></div>
      <p className="collection-intro">Save a favourite or request a personalised quote.</p>
      <div className="product-grid signature-grid">{products.filter((product) => product.featured).map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
    <section className="section wrap categories-section">
      <div className="section-heading"><div><span className="eyebrow">MAKE IT MEANINGFUL</span><h2>Explore by <em>collection.</em></h2></div><Link href="/shop" className="text-link">Browse all gifts <ArrowRight size={17} /></Link></div>
      <div className="category-grid">{collections.map(({ label, category, icon: Icon, color, detail }) => <Link className={`category-card ${color}`} key={category} href={`/shop?category=${encodeURIComponent(category)}`}><div className="category-icon"><Icon size={31} strokeWidth={1.15} /></div><h3>{label}</h3><p>{detail}</p><ArrowUpRight className="category-arrow" size={16} /></Link>)}</div>
      <p className="catalogue-footnote">A first look at our growing catalogue. More collections will follow.</p>
    </section>
    <section className="section wrap">
      <div className="corporate-feature">
        <div className="corporate-photo"><Image src="/catalogue/executive-corporate-hamper.webp" alt="RUVAANI executive hamper with branded gifts, golden details and a ruby ribbon" fill sizes="(max-width: 760px) 90vw, 45vw" /></div>
        <div className="corporate-feature-copy"><span className="eyebrow">YOUR BRAND. THEIR MOMENT.</span><h2>Appreciation,<br /><em>beautifully expressed.</em></h2><p>Your brand, their favourite new gift. Choose a hamper and make it personal.</p><div className="corporate-benefits"><span><Check />From 10 gifts</span><span><Check />Custom branding</span><span><Check />Curated to your brief</span><span><Check />Presentation options</span></div><Link href="/corporate#enquiry" className="button button-light">Request a corporate quote <ArrowUpRight size={18} /></Link><details className="inline-details"><summary>How custom gifting works</summary><p>Select your gifts, customise the details and approve your quotation before production. Delivery is confirmed with your brief.</p></details></div>
      </div>
    </section>
    <section className="finder-banner wrap"><div className="finder-stars"><Sparkles size={45} strokeWidth={1} /></div><div><span className="eyebrow">LET&apos;S NARROW IT DOWN</span><h2>Not sure where to begin?</h2><p>Choose your recipient, occasion and budget.</p></div><Link href="/gift-finder" className="button button-primary">Find gift ideas <ArrowUpRight size={18} /></Link></section>
    <section className="brand-note wrap"><Image src="/brand/monogram.webp" alt="" width={86} height={79} className="brand-note-monogram" /><span className="eyebrow">THE THOUGHT BEHIND RUVAANI</span><h2>More than a gift.<br /><em>A meaningful connection.</em></h2><p>Premium experiences begin with a little thought.<br />A carefully chosen gift, a personal detail, a beautifully tied ribbon.<br />Something that says: you matter.</p><Link href="/about" className="text-link">Discover our story <ArrowRight size={17} /></Link></section>
  </>;
}
