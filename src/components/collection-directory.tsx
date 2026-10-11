import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Gift } from "lucide-react";
import { collectionHref, type GiftCollection } from "@/lib/discovery";

export function CollectionDirectory({ title, description, collections }: { title: string; description: string; collections: GiftCollection[] }) {
  return <section className="wrap section directory-page"><span className="eyebrow">THE RUVAANI COLLECTION</span><h1>{title}</h1><p className="directory-intro">{description}</p><div className="discovery-grid">{collections.map((collection) => <Link href={collectionHref(collection)} className="discovery-card" key={collection.slug} data-track-event={`${collection.kind}_click`} data-track-target={collection.slug}><div className={`discovery-image ${collection.image ? "" : "discovery-request"}`}>{collection.image ? <Image src={collection.image} alt="" fill sizes="(max-width: 760px) 45vw, 25vw" /> : <><Gift size={38} /><small>Custom enquiry</small></>}</div><div className="discovery-copy"><h2>{collection.title}</h2><p>{collection.caption}</p><span>{collection.productIds.length ? "Explore" : "Discuss your brief"} <ArrowUpRight size={16} /></span></div></Link>)}</div></section>;
}
