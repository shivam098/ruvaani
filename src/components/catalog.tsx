"use client";

import { useDeferredValue, useState } from "react";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import { categories, occasions } from "@/lib/catalog-data";
import { filterProducts, formatPrice } from "@/lib/commerce";
import { useStore } from "./store-provider";
import { ProductCard } from "./product-card";

export function Catalog({ initial }: { initial: Record<string, string | string[] | undefined> }) {
  const { products, demo } = useStore();
  const [query, setQuery] = useState(String(initial.q ?? ""));
  const [category, setCategory] = useState(String(initial.category ?? "All gifts"));
  const [occasion, setOccasion] = useState(String(initial.occasion ?? ""));
  const [personalized, setPersonalized] = useState(initial.personalized === "true");
  const [maxPrice, setMaxPrice] = useState(500000);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const filtered = filterProducts(products, { query: deferredQuery, category, occasion, personalizable: personalized, maxPrice, sort });
  const pageSize = 6;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  function reset() { setQuery(""); setCategory("All gifts"); setOccasion(""); setPersonalized(false); setMaxPrice(500000); setPage(1); }
  return (
    <div className="wrap shop-layout">
      <aside className={`filter-sidebar ${filtersOpen ? "filters-open" : ""}`} aria-label="Filter gifts">
        <div className="filter-heading"><h2>A little more you</h2><button className="text-button" onClick={reset}>Reset</button></div>
        <fieldset><legend>THE COLLECTION</legend>{["All gifts", ...categories].map((c) => <label className="filter-radio" key={c}><input type="radio" name="category" checked={category === c} onChange={() => { setCategory(c); setPage(1); }} /><span>{c}</span><small>{products.filter((p) => c === "All gifts" || p.category === c).length}</small></label>)}</fieldset>
        <fieldset><legend>A THOUGHTFUL BUDGET</legend><label className="range-label" htmlFor="budget">Up to <strong>{formatPrice(maxPrice)}</strong></label><input id="budget" type="range" min="100000" max="500000" step="50000" value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }} /><div className="range-extents"><span>₹1,000</span><span>₹5,000</span></div></fieldset>
        <fieldset><legend>THE OCCASION</legend><select aria-label="Filter by occasion" value={occasion} onChange={(e) => { setOccasion(e.target.value); setPage(1); }}><option value="">Every kind of moment</option>{occasions.map((o) => <option key={o}>{o}</option>)}</select></fieldset>
        <fieldset><legend>MAKE IT THEIRS</legend><label className="checkbox-label"><input type="checkbox" checked={personalized} onChange={(e) => { setPersonalized(e.target.checked); setPage(1); }} />Personalizable gifts only</label></fieldset>
        <div className="filter-help"><span>Gifting for a team?</span><p>Let&apos;s put a little more thought into your next big gesture.</p><a href="/corporate" className="text-link">Talk to us <ArrowRight size={15} /></a></div>
      </aside>
      <div className="catalog-results">
        <div className="catalog-toolbar"><label className="catalog-search"><Search size={18} /><input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Find something lovely..." aria-label="Search gifts" /></label><button className="button button-outline filter-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>{filtersOpen ? <X size={17} /> : <SlidersHorizontal size={17} />}Filters</button><select aria-label="Sort gifts" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}><option value="featured">Our favorites first</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></div>
        <div className="results-note"><span aria-live="polite">{filtered.length} thoughtful {filtered.length === 1 ? "find" : "finds"}</span>{demo && <span>Illustrative collection · Demo prices</span>}</div>
        {visible.length ? <div className="product-grid catalog-grid">{visible.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="empty-state"><Search size={32} /><h2>No gifts just yet.</h2><p>Try another search or give your filters a little room.</p><button className="button button-primary" onClick={reset}>Explore all gifts <ArrowRight size={17} /></button></div>}
        {filtered.length > pageSize && <nav className="pagination" aria-label="Product pages">{Array.from({ length: Math.ceil(filtered.length / pageSize) }, (_, i) => <button key={i} aria-label={`Page ${i + 1}`} aria-current={currentPage === i + 1 ? "page" : undefined} onClick={() => { setPage(i + 1); document.querySelector(".catalog-toolbar")?.scrollIntoView({ block: "start", behavior: "smooth" }); }}>{i + 1}</button>)}</nav>}
      </div>
    </div>
  );
}
