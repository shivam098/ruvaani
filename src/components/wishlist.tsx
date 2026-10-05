"use client";

import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { useStore } from "./store-provider";
import { ProductCard } from "./product-card";

export function Wishlist() {
  const { products, wishlist } = useStore();
  const saved = products.filter((product) => wishlist.includes(product.id));
  return <section className="wrap section">{saved.length ? <><p className="helper-text">Your shortlist stays in this browser. Request a quote to confirm your selection, quantity and customisation.</p><div className="product-grid">{saved.map((product) => <ProductCard key={product.id} product={product} />)}</div></> : <div className="empty-state"><Heart size={35} /><h2>A little room for your favorites.</h2><p>Save the gifts that catch your eye, then make them your own.</p><Link className="button button-primary" href="/shop">Explore the collection <ArrowUpRight size={17} /></Link></div>}</section>;
}
