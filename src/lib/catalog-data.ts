import { formatPrice } from "./commerce";

export const categories = [
  "Curated hampers",
  "Divine & festive gifts",
  "Corporate essentials",
  "Gourmet & festive delights",
  "Branding & presentation",
] as const;

export const occasions = ["Navratri", "Diwali", "Employee appreciation", "Client gifting", "Corporate events", "Weddings", "Celebrations"];
export const recipients = ["Employees", "Clients", "Partners", "Friends & family"];
export const MINIMUM_QUOTE_QUANTITY = 10;
export const MINIMUM_QUOTE_BUDGET = 99;

export interface CatalogueItem {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category: typeof categories[number];
  image: string;
  imageAlt: string;
  sheet?: string;
  sheetSize?: { width: number; height: number };
  cataloguePrice?: number;
  priceType?: "starting";
  occasion?: string;
  contents?: string[];
  personalizable: boolean;
  featured: boolean;
  source: string;
}

const suppliedItems: Omit<CatalogueItem, "image" | "imageAlt">[] = [
  {
    id: "rc-017", slug: "single-premium-box", name: "Single Premium Box",
    subtitle: "Everyday essentials, exceptionally presented",
    description: "A considered collection of branded desk essentials, tea and little moments of calm, presented in the cream, emerald and ruby RUVAANI box.",
    category: "Curated hampers", cataloguePrice: 129900, personalizable: true, featured: true,
    sheet: "/catalogue/single-premium-box-sheet.webp", source: "Supplied Single Premium Box sheet",
    contents: ["Premium diary with company name & logo", "Metal pen with company logo", "Seed pencil", "Coffee tumbler with company logo", "Mini indoor plant", "Green tea / Kahwa tea premium sachets", "Premium scented candle jars (2)", "Personalised thank-you card"],
  },
  {
    id: "rc-018", slug: "corporate-hamper", name: "Corporate Hamper",
    subtitle: "A festive thank-you, made for your people",
    description: "Branded essentials meet roasted nuts, floral diyas and a personal note. A corporate gifting collection designed around appreciation.",
    category: "Curated hampers", cataloguePrice: 159900, personalizable: true, featured: true,
    sheet: "/catalogue/corporate-hamper-sheet.webp", source: "Supplied Corporate Hamper sheet",
    contents: ["Royal jars: 100 g roasted kaju & 100 g roasted badam", "Premium diary with company name & logo", "Metal pen with company logo", "Insulated temperature bottle with company name & logo", "Mini indoor plant", "Scented floral diyas (6)", "Premium scented candle jar (1)", "Personalised thank-you card"],
  },
  {
    id: "rc-019", slug: "executive-corporate-hamper", name: "Executive Corporate Hamper",
    subtitle: "A generous gesture. A lasting impression.",
    description: "Our supplied executive collection brings together branded essentials, roasted nuts, a humidifier and fragrant details in a premium presentation.",
    category: "Curated hampers", cataloguePrice: 219900, personalizable: true, featured: true,
    sheet: "/catalogue/executive-corporate-hamper-sheet.webp", source: "Supplied Executive Corporate Hamper sheet",
    contents: ["Royal jars: 100 g roasted kaju & 100 g roasted badam", "Premium diary with company name & logo", "Metal pen with company logo", "Coffee tumbler with company logo", "Coffee mug with company logo", "Humidifier with company logo", "Mini indoor plant", "Scented floral diyas (6)", "Premium scented candle jars (2)", "Personalised thank-you card"],
  },
  {
    id: "rc-020", slug: "navratri-kanjak-cone-hamper", name: "Navratri Kanya / Kanjak Cone Hamper",
    subtitle: "A small hamper for big smiles",
    description: "A ribbon-wrapped cone hamper for Navratri Kanya / Kanjak gifting, with hair accessories and small toffees. The supplied poster advertises a starting price of ₹99; final assortment, quantity and presentation are confirmed in your quote.",
    category: "Curated hampers", cataloguePrice: 9900, priceType: "starting", occasion: "Navratri",
    personalizable: false, featured: false, sheet: "/catalogue/navratri-kanjak-cone-hamper-sheet.webp",
    sheetSize: { width: 1122, height: 1402 },
    source: "Owner-supplied Navratri Kanya / Kanjak Cone Hamper poster",
    contents: ["Baby hair clips", "Scrunchy", "Mini clutcher", "Small toffees"],
  },
  {
    id: "rc-021", slug: "navratri-kanjak-hamper", name: "Navratri Kanya / Kanjak Hamper",
    subtitle: "Small gifts, big blessings",
    description: "A bow-tied dome hamper for Navratri Kanya Pujan, bringing together a handkerchief, stationery, hair accessories, a red chunni and chocolates. The supplied poster advertises a starting price of ₹149; the final selection is confirmed in your quote.",
    category: "Curated hampers", cataloguePrice: 14900, priceType: "starting", occasion: "Navratri",
    personalizable: false, featured: false, sheet: "/catalogue/navratri-kanjak-hamper-sheet.webp",
    sheetSize: { width: 1122, height: 1402 },
    source: "Owner-supplied Navratri Kanya / Kanjak Hamper poster",
    contents: ["Women's handkerchief", "Cute pencil", "Cute hair clip", "Scrunchie", "Red chunni", "Mini flower clutcher", "KitKat", "Perk chocolate"],
  },
  { id: "rc-001", slug: "royal-ganesh-divine-gift-box", name: "Royal Ganesh Divine Gift Box", subtitle: "A thoughtful festive blessing", description: "A divine gift-box option from the RUVAANI festive catalogue. Confirm the final selection, finish and presentation with our team.", category: "Divine & festive gifts", personalizable: false, featured: false, source: "RUVAANI Creation, page 5, item 1" },
  { id: "rc-002", slug: "divine-trio-gold-frame", name: "Divine Trio Gold Frame", subtitle: "A keepsake for meaningful occasions", description: "A gold-tone devotional frame from the supplied collection. Dimensions, finish and packaging are confirmed in your quotation.", category: "Divine & festive gifts", personalizable: false, featured: false, source: "RUVAANI Creation, page 5, item 2" },
  { id: "rc-003", slug: "floral-candles", name: "Floral Candles", subtitle: "A little light for their celebrations", description: "Floral candle designs for a festive hamper or gifting selection. Colours, fragrance and quantity are agreed with your brief.", category: "Divine & festive gifts", personalizable: false, featured: false, source: "RUVAANI Creation, page 5, item 3" },
  { id: "rc-004", slug: "candle-jars", name: "Candle Jars", subtitle: "Warmth, beautifully contained", description: "Decorative candle jars to include in your curated gift. Jar style, fragrance and size are subject to your confirmed selection.", category: "Divine & festive gifts", personalizable: false, featured: false, source: "RUVAANI Creation, page 5, item 4" },
  { id: "rc-005", slug: "decorative-mementos", name: "Decorative Mementos", subtitle: "Something to keep. A moment to remember.", description: "Decorative keepsakes from the festive collection. Ask our team about the available designs, finishes and presentation options.", category: "Divine & festive gifts", personalizable: false, featured: false, source: "RUVAANI Creation, page 5, item 5" },
  { id: "rc-006", slug: "customised-insulated-temperature-water-bottle", name: "Customised Insulated Temperature Water Bottle", subtitle: "An everyday essential with your identity", description: "A branded bottle option for corporate gifts and hampers. Capacity, colours, temperature-display specifications and branding are confirmed in the quote.", category: "Corporate essentials", personalizable: true, featured: false, source: "RUVAANI Creation, page 5, item 6" },
  { id: "rc-007", slug: "customised-diary", name: "Customised Diary", subtitle: "For their next bright idea", description: "A diary with company branding for a considered corporate gift. Cover, page format and personalisation details are confirmed with your selection.", category: "Corporate essentials", personalizable: true, featured: false, source: "RUVAANI Creation, page 5, item 7" },
  { id: "rc-008", slug: "customised-pen", name: "Customised Pen", subtitle: "Your brand, in the little details", description: "A personalised pen option for branded stationery sets and hampers. Finish, printing and presentation are quoted to your brief.", category: "Corporate essentials", personalizable: true, featured: false, source: "RUVAANI Creation, page 5, item 8" },
  { id: "rc-009", slug: "customised-key-chain", name: "Customised Key Chain", subtitle: "A small gesture they can carry", description: "A key-chain option with company branding. Material, colour and personalisation are confirmed before production.", category: "Corporate essentials", personalizable: true, featured: false, source: "RUVAANI Creation, page 5, item 9" },
  { id: "rc-010", slug: "customised-thank-you-card", name: "Customised Thank You Card", subtitle: "The words that make it theirs", description: "A personalised thank-you card to complete your gift. Share your message and branding for the design approval stage.", category: "Corporate essentials", personalizable: true, featured: false, source: "RUVAANI Creation, page 5, item 10" },
  { id: "rc-011", slug: "gourmet-hampers", name: "Gourmet Hampers", subtitle: "Good taste, thoughtfully brought together", description: "A gourmet hamper selection tailored to your brief. Choose the assortment with our team; contents and quantities are confirmed in writing.", category: "Gourmet & festive delights", personalizable: true, featured: false, source: "RUVAANI Creation, page 5, item 11" },
  { id: "rc-012", slug: "roasted-cashews", name: "Roasted Cashews", subtitle: "A classic festive indulgence", description: "Roasted cashews for your gifting assortment. Pack weight, ingredients, allergen information and packaging are confirmed before ordering.", category: "Gourmet & festive delights", personalizable: false, featured: false, source: "RUVAANI Creation, page 5, item 12" },
  { id: "rc-013", slug: "roasted-almonds", name: "Roasted Almonds", subtitle: "A little something to savour", description: "Roasted almonds for festive gifts and hampers. Pack weight, ingredients, allergen information and presentation are confirmed in the quote.", category: "Gourmet & festive delights", personalizable: false, featured: false, source: "RUVAANI Creation, page 5, item 13" },
  { id: "rc-014", slug: "cavity-boxes-for-sweets-and-chocolates", name: "Cavity Boxes for Sweets / Chocolates", subtitle: "Every sweet detail, in its place", description: "Compartmented presentation boxes for sweets or chocolates. Box format and any included food assortment must be confirmed separately.", category: "Gourmet & festive delights", personalizable: true, featured: false, source: "RUVAANI Creation, page 5, item 14" },
  { id: "rc-015", slug: "ribbon-branding", name: "Ribbon Branding", subtitle: "A signature finishing touch", description: "Branded ribbon as a presentation option for your hamper. Ribbon colour, printing and artwork are agreed during customisation.", category: "Branding & presentation", personalizable: true, featured: false, source: "RUVAANI Creation, page 5, item 15" },
  { id: "rc-016", slug: "custom-inserts", name: "Custom Inserts", subtitle: "A message made just for them", description: "Custom printed inserts for your gifting presentation. Share your artwork, message and required format when requesting a quote.", category: "Branding & presentation", personalizable: true, featured: false, source: "RUVAANI Creation, page 5, item 16" },
];

export const catalogueProducts: CatalogueItem[] = suppliedItems.map((item) => ({
  ...item,
  image: `/catalogue/${item.slug}.webp`,
  imageAlt: `${item.name} shown in the supplied RUVAANI catalogue`,
}));

export function formatCataloguePrice(product: CatalogueItem) {
  if (product.cataloguePrice === undefined) return "Price on request";
  return `${product.priceType === "starting" ? "From " : ""}${formatPrice(product.cataloguePrice)}`;
}

export function filterCatalogue(products: CatalogueItem[], filters: { query?: string; category?: string; personalizable?: boolean; sort?: string }) {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const result = products.filter((item) =>
    (!query || `${item.name} ${item.subtitle} ${item.description} ${item.category} ${item.contents?.join(" ") ?? ""}`.toLowerCase().includes(query)) &&
    (!filters.category || filters.category === "All gifts" || item.category === filters.category) &&
    (!filters.personalizable || item.personalizable)
  );
  if (filters.sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

export function quoteHref(options: { product?: string; quantity?: number; budget?: number; occasion?: string; recipient?: string } = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options)) if (value !== undefined && value !== "") params.set(key, String(value));
  return `/corporate${params.size ? `?${params}` : ""}#enquiry`;
}
