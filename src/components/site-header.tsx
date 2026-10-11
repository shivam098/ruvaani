"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Heart, Menu, Search, X } from "lucide-react";
import { useStore } from "./store-provider";
import { BrandLogo } from "./brand-logo";
import { collectionHref, giftCategories, giftFestivals, giftOccasions } from "@/lib/discovery";

const groups = [
  { label: "Shop by Category", items: giftCategories },
  { label: "Occasions", items: giftOccasions },
  { label: "Festivals", items: giftFestivals },
];

export function SiteHeader() {
  const { wishlist } = useStore();
  const [menu, setMenu] = useState(false);
  const search = useRef<HTMLDialogElement>(null);
  const header = useRef<HTMLElement>(null);
  const path = usePathname();
  const closeNavigation = useCallback(() => {
    setMenu(false);
    header.current?.querySelectorAll("details").forEach((element) => { element.open = false; });
  }, []);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !header.current?.contains(event.target)) closeNavigation();
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const expanded = header.current?.querySelector<HTMLDetailsElement>("details[open]");
      if (header.current?.querySelector(".mobile-nav")) header.current.querySelector<HTMLButtonElement>(".mobile-menu-button")?.focus();
      else expanded?.querySelector("summary")?.focus();
      closeNavigation();
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [closeNavigation]);
  const navigation = groups.map(({ label, items }) => <details className="nav-group" key={label} onToggle={(event) => {
    if (event.currentTarget.open) header.current?.querySelectorAll("details").forEach((other) => { if (other !== event.currentTarget) other.open = false; });
  }}><summary>{label}<ChevronDown size={14} /></summary><div className="nav-dropdown">{items.map((collection) => <Link href={collectionHref(collection)} key={collection.slug} data-track-event={`${collection.kind}_click`} data-track-target={collection.slug}>{collection.kind === "festival" ? collection.slug === "wedding-season" ? "Wedding Season" : collection.occasion : collection.title}<ArrowUpRight size={14} /></Link>)}</div></details>);
  return <>
    <header ref={header} className="site-header studio-header" onClick={(event) => { if (event.target instanceof Element && event.target.closest("a")) closeNavigation(); }}>
      <div className="header-main wrap">
        <button className="icon-button mobile-menu-button" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
        <BrandLogo />
        <nav className="desktop-nav studio-nav" aria-label="Main navigation">{navigation}<Link href="/about" className={path === "/about" ? "active" : ""}>Our Story</Link><Link href="/contact" className={path === "/contact" ? "active" : ""}>Contact</Link></nav>
        <div className="header-actions">
          <Link href="/catalogue" className="button button-outline header-catalogue">View Catalogue</Link>
          <Link href="/corporate#enquiry" className="button button-primary header-quote" data-track-event="enquiry_start" data-track-target="header">Enquire <ArrowUpRight size={15} /></Link>
          <button className="icon-button" aria-label="Search gifts" onClick={() => search.current?.showModal()}><Search size={20} /></button>
          <Link className="icon-button bag-link" aria-label="Wishlist" href="/wishlist"><Heart size={20} />{wishlist.length > 0 && <span className="bag-count">{wishlist.length}</span>}</Link>
        </div>
      </div>
      {menu && <nav id="mobile-navigation" className="mobile-nav studio-mobile-nav" aria-label="Mobile navigation">{navigation}<Link href="/catalogue">View Catalogue <ArrowUpRight size={16} /></Link>{[["All gifts", "/shop"], ["Our Story", "/about"], ["Contact", "/contact"], ["Gift finder", "/gift-finder"], ["My account", "/account"]].map(([label, href]) => <Link href={href} key={href}>{label}<ArrowUpRight size={16} /></Link>)}</nav>}
    </header>
    <dialog ref={search} aria-label="Find a thoughtful gift" className="search-dialog" onClick={(event) => { if (event.target === event.currentTarget) search.current?.close(); }}>
      <div className="dialog-heading"><span className="eyebrow">A THOUGHTFUL GIFT STARTS HERE</span><button className="icon-button" aria-label="Close search" onClick={() => search.current?.close()}><X /></button></div>
      <h2>What are you looking for?</h2><form action="/shop" onSubmit={() => search.current?.close()} className="search-form"><Search size={21} /><input autoFocus name="q" type="search" placeholder="Try hampers, diaries or candles..." aria-label="Search the gift catalogue" required /><button className="button button-primary" type="submit">Search</button></form>
      <p>Prefer to browse? <Link href="/catalogue" onClick={() => search.current?.close()}>Discover the catalogue <ArrowUpRight size={15} /></Link></p>
    </dialog>
  </>;
}
