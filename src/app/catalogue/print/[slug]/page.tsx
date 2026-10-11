import Image from "next/image";
import { notFound } from "next/navigation";
import { catalogueEditions, editionProducts } from "@/lib/discovery";
import { formatCataloguePrice } from "@/lib/catalog-data";
import { contactNumbers } from "@/lib/brand";
import { BrandLogo } from "@/components/brand-logo";
export const metadata = { title: "Printable catalogue", robots: { index: false, follow: false } };
export const dynamicParams = false;
export function generateStaticParams() { return catalogueEditions.map(({ slug }) => ({ slug })); }

export default async function PrintCatalogue({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const edition = catalogueEditions.find((item) => item.slug === slug);
  if (!edition) notFound();
  const products = editionProducts(slug);
  return <article className="print-catalogue">
    <section className="print-cover"><BrandLogo /><span className="eyebrow">THOUGHTFULLY CHOSEN. BEAUTIFULLY GIVEN.</span><h1>{edition.title}</h1><p>{edition.caption}</p><div className="print-cover-photo"><Image src={edition.image} alt="" fill unoptimized loading="eager" /></div><p>Catalogue edition · October 2026</p><p>Quote-based gifting from 10 gifts. Not a confirmed quotation or a stock list.</p></section>
    {Array.from({ length: Math.ceil(products.length / 2) }, (_, index) => <section className="print-product-page" key={index}><div className="print-page-heading">RUVAANI <span>{edition.title}</span></div>{products.slice(index * 2, index * 2 + 2).map((product) => <article className="print-product" key={product.id}><div className="print-product-photo"><Image src={product.image} alt={product.name} fill unoptimized loading="eager" /></div><div><span className="eyebrow">{product.category}</span><h2>{product.name}</h2><strong>{formatCataloguePrice(product)}</strong><p>{product.description}</p>{product.contents && <ul>{product.contents.map((item) => <li key={item}>{item}</li>)}</ul>}<small>Source: {product.source}</small></div></article>)}<p className="print-disclaimer">Starting and reference prices are indicative. Confirm the final assortment, quantity, customisation, taxes and delivery in your quotation. No online checkout.</p></section>)}
    <section className="print-closing"><BrandLogo /><span className="eyebrow">YOUR MOMENT. YOUR FINISHING TOUCHES.</span><h2>Let&apos;s curate your gifting.</h2><p>Select your gifts → Discuss customisation → Approve the quotation → Confirm production and delivery.</p><p>Branding, packaging and delivery arrangements depend on your approved selection. No extra items or services are automatically included.</p><h3>Talk to RUVAANI</h3>{contactNumbers.map((phone) => <p key={phone}>+91 {phone}</p>)}<p>Explore the collection and request a quote at<br />ruvaani-six.vercel.app</p><p>Gift a moment. Create a memory.</p></section>
  </article>;
}
