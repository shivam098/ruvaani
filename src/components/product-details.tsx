"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, Heart, PenLine } from "lucide-react";
import { MINIMUM_QUOTE_QUANTITY, quoteHref, type CatalogueItem } from "@/lib/catalog-data";
import { formatPrice } from "@/lib/commerce";
import { ProductImage } from "./product-image";
import { useStore } from "./store-provider";

export function ProductDetails({ product }: { product: CatalogueItem }) {
  const { wishlist, toggleWishlist } = useStore();
  const [quantity, setQuantity] = useState(String(MINIMUM_QUOTE_QUANTITY));
  const [sheet, setSheet] = useState(false);
  const [error, setError] = useState("");
  const saved = wishlist.includes(product.id);
  function validateQuantity(event: React.FormEvent<HTMLFormElement>) {
    if (!Number.isSafeInteger(Number(quantity)) || Number(quantity) < MINIMUM_QUOTE_QUANTITY || Number(quantity) > 100000) {
      event.preventDefault();
      setError("Please enter a whole-number quantity between 10 and 100,000.");
    }
  }
  return <div className="product-detail-grid">
    <div className="product-gallery">
      <div className="main-artwork">{sheet && product.sheet ? <Image className="catalogue-sheet" src={product.sheet} alt={`${product.name}: original supplied catalogue sheet with contents and price`} width={1055} height={1491} sizes="(max-width: 760px) 100vw, 50vw" /> : <ProductImage product={product} sizes="(max-width: 760px) 100vw, 50vw" />}</div>
      {product.sheet && <div className="gallery-thumbnails"><button className={!sheet ? "selected" : ""} aria-pressed={!sheet} onClick={() => setSheet(false)}>Gift view</button><button className={sheet ? "selected" : ""} aria-pressed={sheet} onClick={() => setSheet(true)}>Full catalogue sheet</button></div>}
      <p className="image-note">Imagery from the supplied RUVAANI catalogue. Final contents, colours and packaging are confirmed before ordering.</p>
      {product.sheet && <a className="text-link" href={product.sheet} target="_blank" rel="noopener noreferrer">Open original catalogue sheet <ArrowUpRight size={15} /></a>}
    </div>
    <div className="product-info">
      <span className="eyebrow">{product.category}</span><h1>{product.name}</h1><p className="product-tagline">{product.subtitle}</p>
      <div className="detail-price"><strong>{product.cataloguePrice ? formatPrice(product.cataloguePrice) : "Price on request"}</strong><span>{product.cataloguePrice ? "As listed in the supplied catalogue" : "Quoted according to customisation"}</span></div>
      <div className="quote-detail-note"><PenLine size={20} /><p><strong>Made for you, from 10 gifts.</strong><br />Your final quote confirms availability, branding, tax and delivery. No online checkout.</p></div>
      <form action="/corporate#enquiry" className="quote-product-form" onSubmit={validateQuantity}>
        <input type="hidden" name="product" value={product.id} />
        <label>Quantity for your quote<input type="number" name="quantity" min={10} max={100000} step={1} value={quantity} onChange={(event) => { setQuantity(event.target.value); setError(""); }} required /></label>
        <button className="button button-primary">Request a quote <ArrowUpRight size={18} /></button>
        <button type="button" className="button button-outline detail-wishlist save-gift" aria-label={saved ? "Saved gift. Remove from wishlist" : "Save gift to wishlist"} aria-pressed={saved} onClick={() => toggleWishlist(product.id)}><Heart size={20} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save gift"}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="product-accordions">
        <details><summary>About this gift</summary><p>{product.description}</p></details>
        {product.contents && <details open><summary>Inside the hamper</summary><ul>{product.contents.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul></details>}
        <details open={!product.contents}><summary>Make it yours</summary><p>{product.personalizable ? "Discuss company branding, names, messages and presentation with our team. Artwork and customisation are approved before production." : "Include this item in a bespoke hamper and discuss the available finishes and presentation with our team."} No personalisation fee is assumed.</p></details>
        <details><summary>Pricing & delivery</summary><p>{product.cataloguePrice ? "The displayed price is transcribed from the supplied product sheet. " : "A fixed price was not supplied for this item. "}Quantity, exact contents, taxes, branding and delivery are confirmed in writing. No online payment is collected here. <Link href="/policies/shipping">Delivery information</Link>.</p></details>
      </div>
      <div className="bulk-note">Building a bespoke collection? <Link href={quoteHref()}>Share your complete gifting brief <ArrowUpRight size={14} /></Link></div>
    </div>
  </div>;
}
