import { catalogueProducts, quoteHref, type CatalogueItem } from "./catalog-data";

export type CollectionKind = "category" | "occasion" | "festival";
export interface GiftCollection {
  kind: CollectionKind;
  slug: string;
  title: string;
  caption: string;
  description: string;
  image?: string;
  productIds: string[];
  occasion?: string;
  recipient?: string;
}

const signature = ["rc-017", "rc-018", "rc-019"];
const festive = ["rc-018", "rc-019", "rc-001", "rc-002", "rc-003", "rc-004", "rc-005", "rc-011", "rc-012", "rc-013"];
const corporate = [...signature, "rc-006", "rc-007", "rc-008", "rc-009", "rc-010", "rc-015", "rc-016"];
const celebration = ["rc-011", "rc-003", "rc-004", "rc-005", "rc-012", "rc-013", "rc-014", "rc-015", "rc-016"];

export const giftCategories: GiftCollection[] = [
  { kind: "category", slug: "hampers", title: "Gift Hampers", caption: "Curated together, beautifully presented.", description: "Signature boxes, Navratri specials and gourmet selections. Choose a starting point and make the details yours.", image: "/catalogue/single-premium-box.webp", productIds: [...signature, "rc-020", "rc-021", "rc-011"] },
  { kind: "category", slug: "festive-gifts", title: "Festive Gifts", caption: "Seasonal warmth, thoughtfully chosen.", description: "Little lights, meaningful keepsakes and hampers for your celebrations.", image: "/catalogue/festive-collection.webp", productIds: ["rc-020", "rc-021", ...festive] },
  { kind: "category", slug: "personalised", title: "Personalised Gifts", caption: "Made meaningful with your personal touch.", description: "Explore catalogue entries that support personalisation, then discuss artwork, presentation and the final quotation.", image: "/catalogue/customised-diary.webp", productIds: catalogueProducts.filter((p) => p.personalizable).map((p) => p.id) },
  { kind: "category", slug: "home-decor", title: "Home & Décor", caption: "Beautiful pieces for personal spaces.", description: "Devotional keepsakes, decorative pieces and candle designs from the supplied collection.", image: "/catalogue/divine-trio-gold-frame.webp", productIds: ["rc-001", "rc-002", "rc-003", "rc-004", "rc-005"] },
  { kind: "category", slug: "drinkware", title: "Drinkware", caption: "Everyday essentials, elevated.", description: "Start with our listed branded bottle. Capacity, finish and customisation are confirmed in your quotation.", image: "/catalogue/customised-insulated-temperature-water-bottle.webp", productIds: ["rc-006"] },
  { kind: "category", slug: "gourmet", title: "Gourmet & Indulgence", caption: "A thoughtful taste of joy.", description: "Gourmet hampers, roasted nuts and presentation options. Contents, pack weights and dietary information require confirmation.", image: "/catalogue/gourmet-hampers.webp", productIds: ["rc-011", "rc-012", "rc-013", "rc-014"] },
  { kind: "category", slug: "wellness", title: "Wellness", caption: "A little care, made personal.", description: "There are no standalone wellness products in the supplied catalogue yet. Share your brief for discussion; products, availability and pricing are not confirmed.", productIds: [] },
  { kind: "category", slug: "tech-utility", title: "Tech & Utility", caption: "Useful ideas, thoughtfully considered.", description: "There are no standalone tech products in the supplied catalogue yet. Share what you have in mind for a custom enquiry, without a stock or fulfilment promise.", productIds: [] },
];

