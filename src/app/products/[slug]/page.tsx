import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/catalog";
import { isDemoMode, siteUrl } from "@/lib/config";
import { ProductDetails } from "@/components/product-details";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProducts()).find((p) => p.slug === slug);
  return product ? { title: product.name, description: product.description, alternates: { canonical: `/products/${slug}` } } : { title: "Gift not found" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const schema = {
    "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description,
    sku: product.id, brand: { "@type": "Brand", name: "RUVAANI" },
    offers: { "@type": "Offer", priceCurrency: "INR", price: product.price / 100, availability: product.stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `${siteUrl()}/products/${product.slug}` },
  };
  return <div className="wrap product-page"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop">The collection</Link><span>/</span><span>{product.name}</span></div>{!isDemoMode() && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}<ProductDetails product={product} /><section className="section"><div className="section-heading"><div><span className="eyebrow">A FEW MORE THOUGHTFUL FINDS</span><h2>You might also <em>love.</em></h2></div><Link href="/shop" className="text-link">Explore all gifts</Link></div><div className="product-grid">{products.filter((p) => p.id !== product.id).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div></section></div>;
}
