"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowUpRight, Gift, Heart, Menu, Pause, Play, Search, Sparkles, UserRound, X } from "lucide-react";
import { useStore } from "./store-provider";
import { BrandLogo } from "./brand-logo";

const links = [
  ["The collection", "/shop"], ["Corporate gifting", "/corporate"],
  ["Our story", "/about"], ["Contact", "/contact"],
];
const festivalAnnouncement = "The Diwali edit is here";

export function SiteHeader() {
  const { wishlist } = useStore();
  const [menu, setMenu] = useState(false);
  const [announcementPaused, setAnnouncementPaused] = useState(false);
  const search = useRef<HTMLDialogElement>(null);
  const path = usePathname();
  return (
    <>
      <div className="announcement" data-paused={announcementPaused}>
        <Link href="/#diwali" className="announcement-link" aria-label={festivalAnnouncement}>
          <span id="announcement-track" className="announcement-track" aria-hidden="true">
            {[0, 1].map((copy) => <span className="announcement-group" key={copy}>
              {[0, 1, 2].map((item) => <span className="announcement-item" key={item}><Sparkles size={14} />{festivalAnnouncement}<ArrowUpRight size={14} /></span>)}
            </span>)}
          </span>
          <span className="announcement-static" aria-hidden="true"><Sparkles size={14} />{festivalAnnouncement}<ArrowUpRight size={14} /></span>
        </Link>
        <button type="button" className="announcement-pause" aria-controls="announcement-track" aria-label={announcementPaused ? "Resume announcement" : "Pause announcement"} onClick={() => setAnnouncementPaused(!announcementPaused)}>{announcementPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>
      </div>
      <header className="site-header">
        <div className="header-main wrap">
          <button className="icon-button mobile-menu-button" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
          <BrandLogo />
          <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label, href]) => <Link key={label} href={href} className={path === href ? "active" : ""}>{label}</Link>)}</nav>
          <div className="header-actions">
            <button className="icon-button" aria-label="Search gifts" onClick={() => search.current?.showModal()}><Search size={20} /></button>
            <Link className="icon-button hide-small" aria-label="My account" href="/account"><UserRound size={20} /></Link>
            <Link className="icon-button bag-link" aria-label="Wishlist" href="/wishlist"><Heart size={20} />{wishlist.length > 0 && <span className="bag-count">{wishlist.length}</span>}</Link>
            <Link href="/corporate#enquiry" className="header-quote">Request a quote <ArrowUpRight size={15} /></Link>
          </div>
        </div>
        {menu && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{[...links, ["Gift finder", "/gift-finder"], ["Wishlist", "/wishlist"], ["My account", "/account"]].map(([label, href]) => <Link key={label} href={href} onClick={() => setMenu(false)}>{label}<ArrowUpRight size={16} /></Link>)}</nav>}
      </header>
      <dialog ref={search} aria-label="Find a thoughtful gift" className="search-dialog" onClick={(e) => { if (e.target === e.currentTarget) search.current?.close(); }}>
        <div className="dialog-heading"><span className="eyebrow">A GOOD GIFT IS JUST A SEARCH AWAY</span><button className="icon-button" aria-label="Close search" onClick={() => search.current?.close()}><X /></button></div>
        <h2>What are you looking for?</h2>
        <form action="/shop" onSubmit={() => search.current?.close()} className="search-form"><Search size={21} /><input autoFocus name="q" type="search" placeholder="Try hampers, diaries or candles..." aria-label="Search the gift catalogue" required /><button className="button button-primary" type="submit">Search</button></form>
        <p className="muted">Need a little inspiration? <Link href="/gift-finder" onClick={() => search.current?.close()}>Try our gift finder <Gift size={15} /></Link></p>
      </dialog>
    </>
  );
}
