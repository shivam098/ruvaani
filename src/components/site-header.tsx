"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowUpRight, Gift, Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useStore } from "./store-provider";

const links = [
  ["All gifts", "/shop"], ["Corporate gifting", "/corporate"], ["Festive collections", "/shop?occasion=Diwali"],
  ["Personalized gifts", "/shop?personalized=true"], ["Our story", "/about"],
];

export function SiteHeader() {
  const { cart } = useStore();
  const [menu, setMenu] = useState(false);
  const search = useRef<HTMLDialogElement>(null);
  const path = usePathname();
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <>
      <div className="announcement"><span>A little thought. A lasting impression.</span><Link href="/corporate">Make it personal. Make it RUVAANI <ArrowUpRight size={13} /></Link></div>
      <header className="site-header">
        <div className="header-main wrap">
          <button className="icon-button mobile-menu-button" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
          <Link href="/" className="wordmark" aria-label="RUVAANI home">ruvaani<span>GIFTS WITH A LITTLE MORE HEART</span></Link>
          <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label, href]) => <Link key={label} href={href} className={path === href ? "active" : ""}>{label}</Link>)}</nav>
          <div className="header-actions">
            <button className="icon-button" aria-label="Search gifts" onClick={() => search.current?.showModal()}><Search size={20} /></button>
            <Link className="icon-button hide-small" aria-label="My account" href="/account"><UserRound size={20} /></Link>
            <Link className="icon-button hide-small" aria-label="Wishlist" href="/wishlist"><Heart size={20} /></Link>
            <Link className="icon-button bag-link" aria-label={`Shopping bag, ${count} items`} href="/cart"><ShoppingBag size={20} />{count > 0 && <span className="bag-count">{count}</span>}</Link>
          </div>
        </div>
        {menu && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{[...links, ["Gift finder", "/gift-finder"], ["Wishlist", "/wishlist"], ["My account", "/account"]].map(([label, href]) => <Link key={label} href={href} onClick={() => setMenu(false)}>{label}<ArrowUpRight size={16} /></Link>)}</nav>}
      </header>
      <dialog ref={search} aria-label="Find a thoughtful gift" className="search-dialog" onClick={(e) => { if (e.target === e.currentTarget) search.current?.close(); }}>
        <div className="dialog-heading"><span className="eyebrow">A GOOD GIFT IS JUST A SEARCH AWAY</span><button className="icon-button" aria-label="Close search" onClick={() => search.current?.close()}><X /></button></div>
        <h2>What are you looking for?</h2>
        <form action="/shop" onSubmit={() => search.current?.close()} className="search-form"><Search size={21} /><input autoFocus name="q" type="search" placeholder="Try hampers, coffee or Diwali..." aria-label="Search the gift catalogue" required /><button className="button button-primary" type="submit">Search</button></form>
        <p className="muted">Need a little inspiration? <Link href="/gift-finder" onClick={() => search.current?.close()}>Try our gift finder <Gift size={15} /></Link></p>
      </dialog>
    </>
  );
}
