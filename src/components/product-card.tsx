"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, Eye, Heart, X } from "lucide-react";
import { formatCataloguePrice, quoteHref, type CatalogueItem } from "@/lib/catalog-data";
import { useStore } from "./store-provider";
import { ProductImage } from "./product-image";
import type { QuoteContext } from "@/lib/validation";

export function ProductCard({ product, quoteContext }: { product: CatalogueItem; quoteContext?: QuoteContext }) {
  const { wishlist, toggleWishlist } = useStore();
  const modal = useRef<HTMLDialogElement>(null);
  const saved = wishlist.includes(product.id);
  const enquiry = quoteHref({ product: product.id, ...quoteContext, occasion: quoteContext?.occasion ?? product.occasion });
  const detailParams = new URLSearchParams();
  for (const key of ["collection", "occasion", "recipient"] as const) {
    const value = quoteContext?.[key];
    if (value) detailParams.set(key, value);
  }
  const detailsHref = `/products/${product.slug}${detailParams.size ? `?${detailParams}` : ""}`;
  return <article className="product-card">
    <div className="product-visual">
      <Link href={detailsHref} aria-label={`View ${product.name}`}><ProductImage product={product} /></Link>
      {product.featured && <span className="product-badge">Signature hamper</span>}
      <button className="quick-view" onClick={() => modal.current?.showModal()}><Eye size={15} />Quick look</button>
    </div>
    <div className="product-meta"><span>{product.category}</span></div>
    <h3><Link href={detailsHref}>{product.name}</Link></h3>
    <p className="product-subtitle">{product.subtitle}</p>
    <div className="product-bottom"><div><strong>{formatCataloguePrice(product)}</strong><span className="price-caption">{product.priceType === "starting" ? "Starting price · Quote required" : product.cataloguePrice ? "Reference price · Quote required" : "Made to your brief"}</span></div></div>
    <div className="product-card-actions">
      <Link href={enquiry} className="button button-primary product-quote" aria-label={`Request a quote for ${product.name}`}>Request a quote <ArrowUpRight size={16} /></Link>
      <button className={`button button-outline save-gift ${saved ? "saved" : ""}`} aria-label={saved ? `Saved ${product.name}. Remove from wishlist` : `Save ${product.name} to wishlist`} aria-pressed={saved} onClick={() => toggleWishlist(product.id)}><Heart size={18} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button>
    </div>
    <dialog ref={modal} aria-label={`${product.name} quick look`} className="quick-dialog" onClick={(event) => { if (event.target === event.currentTarget) modal.current?.close(); }}>
      <button className="dialog-close icon-button" aria-label="Close quick look" onClick={() => modal.current?.close()}><X /></button>
      <ProductImage product={product} sizes="(max-width: 760px) 90vw, 400px" />
      <div className="quick-dialog-content"><span className="eyebrow">{product.category}</span><h2>{product.name}</h2><p>{product.subtitle}</p><strong className="large-price">{formatCataloguePrice(product)}</strong><p className="helper-text">{product.priceType === "starting" ? "Advertised starting price. " : product.cataloguePrice ? "Reference price. " : ""}Minimum enquiry: 10 gifts.</p><details className="inline-details"><summary>Gift & quote details</summary><p>{product.description}</p><p>Final contents, customisation, taxes and delivery are confirmed in your quote.</p></details><Link href={enquiry} onClick={() => modal.current?.close()} className="button button-primary">Request a quote <ArrowUpRight size={18} /></Link><Link href={detailsHref} onClick={() => modal.current?.close()} className="text-link">View full gift details <ArrowUpRight size={16} /></Link></div>
    </dialog>
  </article>;
}
