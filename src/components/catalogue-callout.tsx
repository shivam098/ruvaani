import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { catalogueEditions } from "@/lib/discovery";

export function CatalogueCallout({ edition = "collection", quote = "/corporate#enquiry" }: { edition?: string; quote?: string }) {
  const catalogue = catalogueEditions.find((item) => item.slug === edition) ?? catalogueEditions[0];
  return <section className="wrap catalogue-callout" aria-labelledby="catalogue-callout-heading">
    <div className="catalogue-cover"><Image src={catalogue.image} alt="A RUVAANI gifting selection from the supplied catalogue" fill sizes="(max-width: 760px) 90vw, 40vw" /><span>RUVAANI <small>CREATIONS & PACKAGING</small></span></div>
    <div><span className="eyebrow">A COLLECTION WORTH KEEPING</span><h2 id="catalogue-callout-heading">Discover the<br /><em>RUVAANI Collection.</em></h2><p>A little inspiration for your next meaningful gesture. Explore the gifts, then let&apos;s make the details yours.</p><div className="catalogue-actions"><Link href={`/catalogue/${catalogue.slug}`} className="button button-primary">View Catalogue <ArrowUpRight size={18} /></Link><a href={`/catalogues/ruvaani-${catalogue.slug}.pdf`} download className="button button-outline" data-track-event="catalogue_download" data-track-target={catalogue.slug}>Download Catalogue <Download size={17} /></a></div><Link href={quote} className="text-link" data-track-event="enquiry_start" data-track-target="catalogue">Request a Custom Quote <ArrowUpRight size={18} /></Link><p className="helper-text">Catalogue and quotation-based ordering. No instant checkout.</p></div>
  </section>;
}
