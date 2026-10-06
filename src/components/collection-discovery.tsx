"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Heart, Sparkles } from "lucide-react";
import { collectionHref, giftCategories, giftFestivals, giftOccasions, type CollectionKind } from "@/lib/discovery";

const groups = { category: giftCategories, occasion: giftOccasions, festival: giftFestivals };
const labels = { category: "By category", occasion: "By occasion", festival: "By festival" };

export function CollectionDiscovery() {
  const [group, setGroup] = useState<CollectionKind>("category");
  return <section className="section wrap collection-discovery" id="collection-discovery" aria-labelledby="discovery-heading">
    <div className="section-heading"><div><span className="eyebrow">SHOP THE RUVAANI COLLECTION</span><h2 id="discovery-heading">Find a gift that feels <em>just right.</em></h2></div><Link className="text-link" href="/shop">Explore all gifts <ArrowUpRight size={18} /></Link></div>
    <div className="discovery-selectors" role="group" aria-label="Discover gifts by">{(["category", "occasion", "festival"] as const).map((kind) => <button key={kind} type="button" aria-pressed={group === kind} aria-controls="discovery-cards" onClick={() => setGroup(kind)}>{labels[kind]}</button>)}</div>
    <div id="discovery-cards" className="discovery-grid">
      {groups[group].map((collection) => <Link className="discovery-card" href={collectionHref(collection)} key={collection.slug} data-track-event={`${group}_click`} data-track-target={collection.slug}>
        <div className={`discovery-image ${collection.image ? "" : "discovery-request"}`}>{collection.image ? <Image src={collection.image} alt="" fill sizes="(max-width: 760px) 45vw, 25vw" /> : <><span>{collection.slug === "wellness" ? <Heart size={40} strokeWidth={1} /> : <Sparkles size={40} strokeWidth={1} />}</span><small>Custom enquiry</small></>}</div>
        <div className="discovery-copy"><h3>{collection.kind === "festival" ? collection.occasion === "Weddings" ? "Wedding Season" : collection.occasion : collection.title}</h3><p>{collection.caption}</p><span>{collection.productIds.length ? "Explore" : "Discuss your brief"} <ArrowUpRight size={16} /></span></div>
      </Link>)}
    </div>
    <p className="helper-text discovery-note" role="status">{group === "festival" ? "Festival edits are curated ideas from our existing catalogue, not live stock or delivery promises." : group === "category" ? "Wellness and Tech & Utility are enquiry-only: no standalone products are listed yet." : "Start with the people and the moment. Your quotation confirms the final selection."}</p>
  </section>;
}
