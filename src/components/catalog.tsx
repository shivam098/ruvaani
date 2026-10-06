"use client";

import { useDeferredValue, useState } from "react";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { categories, filterCatalogue, recipients, quoteHref as createQuoteHref } from "@/lib/catalog-data";
import { filterDiscovery, findCollection, giftCategories, giftOccasions, giftFestivals, priceBands, collectionKey } from "@/lib/discovery";
import { quoteContextSchema } from "@/lib/validation";
import { useStore } from "./store-provider";
import { ProductCard } from "./product-card";

export function Catalog({ initial, productIds, quoteHref = "/corporate#enquiry" }: { initial: Record<string, string | string[] | undefined>; productIds?: string[]; quoteHref?: string }) {
  const { products } = useStore();
  const [query, setQuery] = useState(String(initial.q ?? ""));
  const [category, setCategory] = useState(String(initial.category ?? "All gifts"));
  const [personalized, setPersonalized] = useState(initial.personalized === "true");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [discovery, setDiscovery] = useState({
    collection: String(initial.collection ?? ""), occasion: String(initial.occasion ?? ""),
    festival: String(initial.festival ?? ""), budget: String(initial.budget ?? ""), recipient: String(initial.recipient ?? ""),
  });
  const deferredQuery = useDeferredValue(query);
  const baseContext = quoteContextSchema.parse(Object.fromEntries(new URL(quoteHref, "https://ruvaani.local").searchParams));
  const selectedEdit = findCollection(discovery.festival || discovery.occasion || discovery.collection || "");
  const quoteContext = {
    collection: baseContext.collection ?? (selectedEdit ? collectionKey(selectedEdit) : undefined),
    occasion: baseContext.occasion ?? selectedEdit?.occasion,
    recipient: discovery.recipient || baseContext.recipient || selectedEdit?.recipient,
  };
  const enquiryHref = createQuoteHref(quoteContext);
  const source = productIds ? products.filter((product) => productIds.includes(product.id)) : products;
  const filtered = filterDiscovery(filterCatalogue(source, { query: deferredQuery, category, personalizable: personalized, sort }), discovery);
  const pageSize = 6;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  function reset() { setQuery(""); setCategory("All gifts"); setPersonalized(false); setSort("featured"); setDiscovery({ collection: "", occasion: "", festival: "", budget: "", recipient: "" }); setPage(1); }
  return (
    <div className="wrap shop-layout">
      <aside className={`filter-sidebar ${filtersOpen ? "filters-open" : ""}`} aria-label="Filter gifts">
        <div className="filter-heading"><h2>A little more you</h2><button className="text-button" onClick={reset}>Reset</button></div>
        <div className="discovery-filters">
          {([{ field: "collection", label: "Gift type", items: giftCategories }, { field: "occasion", label: "Occasion", items: giftOccasions }, { field: "festival", label: "Festival", items: giftFestivals }] as const).map(({ field, label, items }) => <label key={field}>{label}<select value={discovery[field]} onChange={(event) => { setDiscovery((previous) => ({ ...previous, [field]: event.target.value })); setPage(1); }}><option value="">All {label.toLowerCase()}s</option>{items.map((item) => <option key={item.slug} value={collectionKey(item)}>{item.title}</option>)}</select></label>)}
          <label>Indicative price<select value={discovery.budget} onChange={(event) => { setDiscovery((previous) => ({ ...previous, budget: event.target.value })); setPage(1); }}><option value="">All prices</option>{priceBands.map((band) => <option value={band.id} key={band.id}>{band.label}</option>)}<option value="on-request">Price on request</option></select></label>
          <label>Recipient<select value={discovery.recipient} onChange={(event) => { setDiscovery((previous) => ({ ...previous, recipient: event.target.value })); setPage(1); }}><option value="">All recipients</option>{recipients.map((recipient) => <option key={recipient}>{recipient}</option>)}</select></label>
        </div>
        <fieldset><legend>CATALOGUE FAMILY</legend>{["All gifts", ...categories].map((c) => <label className="filter-radio" key={c}><input type="radio" name="category" checked={category === c} onChange={() => { setCategory(c); setPage(1); }} /><span>{c}</span><small>{source.filter((p) => c === "All gifts" || p.category === c).length}</small></label>)}</fieldset>
        <fieldset><legend>MAKE IT THEIRS</legend><label className="checkbox-label"><input type="checkbox" checked={personalized} onChange={(e) => { setPersonalized(e.target.checked); setPage(1); }} />Personalizable gifts only</label></fieldset>
        <div className="filter-help"><span>Made to your brief</span><p>Price bands use advertised starting or reference prices, not final quotes. Unpriced gifts appear only under All prices or Price on request.</p><Link href={enquiryHref} className="text-link">Request a quote <ArrowRight size={15} /></Link><Link href="/catalogue" className="text-link">View Catalogue <ArrowRight size={15} /></Link></div>
      </aside>
      <div className="catalog-results">
        <div className="catalog-toolbar"><label className="catalog-search"><Search size={18} /><input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Find something lovely..." aria-label="Search gifts" /></label><button className="button button-outline filter-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>{filtersOpen ? <X size={17} /> : <SlidersHorizontal size={17} />}Filters</button><select aria-label="Sort gifts" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}><option value="featured">Catalogue order</option><option value="name">Name: A to Z</option></select></div>
        <div className="results-note"><span aria-live="polite">{filtered.length} thoughtful {filtered.length === 1 ? "find" : "finds"}</span><span>Catalogue preview · Quotes from 10 gifts</span></div>
        {discovery.budget && <p className="notice">Indicative catalogue prices only. Starting prices are not fixed quotes; final contents, tax and delivery require confirmation.</p>}
        {visible.length ? <div className="product-grid catalog-grid">{visible.map((p) => <ProductCard key={p.id} product={p} quoteContext={quoteContext} />)}</div> : <div className="empty-state"><Search size={32} /><h2>No gifts just yet.</h2><p>{source.length ? "No listed gifts match this combination. Clear a filter or discuss a custom brief." : "No standalone products are listed in this collection yet. A custom enquiry is not a stock or fulfilment promise."}</p>{source.length > 0 && <button className="button button-outline" onClick={reset}>Clear filters <ArrowRight size={17} /></button>}<Link className="button button-primary" href={enquiryHref}>Discuss your gifting brief <ArrowRight size={17} /></Link><Link className="text-link" href="/shop">Explore all gifts <ArrowRight size={17} /></Link></div>}
        {filtered.length > pageSize && <nav className="pagination" aria-label="Product pages">{Array.from({ length: Math.ceil(filtered.length / pageSize) }, (_, i) => <button key={i} aria-label={`Page ${i + 1}`} aria-current={currentPage === i + 1 ? "page" : undefined} onClick={() => { setPage(i + 1); document.querySelector(".catalog-toolbar")?.scrollIntoView({ block: "start", behavior: "smooth" }); }}>{i + 1}</button>)}</nav>}
      </div>
    </div>
  );
}
