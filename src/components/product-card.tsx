"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, Eye, Heart, X } from "lucide-react";
import { formatPrice } from "@/lib/commerce";
import { quoteHref, type CatalogueItem } from "@/lib/catalog-data";
import { useStore } from "./store-provider";
import { ProductImage } from "./product-image";

export function ProductCard({ product }: { product: CatalogueItem }) {
  const { wishlist, toggleWishlist } = useStore();
  const modal = useRef<HTMLDialogElement>(null);
  const saved = wishlist.includes(product.id);
  const enquiry = quoteHref({ product: product.id });
  return <article className="product-card">
    <div className="product-visual">
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><ProductImage product={product} /></Link>
      {product.featured && <span className="product-badge">THE SIGNATURE COLLECTION</span>}
      <button className={`wishlist-button ${saved ? "saved" : ""}`} aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`} aria-pressed={saved} onClick={() => toggleWishlist(product.id)}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>
      <button className="quick-view" onClick={() => modal.current?.showModal()}><Eye size={15} />Quick look</button>
    </div>
    <div className="product-meta"><span>{product.category}</span></div>
    <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
    <p className="product-subtitle">{product.subtitle}</p>
    <div className="product-bottom"><div><strong>{product.cataloguePrice ? formatPrice(product.cataloguePrice) : "Price on request"}</strong><span className="price-caption">{product.cataloguePrice ? "Catalogue price · Final quote on request" : "Made to your brief"}</span></div></div>
    <Link href={enquiry} className="product-quote" aria-label={`Request a quote for ${product.name}`}>Request a quote <ArrowUpRight size={16} /></Link>
    <dialog ref={modal} aria-label={`${product.name} quick look`} className="quick-dialog" onClick={(event) => { if (event.target === event.currentTarget) modal.current?.close(); }}>
      <button className="dialog-close icon-button" aria-label="Close quick look" onClick={() => modal.current?.close()}><X /></button>
      <ProductImage product={product} sizes="(max-width: 760px) 90vw, 400px" />
      <div className="quick-dialog-content"><span className="eyebrow">{product.category}</span><h2>{product.name}</h2><p>{product.description}</p><strong className="large-price">{product.cataloguePrice ? formatPrice(product.cataloguePrice) : "Price on request"}</strong><p>Minimum enquiry: 10 gifts. Final contents, customisation, taxes and delivery are confirmed in your quote.</p><Link href={enquiry} onClick={() => modal.current?.close()} className="button button-primary">Request a quote <ArrowUpRight size={18} /></Link><Link href={`/products/${product.slug}`} onClick={() => modal.current?.close()} className="text-link">Explore the details <ArrowUpRight size={16} /></Link></div>
    </dialog>
  </article>;
}