export const giftOccasions: GiftCollection[] = [
  { kind: "occasion", slug: "corporate", title: "Corporate Gifting", caption: "Your brand. Their moment.", description: "Thoughtfully curated gifts for the relationships behind your business.", image: "/catalogue/executive-corporate-hamper.webp", productIds: corporate, occasion: "Corporate events" },
  { kind: "occasion", slug: "employees", title: "For Employees", caption: "For every milestone they make possible.", description: "Welcome, celebrate and appreciate your team with a considered gifting brief.", image: "/catalogue/single-premium-box.webp", productIds: corporate, occasion: "Employee appreciation", recipient: "Employees" },
  { kind: "occasion", slug: "clients", title: "For Clients", caption: "More than a thank-you.", description: "Meaningful gestures for relationships that deserve a little more.", image: "/catalogue/corporate-hamper.webp", productIds: corporate, occasion: "Client gifting", recipient: "Clients" },
  { kind: "occasion", slug: "partners", title: "For Partners", caption: "Shared journeys. Thoughtful gestures.", description: "Curated ideas for the people building something meaningful alongside you.", image: "/catalogue/executive-corporate-hamper.webp", productIds: corporate, occasion: "Corporate events", recipient: "Partners" },
  { kind: "occasion", slug: "weddings", title: "Wedding Gifting", caption: "For beautiful beginnings.", description: "Keepsakes, gourmet details and presentation ideas for the people celebrating with you.", image: "/catalogue/floral-candles.webp", productIds: celebration, occasion: "Weddings", recipient: "Wedding guests" },
  { kind: "occasion", slug: "festive", title: "Festive Gifting", caption: "A moment worth remembering.", description: "Explore sourced gifts for celebrations, with the final assortment agreed in your quote.", image: "/catalogue/festive-collection.webp", productIds: ["rc-020", "rc-021", ...festive], occasion: "Celebrations" },
  { kind: "occasion", slug: "celebrations", title: "Personal Celebrations", caption: "For your people. For your moment.", description: "A considered starting point for birthdays, milestones and personal celebrations.", image: "/catalogue/gourmet-hampers.webp", productIds: celebration, occasion: "Celebrations", recipient: "Friends & family" },
];

export const giftFestivals: GiftCollection[] = [
  { kind: "festival", slug: "navratri", title: "The Navratri Special", caption: "Small gifts. Big blessings.", description: "Kanya / Kanjak cone hampers from ₹99 and dome hampers from ₹149. Advertised starting prices; final contents, tax and delivery are confirmed in your quote.", image: "/catalogue/navratri-collection.webp", productIds: ["rc-020", "rc-021"], occasion: "Navratri" },
  { kind: "festival", slug: "diwali", title: "The Diwali Edit", caption: "Make the moment a little more special.", description: "Thoughtful hampers, little lights and festive keepsakes for the people who make your year brighter.", image: "/catalogue/festive-collection.webp", productIds: festive, occasion: "Diwali" },
  { kind: "festival", slug: "holi", title: "The Colour Edit", caption: "Colour the gesture with thought.", description: "Gourmet and presentation ideas from the existing catalogue for a Holi gifting brief. Festival-specific additions require confirmation.", image: "/catalogue/gourmet-hampers.webp", productIds: celebration, occasion: "Holi" },
  { kind: "festival", slug: "rakhi", title: "The Bond Edit", caption: "For a bond that deserves a little more.", description: "Keepsake and gourmet ideas for your Rakhi brief. Rakhis are not listed or automatically included in these gifts.", image: "/catalogue/decorative-mementos.webp", productIds: celebration, occasion: "Rakhi" },
  { kind: "festival", slug: "christmas", title: "The Winter Edit", caption: "Thoughtful gifts for the season of giving.", description: "Existing hamper, gourmet and candle designs, brought together as Christmas gifting inspiration. Festive packaging is confirmed separately.", image: "/catalogue/corporate-hamper.webp", productIds: [...signature, ...celebration], occasion: "Christmas" },
  { kind: "festival", slug: "new-year", title: "The Celebration Edit", caption: "Begin with a gesture they remember.", description: "A considered start to a new chapter, with branded essentials and signature hampers.", image: "/catalogue/single-premium-box.webp", productIds: corporate, occasion: "New Year" },
  { kind: "festival", slug: "wedding-season", title: "The Celebration Collection", caption: "Beautiful beginnings deserve beautiful gifts.", description: "Gifting inspiration for wedding guests, drawn from the supplied catalogue rather than a separate pre-packed wedding range.", image: "/catalogue/floral-candles.webp", productIds: celebration, occasion: "Weddings", recipient: "Wedding guests" },
];

