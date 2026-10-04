"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Eye, Heart, Plus, X } from "lucide-react";
import { formatPrice } from "@/lib/commerce";
import type { Product } from "@/lib/types";
import { useStore } from "./store-provider";
import { GiftArtwork } from "./gift-artwork";

export function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWishlist, add } = useStore();
  const modal = useRef<HTMLDialogElement>(null);
  const saved = wishlist.includes(product.id);
  const addGift = () => add({ productId: product.id, quantity: product.minimumOrderQuantity, name: "", message: "" });
  return (
    <article className="product-card">
      <div className="product-visual">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><GiftArtwork kind={product.artwork} color={product.color} /></Link>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className={`wishlist-button ${saved ? "saved" : ""}`} aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`} aria-pressed={saved} onClick={() => toggleWishlist(product.id)}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>
        <button className="quick-view" onClick={() => modal.current?.showModal()}><Eye size={15} /> Quick look</button>
      </div>
      <div className="product-meta"><span>{product.category}</span>{product.personalizable && <span>Personalizable</span>}</div>
      <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
      <p className="product-subtitle">{product.subtitle}</p>
      <div className="product-bottom"><div><strong>{formatPrice(product.price)}</strong>{product.compareAtPrice > product.price && <del>{formatPrice(product.compareAtPrice)}</del>}</div><button className="add-small" disabled={!product.stock} onClick={addGift} aria-label={`Add ${product.name} to bag`}><Plus size={17} /></button></div>
      <dialog ref={modal} aria-label={`${product.name} quick look`} className="quick-dialog" onClick={(e) => { if (e.target === e.currentTarget) modal.current?.close(); }}>
        <button className="dialog-close icon-button" aria-label="Close quick look" onClick={() => modal.current?.close()}><X /></button>
        <GiftArtwork kind={product.artwork} color={product.color} />
        <div className="quick-dialog-content"><span className="eyebrow">{product.category}</span><h2>{product.name}</h2><p>{product.description}</p><strong className="large-price">{formatPrice(product.price)}</strong><button className="button button-primary" disabled={!product.stock} onClick={() => { if (addGift()) modal.current?.close(); }}>{product.stock ? "Add to bag" : "Out of stock"}<Plus size={18} /></button><Link href={`/products/${product.slug}`} onClick={() => modal.current?.close()} className="text-link">All the thoughtful details <ArrowRight size={16} /></Link></div>
      </dialog>
    </article>
  );
}
