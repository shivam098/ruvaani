import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Download } from "lucide-react";
import { catalogueEditions, editionProducts, collectionQuoteHref, findCollection } from "@/lib/discovery";
import { Catalog } from "@/components/catalog";
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export const dynamicParams = false;
export function generateStaticParams() { return catalogueEditions.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) { const { slug } = await params; const edition = catalogueEditions.find((item) => item.slug === slug); return { title: edition?.title ?? "Catalogue not found" }; }
export default async function CatalogueEdition({ params, searchParams }: Props) {
  const { slug } = await params;
  const edition = catalogueEditions.find((item) => item.slug === slug);
  if (!edition) notFound();
  const collection = edition.collection ? findCollection(edition.collection) : undefined;
  const quote = collection ? collectionQuoteHref(collection) : "/corporate#enquiry";
  return <><section className="wrap section edition-intro"><div className="breadcrumb"><Link href="/catalogue">Catalogues</Link><span>/</span><span>{edition.title}</span></div><span className="eyebrow">A COLLECTION WORTH KEEPING</span><h1>{edition.title}</h1><p>{edition.caption}</p><div className="catalogue-actions"><a className="button button-primary" href={`/catalogues/ruvaani-${edition.slug}.pdf`} download data-track-event="catalogue_download" data-track-target={edition.slug}>Download Catalogue <Download size={18} /></a><Link className="button button-outline" href={quote} data-track-event="enquiry_start" data-track-target="catalogue">Request a Custom Quote <ArrowUpRight size={18} /></Link></div><p className="helper-text">An edit of the supplied catalogue, not a separately guaranteed package or stock list. No online checkout.</p></section><Catalog initial={await searchParams} key={JSON.stringify(await searchParams)} productIds={editionProducts(slug).map((item) => item.id)} quoteHref={quote} /><section className="wrap customisation-note"><h2>The details make it <em>personal.</em></h2><p>Choose your gifts, discuss personalisation and packaging, then approve your quotation. Contents, production and delivery plans are agreed with your brief.</p><Link className="text-link" href={quote}>Let&apos;s curate your gifting <ArrowUpRight size={18} /></Link></section></>;
}
