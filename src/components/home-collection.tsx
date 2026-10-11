"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { type HomepageContent, type EventSlot } from "@/lib/homepage-content";
import { catalogueProducts } from "@/lib/catalog-data";
import { collectionHref, collectionKey, collectionProducts, giftFestivals } from "@/lib/discovery";
import { FestivalSwitcher } from "./festival-switcher";
import { ProductCard } from "./product-card";

export function HomeCollection({ content, discovery }: { content: HomepageContent; discovery: ReactNode }) {
  const [selected, setSelected] = useState<EventSlot>(content.defaultEvent);
  const active = content[selected].enabled ? selected : content.event.enabled ? "event" : content.additionalEvent.enabled ? "additionalEvent" : undefined;
  const festival = active ? giftFestivals.find((item) => item.occasion?.toLowerCase() === content[active].name.toLowerCase()) : undefined;
  const products = festival ? collectionProducts(festival).slice(0, 3) : catalogueProducts.filter((product) => product.featured);
  return <>
    {active ? <FestivalSwitcher content={content} selected={selected} onSelect={setSelected} /> : <section className="fallback-hero wrap"><div><span className="eyebrow">FOR EVERY MOMENT THAT MATTERS</span><h1>Thoughtfully chosen. <br /><em>Beautifully given.</em></h1><p>Premium gifting, curated for your people and your moment.</p><Link className="button button-primary" href="/catalogue">View Catalogue <ArrowUpRight size={18} /></Link></div><div className="fallback-hero-image"><Image src="/catalogue/single-premium-box.webp" alt="A RUVAANI signature hamper" fill preload sizes="(max-width: 760px) 90vw, 45vw" /></div></section>}
    {discovery}
    <section className="section wrap featured-edit" aria-labelledby="featured-collection-heading"><div className="section-heading"><div><span className="eyebrow">THE FEATURED COLLECTION</span><h2 id="featured-collection-heading">{festival ? festival.title : "Thoughtful favourites."}</h2></div><Link className="text-link" href={festival ? collectionHref(festival) : "/collections/hampers"}>Explore the edit <ArrowUpRight size={18} /></Link></div><p className="collection-intro">{festival ? festival.caption : "Signature hampers, thoughtfully chosen. Your final quotation makes it personal."}</p><div className="product-grid featured-grid">{products.map((product) => <ProductCard product={product} key={product.id} quoteContext={festival ? { collection: collectionKey(festival), occasion: festival.occasion } : undefined} />)}</div></section>
  </>;
}
