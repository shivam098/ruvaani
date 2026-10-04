import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Flower2, Gift, Heart, Leaf, Package, PenLine, Sparkles, Sun, Truck, Users } from "lucide-react";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { GiftArtwork } from "@/components/gift-artwork";

export default async function Home() {
  const products = await getProducts();
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-eyebrow"><span />THOUGHTFULLY CHOSEN. BEAUTIFULLY GIVEN.</div>
          <h1>Some gifts<br />say <em>so much</em><br />more.</h1>
          <p>For the people who matter. And the moments<br className="desktop-break" /> that deserve a little something special.</p>
          <div className="hero-buttons"><Link href="/shop" className="button button-primary">Find your perfect gift <ArrowUpRight size={18} /></Link><Link href="/corporate" className="hero-secondary">Gifting for your team <ArrowRight size={17} /></Link></div>
          <div className="hero-note"><span className="mini-gift"><Gift size={20} /></span><div>More than a gift. <strong>A feeling.</strong><span>Thoughtful details, from the first look to the last ribbon.</span></div></div>
        </div>
        <div className="hero-visual">
          <Image src="/images/gifting.jpg" alt="Beautifully wrapped charcoal gift boxes with golden satin ribbons" fill priority sizes="(max-width: 760px) 100vw, 54vw" className="hero-photo" />
          <div className="hero-photo-shade" />
          <span className="hero-image-label">THE RUVAANI EDIT · EVERYDAY EXTRAORDINARY</span>
          <div className="hero-roundel"><Sparkles size={20} /><span>SMALL GESTURES</span><strong>big feelings</strong><span>BEAUTIFULLY WRAPPED</span></div>
          <div className="hero-floating-card"><span className="floating-card-icon"><Gift size={24} strokeWidth={1.4} /></span><div><span>A LITTLE BOX OF</span><p>“I thought of you.”</p></div><Link href="/shop?category=Hampers" aria-label="Explore gift hampers"><ArrowUpRight size={21} /></Link></div>
          <span className="hero-caption">GOOD THINGS COME WITH A LITTLE THOUGHT.</span>
        </div>
        <a href="#discover" className="hero-scroll" aria-label="Discover our gifts"><ArrowDown size={17} /></a>
      </section>

      <section id="discover" className="occasion-strip"><div className="wrap">
        <span>A GIFT FOR EVERY KIND OF MOMENT</span>
        <div className="occasion-links">
          {[[Sun, "Festive celebrations", "Diwali"], [Users, "A warm welcome", "Welcome aboard"], [Heart, "A heartfelt thank-you", "Thank you"], [Flower2, "Just because", "Just because"]].map(([Icon, label, occasion]) => {
            const OccasionIcon = Icon as typeof Sun;
            return <Link key={String(label)} href={`/shop?occasion=${encodeURIComponent(String(occasion))}`}><OccasionIcon size={22} strokeWidth={1.4} /><span>{String(label)}</span><ArrowUpRight size={14} /></Link>;
          })}
        </div>
      </div></section>

      <section className="section wrap categories-section">
        <div className="section-heading"><div><span className="eyebrow">A WORLD OF THOUGHTFUL POSSIBILITIES</span><h2>What&apos;s your kind of <em>thoughtful?</em></h2></div><Link href="/shop" className="text-link">Explore all gifts <ArrowRight size={17} /></Link></div>
        <div className="category-grid">
          {[
            { label: "Gift hampers", category: "Hampers", icon: Gift, color: "sand", detail: "Good things, together" },
            { label: "Desk essentials", category: "Desk essentials", icon: PenLine, color: "sage", detail: "For the everyday inspired" },
            { label: "Wellness & care", category: "Wellness", icon: Flower2, color: "rose", detail: "A moment just for them" },
            { label: "Gourmet delights", category: "Gourmet", icon: Package, color: "butter", detail: "A taste of something lovely" },
            { label: "Conscious gifts", category: "Eco-friendly", icon: Leaf, color: "olive", detail: "Thoughtful by nature" },
          ].map(({ label, category, icon: Icon, color, detail }) => <Link className={`category-card ${color}`} key={label} href={`/shop?category=${encodeURIComponent(category)}`}><div className="category-icon"><Icon size={34} strokeWidth={1.15} /></div><h3>{label}</h3><p>{detail}</p><ArrowUpRight className="category-arrow" size={16} /></Link>)}
        </div>
      </section>

      <section className="section wrap bestsellers-section">
        <div className="section-heading"><div><span className="eyebrow">THE ONES THEY&apos;LL REMEMBER</span><h2>A few of our <em>favorites.</em></h2></div><Link href="/shop" className="text-link">Meet the whole collection <ArrowRight size={17} /></Link></div>
        <div className="product-grid">{products.filter((p) => p.featured).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>

      <section className="corporate-feature wrap">
        <div className="corporate-art"><div className="corporate-art-heading"><span className="eyebrow">GOOD PEOPLE. GREAT GESTURES.</span><p>Your brand.<br /><em>Their little moment.</em></p></div><GiftArtwork kind="desk" color="#e1e3d7" /><span className="corporate-art-tag"><PenLine size={14} /> YOUR BRAND, BEAUTIFULLY PRESENTED</span></div>
        <div className="corporate-feature-copy"><span className="eyebrow">FOR THE PEOPLE BEHIND YOUR BUSINESS</span><h2>Big appreciation.<br /><em>Thoughtful scale.</em></h2><p>From your first ten teammates to a thousand thank-yous. Make every employee, client, and partner feel like your only one.</p><div className="corporate-benefits"><span><Check size={16} /> Your brand, their name</span><span><Check size={16} /> Curated for your budget</span><span><Check size={16} /> One team, many destinations</span><span><Check size={16} /> A dedicated gifting partner</span></div><Link href="/corporate" className="button button-light">Let&apos;s talk corporate gifting <ArrowUpRight size={18} /></Link><p className="corporate-footnote">Thoughtful gifting starts with a conversation.</p></div>
      </section>

      <section className="section wrap editorial-section">
        <div className="section-heading"><div><span className="eyebrow">IT&apos;S THE LITTLE THINGS</span><h2>Ordinary moments.<br /><em>Extraordinary meaning.</em></h2></div><p className="section-description">A name on a notebook. Their favorite flavor.<br />A message that could only come from you.<br />That&apos;s where a good gift becomes their gift.</p></div>
        <div className="editorial-grid">
          <Link href="/shop?personalized=true" className="editorial-card personalized-card"><div><span className="eyebrow">UNIQUELY, UNMISTAKABLY THEIRS</span><h3>A little more <em>personal.</em></h3><span className="text-link">Put a little you into it <ArrowRight size={17} /></span></div><GiftArtwork kind="desk" color="#ede8df" /></Link>
          <Link href="/shop?occasion=Diwali" className="editorial-card festive-card"><Image src="/images/celebration.jpg" alt="A gold gift box tied with a rich pink ribbon" fill sizes="(max-width: 760px) 100vw, 40vw" /><div><span className="eyebrow">LET THE GOOD MOMENTS GLOW</span><h3>A season of <em>giving.</em></h3><span className="text-link">Explore the festive edit <ArrowRight size={17} /></span></div></Link>
        </div>
      </section>

      <section className="finder-banner wrap"><div className="finder-stars"><Sparkles size={50} strokeWidth={.9} /><span>✧</span></div><div><span className="eyebrow">A LITTLE GUIDANCE. A LOT OF HEART.</span><h2>Not sure where to start?</h2><p>Tell us a little about them. We&apos;ll help you find their kind of gift.</p></div><Link href="/gift-finder" className="button button-primary">Find my thoughtful <ArrowUpRight size={18} /></Link></section>

      <section className="brand-note wrap"><span className="brand-flower"><Flower2 size={36} strokeWidth={1} /></span><span className="eyebrow">THE THOUGHT BEHIND RUVAANI</span><h2>It was never really<br />about <em>the gift.</em></h2><p>It&apos;s about being seen. Being celebrated. Being remembered.<br />We&apos;re here for the beautiful things that happen<br />when you let someone know they matter.</p><Link href="/about" className="text-link">A little of our story <ArrowRight size={17} /></Link></section>
      <div className="delivery-note"><Truck size={18} /><span>Thoughtfully packed. Ready for a happy doorstep.</span><Link href="/policies/shipping">A note on delivery <ArrowRight size={14} /></Link></div>
    </>
  );
}
