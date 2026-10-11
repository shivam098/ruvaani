import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { HomeCollection } from "@/components/home-collection";
import { CollectionDiscovery } from "@/components/collection-discovery";
import { CatalogueCallout } from "@/components/catalogue-callout";
import { RuvaaniPromise } from "@/components/ruvaani-promise";

export default async function Home() {
  const homepage = await getHomepageSettings();
  return <>
    <HomeCollection key={homepage.revision} content={homepage.content} discovery={<CollectionDiscovery />} />
    <CatalogueCallout />
    <RuvaaniPromise />
    <section className="brand-note wrap"><Image src="/brand/monogram.webp" alt="" width={86} height={79} className="brand-note-monogram" /><span className="eyebrow">THE THOUGHT BEHIND RUVAANI</span><h2>More than a gift.<br /><em>A feeling, thoughtfully wrapped.</em></h2><p>A considered selection. A personal detail. A beautifully tied ribbon.<br />Gift a moment. Create a memory.</p><Link href="/about" className="text-link">Our story <ArrowUpRight size={17} /></Link><Link href="/gift-finder" className="text-link">Need a little inspiration? <ArrowUpRight size={17} /></Link></section>
  </>;
}