export const collections = [...giftCategories, ...giftOccasions, ...giftFestivals];
export const collectionKey = (collection: GiftCollection) => `${collection.kind}:${collection.slug}`;
export function findCollection(key: string) { return collections.find((collection) => collectionKey(collection) === key); }
export function collectionHref(collection: GiftCollection) {
  return `/${{ category: "collections", occasion: "occasions", festival: "festivals" }[collection.kind]}/${collection.slug}`;
}
export function collectionQuoteHref(collection: GiftCollection) {
  return quoteHref({ collection: collectionKey(collection), occasion: collection.occasion, recipient: collection.recipient });
}
export function collectionProducts(collection: GiftCollection, products = catalogueProducts) {
  return collection.productIds.flatMap((id) => {
    const product = products.find((item) => item.id === id);
    return product ? [product] : [];
  });
}

export const priceBands = [
  { id: "under-500", label: "Under ₹500", min: 0, max: 50000 },
  { id: "500-1000", label: "₹500–₹1,000", min: 50000, max: 100001 },
  { id: "1000-2500", label: "Over ₹1,000–₹2,500", min: 100001, max: 250001 },
  { id: "premium", label: "Over ₹2,500", min: 250001, max: Infinity },
];
export function filterDiscovery(products: CatalogueItem[], filters: { collection?: string; occasion?: string; festival?: string; budget?: string; recipient?: string }) {
  const selected = [filters.collection, filters.occasion, filters.festival].filter((value): value is string => Boolean(value));
  const recipient = filters.recipient;
  const band = filters.budget ? priceBands.find((item) => item.id === filters.budget) : undefined;
  if (filters.budget && !band && filters.budget !== "on-request") return [];
  return products.filter((product) =>
    selected.every((key) => findCollection(key)?.productIds.includes(product.id)) &&
    (!recipient || (["Employees", "Clients", "Partners"].includes(recipient) ? corporate : recipient === "Wedding guests" ? celebration : ["Friends & family", "Personal"].includes(recipient) ? catalogueProducts.map((p) => p.id) : []).includes(product.id)) &&
    (filters.budget === "on-request" ? product.cataloguePrice === undefined : !band || (product.cataloguePrice !== undefined && product.cataloguePrice >= band.min && product.cataloguePrice < band.max))
  );
}

export const catalogueEditions = [
  { slug: "collection", title: "The RUVAANI Collection", caption: "Our complete sourced collection.", image: "/catalogue/single-premium-box.webp", collection: undefined },
  { slug: "navratri", title: "The Navratri Special", caption: "Kanya / Kanjak gifting, thoughtfully wrapped.", image: "/catalogue/navratri-collection.webp", collection: "festival:navratri" },
  { slug: "diwali", title: "The Diwali Edit · 2026", caption: "A little light. A lasting memory.", image: "/catalogue/festive-collection.webp", collection: "festival:diwali" },
  { slug: "corporate", title: "The Appreciation Edit", caption: "For teams, clients and partners.", image: "/catalogue/corporate-hamper.webp", collection: "occasion:corporate" },
  { slug: "wedding", title: "The Celebration Collection", caption: "Ideas for beautiful beginnings.", image: "/catalogue/floral-candles.webp", collection: "occasion:weddings" },
  { slug: "festive", title: "The Festive Collection", caption: "Thoughtful details for every celebration.", image: "/catalogue/festive-collection.webp", collection: "occasion:festive" },
  { slug: "premium", title: "The Signature Collection", caption: "Our three supplied signature hampers.", image: "/catalogue/executive-corporate-hamper.webp", collection: undefined },
] as const;
export function editionProducts(slug: string) {
  const edition = catalogueEditions.find((item) => item.slug === slug);
  if (!edition) return [];
  if (slug === "premium") return catalogueProducts.filter((product) => product.featured);
  return edition.collection ? collectionProducts(findCollection(edition.collection)!) : catalogueProducts;
}
