"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Gift, Heart, Minus, PenLine, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, PERSONALIZATION_FEE } from "@/lib/commerce";
import { GiftArtwork } from "./gift-artwork";
import { useStore } from "./store-provider";

export function ProductDetails({ product }: { product: Product }) {
  const { add, wishlist, toggleWishlist, demo } = useStore();
  const [quantity, setQuantity] = useState(product.minimumOrderQuantity);
  const [personalize, setPersonalize] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pincode, setPincode] = useState("");
  const [delivery, setDelivery] = useState("");
  const [view, setView] = useState(0);
  const customized = personalize && (name.trim() || message.trim());
  function addToBag() {
    if (personalize && !customized) { setError("Add a name or message, or turn off personalization."); return; }
    setError("");
    add({ productId: product.id, quantity, name: personalize ? name.trim() : "", message: personalize ? message.trim() : "" });
  }
  return (
    <div className="product-detail-grid">
      <div className="product-gallery"><div className={`main-artwork artwork-view-${view}`}><GiftArtwork kind={product.artwork} color={product.color} />{view === 1 && <div className="artwork-personalization"><span>A NOTE, JUST FOR YOU</span><h3>{name || "Someone wonderful"}</h3><p>{message || "A little something to say you matter."}</p><span>THOUGHTFULLY YOURS, RUVAANI</span></div>}</div><div className="gallery-thumbnails"><button className={view === 0 ? "selected" : ""} onClick={() => setView(0)} aria-label="View gift illustration"><GiftArtwork kind={product.artwork} color={product.color} /></button><button className={view === 1 ? "selected" : ""} onClick={() => setView(1)} aria-label="Preview the message card"><PenLine size={24} /><span>The little details</span></button></div><p className="image-note">Collection illustration. Final contents and packaging may vary; confirm before ordering.</p></div>
      <div className="product-info"><span className="eyebrow">{product.category} · THE RUVAANI COLLECTION</span><h1>{product.name}</h1><p className="product-tagline">{product.subtitle}</p><div className="detail-price"><strong>{formatPrice(product.price + (customized ? PERSONALIZATION_FEE : 0))}</strong>{!customized && product.compareAtPrice > product.price && <del>{formatPrice(product.compareAtPrice)}</del>}<span>Inclusive of taxes</span></div><p className="detail-description">{product.description}</p><div className="stock-line"><span className={`status-dot ${product.stock ? "" : "out"}`} />{product.stock ? `${product.stock} available for a thoughtful moment` : "This gift is currently out of stock"}</div>
        {product.personalizable && <div className="personalization-box"><label className="personalization-toggle"><span><PenLine size={19} /><strong>Make it a little more theirs</strong></span><input type="checkbox" checked={personalize} onChange={(e) => { setPersonalize(e.target.checked); setError(""); }} aria-label="Add personalization" /></label><p>A name, a note, a little extra thought. +{formatPrice(PERSONALIZATION_FEE)} per gift.</p>{personalize && <div className="personalization-fields"><label>Their name<input value={name} maxLength={40} placeholder="e.g. Ananya" onChange={(e) => setName(e.target.value)} /></label><label>Your little note<textarea value={message} maxLength={180} rows={3} placeholder="Thank you for being you..." onChange={(e) => setMessage(e.target.value)} /><small>{message.length}/180 characters</small></label><button className="text-link" onClick={() => setView(1)}>Preview your message card <ArrowRight size={15} /></button></div>}</div>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="add-to-bag-row"><div className="quantity-picker"><button aria-label="Decrease quantity" disabled={quantity <= product.minimumOrderQuantity} onClick={() => setQuantity(quantity - 1)}><Minus size={15} /></button><span aria-live="polite">{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= Math.min(product.stock, 1000)} onClick={() => setQuantity(quantity + 1)}><Plus size={15} /></button></div><button className="button button-primary" disabled={!product.stock} onClick={addToBag}><ShoppingBag size={18} />{product.stock ? "Add to my bag" : "Out of stock"}</button><button className="button button-outline detail-wishlist" aria-label="Save gift to wishlist" aria-pressed={wishlist.includes(product.id)} onClick={() => toggleWishlist(product.id)}><Heart size={20} fill={wishlist.includes(product.id) ? "currentColor" : "none"} /></button></div>
        <div className="pincode-check"><Truck size={20} /><form onSubmit={(e) => { e.preventDefault(); setDelivery(/^[1-9]\d{5}$/.test(pincode) ? demo ? "Valid format. Delivery availability is not connected in this demo." : "Valid pincode format. Delivery availability will be confirmed by our team; this is not a serviceability check." : "Please enter a valid six-digit pincode."); }}><input aria-label="Delivery pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter delivery pincode" inputMode="numeric" maxLength={6} /><button type="submit">Check</button></form></div>{delivery && <p className="helper-text" role="status">{delivery}</p>}
        <div className="detail-promises"><span><Gift size={17} />Beautifully gift-ready</span><span><ShieldCheck size={17} />Thoughtfully packed</span></div>
        <div className="product-accordions"><details open><summary>Inside this little box of joy</summary><ul>{product.includes.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul></details><details><summary>The thoughtful details</summary><p>SKU: {product.id.toUpperCase()}. Minimum order: {product.minimumOrderQuantity}. {product.personalizable ? "Personalization adds a name or gift note to your selection." : "This collection is available as curated."} Product prices are inclusive of taxes.</p></details><details><summary>Shipping & returns</summary><p>Standard shipping is ₹99, complimentary on orders of ₹1,999 or more. These are sample commercial terms until launch. <Link href="/policies/shipping">Read delivery information</Link> and <Link href="/policies/returns">return information</Link>.</p></details></div>
        <div className="bulk-note">A thoughtful gesture for a whole team? <Link href="/corporate">Let&apos;s talk bulk gifting <ArrowUpRightIcon /></Link></div>
      </div>
    </div>
  );
}

function ArrowUpRightIcon() { return <ArrowRight size={14} />; }
