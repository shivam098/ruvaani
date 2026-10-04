import type { Metadata } from "next";
import Link from "next/link";
import { Catalog } from "@/components/catalog";

export const metadata: Metadata = { title: "The gift collection", description: "Explore thoughtfully curated hampers, desk essentials, wellness gifts and little luxuries.", alternates: { canonical: "/shop" } };
export default async function Shop({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initial = await searchParams;
  return <><section className="page-heading"><div className="wrap"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>The collection</span></div><span className="eyebrow">GOOD GIFTS. EVEN BETTER FEELINGS.</span><h1>A little something.<br className="mobile-only" /> <em>A lot of meaning.</em></h1><p>Thoughtfully chosen for the people who make your world a little brighter.</p></div></section><Catalog key={JSON.stringify(initial)} initial={initial} /></>;
}
