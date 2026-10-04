"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Gift, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { calculateCart, cartLineKey, formatPrice, FREE_SHIPPING_THRESHOLD, PERSONALIZATION_FEE } from "@/lib/commerce";
import { useStore } from "./store-provider";
import { GiftArtwork } from "./gift-artwork";
import { ProductCard } from "./product-card";

export function Bag({ wishlist = false }: { wishlist?: boolean }) {
  const store = useStore();
  if (wishlist) {
    const products = store.products.filter((p) => store.wishlist.includes(p.id));
    return products.length ? <div className="product-grid section wrap">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <Empty title="A little room for your favorites." description="See something lovely? Tap the heart to keep it here." />;
  }
  if (!store.cart.length) return <Empty title="Your next thoughtful moment starts here." description="Your bag is waiting for a little something special." />;
  let totals;
  let error = "";
  try { totals = calculateCart(store.cart, store.products); }
  catch (e) { error = e instanceof Error ? e.message : "Please review your bag."; }
  return <div className="wrap bag-layout">
    <div><div className="bag-topline"><span>{store.cart.reduce((sum, c) => sum + c.quantity, 0)} thoughtful gifts</span><Link href="/shop" className="text-link"><ArrowLeft size={14} />Keep exploring</Link></div>
      {store.cart.map((line) => {
        const product = store.products.find((p) => p.id === line.productId);
        const key = cartLineKey(line);
        if (!product) return <div key={key} className="bag-item"><p>This gift is no longer available.</p><button onClick={() => store.remove(key)}>Remove unavailable gift</button></div>;
        return <article key={key} className="bag-item"><Link href={`/products/${product.slug}`} className="bag-art"><GiftArtwork kind={product.artwork} color={product.color} /></Link><div className="bag-item-info"><span className="eyebrow">{product.category}</span><h2><Link href={`/products/${product.slug}`}>{product.name}</Link></h2><p>{product.subtitle}</p>{(line.name || line.message) && <div className="bag-personalization"><span><Gift size={13} /> A little more personal</span>{line.name && <p>For: {line.name}</p>}{line.message && <p>&ldquo;{line.message}&rdquo;</p>}</div>}<div className="quantity-picker small"><button aria-label={`Decrease ${product.name} quantity`} disabled={line.quantity <= product.minimumOrderQuantity} onClick={() => store.updateQuantity(key, line.quantity - 1)}><Minus size={13} /></button><span>{line.quantity}</span><button aria-label={`Increase ${product.name} quantity`} onClick={() => store.updateQuantity(key, line.quantity + 1)}><Plus size={13} /></button></div></div><div className="bag-item-price"><strong>{formatPrice((product.price + (line.name || line.message ? PERSONALIZATION_FEE : 0)) * line.quantity)}</strong><button aria-label={`Remove ${product.name} from bag`} onClick={() => store.remove(key)}><Trash2 size={16} /></button></div></article>;
      })}
    </div>
    <aside className="order-summary"><span className="eyebrow">A LITTLE PREVIEW OF THE JOY</span><h2>Your thoughtful total</h2>{error && <p className="form-error" role="alert">{error}</p>}{totals && <><div className="summary-row"><span>Your gifts</span><strong>{formatPrice(totals.subtotal)}</strong></div><div className="summary-row"><span>Gift-ready packaging</span><span>With our love</span></div><div className="summary-row"><span>Shipping</span><span>{totals.shipping ? formatPrice(totals.shipping) : "Complimentary"}</span></div><div className="summary-total"><span>Total</span><strong>{formatPrice(totals.total)}</strong></div><p className="tax-note">Inclusive of taxes. No little surprises.</p><div className="shipping-progress"><Truck size={18} /><span>{totals.subtotal >= FREE_SHIPPING_THRESHOLD ? "Your gifts qualify for complimentary shipping." : `A little more joy? Add ${formatPrice(FREE_SHIPPING_THRESHOLD - totals.subtotal)} for complimentary shipping.`}</span></div><Link href="/checkout" className="button button-primary full-width">{store.demo ? "Preview checkout" : "Continue to checkout"}<ArrowRight size={18} /></Link></>}{store.demo && <p className="demo-inline">Demo store. No payment will be collected and no real order will be placed.</p>}<span className="summary-footer"><Gift size={16} /> A feeling, beautifully wrapped.</span></aside>
  </div>;
}

function Empty({ title, description }: { title: string; description: string }) {
  return <div className="empty-state page-empty wrap"><ShoppingBag size={38} strokeWidth={1.1} /><h2>{title}</h2><p>{description}</p><Link href="/shop" className="button button-primary">Discover something lovely <ArrowRight size={17} /></Link></div>;
}
