import type { Metadata } from "next";
import Link from "next/link";
import { Catalog } from "@/components/catalog";

export const metadata: Metadata = { title: "The gift collection", description: "Explore RUVAANI's curated hampers, festive keepsakes, corporate essentials and custom presentation. Request a quote for your gifting brief.", alternates: { canonical: "/shop" } };
export default async function Shop({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initial = await searchParams;
  return <><section className="page-heading"><div className="wrap"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>The collection</span></div><span className="eyebrow">THOUGHTFULLY CRAFTED. BEAUTIFULLY GIFTED.</span><h1>A little something.<br className="mobile-only" /> <em>A lot of meaning.</em></h1><p>Explore our growing catalogue. Every selection begins with a quote, from 10 gifts.</p></div></section><Catalog key={JSON.stringify(initial)} initial={initial} /></>;
}
