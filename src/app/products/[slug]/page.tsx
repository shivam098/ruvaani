import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/catalog";
import { isDemoMode, siteUrl } from "@/lib/config";
import { ProductDetails } from "@/components/product-details";
import { ProductCard } from "@/components/product-card";
import { quoteContextSchema } from "@/lib/validation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProducts()).find((p) => p.slug === slug);
  return product ? { title: product.name, description: product.description, alternates: { canonical: `/products/${slug}` } } : { title: "Gift not found" };
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const context = quoteContextSchema.safeParse(await searchParams);
  const quoteContext = context.success ? context.data : {};
  const schema = {
    "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description,
    sku: product.id, brand: { "@type": "Brand", name: "RUVAANI" },
    image: `${siteUrl()}${product.image}`, url: `${siteUrl()}/products/${product.slug}`,
  };
  return <div className="wrap product-page"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop">The collection</Link><span>/</span><span>{product.name}</span></div>{!isDemoMode() && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}{!context.success && <p className="form-error" role="alert">Some gifting preferences in this link were invalid. Please select the occasion and recipient again in your enquiry.</p>}<ProductDetails product={product} quoteContext={quoteContext} /><section className="section"><div className="section-heading"><div><span className="eyebrow">A FEW MORE THOUGHTFUL FINDS</span><h2>You might also <em>love.</em></h2></div><Link href="/shop" className="text-link">Explore all gifts</Link></div><div className="product-grid">{products.filter((p) => p.id !== product.id).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} quoteContext={quoteContext} />)}</div></section></div>;
}
