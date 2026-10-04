import type { CartLine, Product } from "./types";

export const FREE_SHIPPING_THRESHOLD = 199900;
export const SHIPPING_FEE = 9900;
export const PERSONALIZATION_FEE = 9900;
export const formatPrice = (paise: number) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
}).format(paise / 100);

export function cartLineKey(line: CartLine) {
  return JSON.stringify([line.productId, line.name, line.message]);
}

export function calculateCart(lines: CartLine[], products: Product[]) {
  if (!lines.length || lines.length > 30) throw new Error("Choose between 1 and 30 gift selections.");
  const quantities = new Map<string, number>();
  const items = lines.map((line) => {
    const product = products.find((p) => p.id === line.productId && p.active);
    if (!product) throw new Error("A gift in your bag is no longer available.");
    if (!Number.isSafeInteger(product.price) || product.price <= 0) throw new Error(`Pricing is unavailable for ${product.name}. Please contact us.`);
    if (!Number.isSafeInteger(line.quantity) || line.quantity < product.minimumOrderQuantity || line.quantity > 1000) {
      throw new Error(`Please choose a valid quantity for ${product.name}.`);
    }
    if ((line.name || line.message) && !product.personalizable) throw new Error(`${product.name} cannot be personalized.`);
    const quantity = (quantities.get(product.id) ?? 0) + line.quantity;
    quantities.set(product.id, quantity);
    if (quantity > product.stock) throw new Error(`Only ${product.stock} of ${product.name} are available.`);
    const unitPrice = product.price + (line.name || line.message ? PERSONALIZATION_FEE : 0);
    return { productId: product.id, name: product.name, quantity: line.quantity, unitPrice, personalization: { name: line.name, message: line.message } };
  });
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  // Catalogue prices are tax-inclusive; do not add GST again at checkout.
  return { items, subtotal, shipping, total: subtotal + shipping };
}

export function filterProducts(products: Product[], filters: {
  query?: string; category?: string; occasion?: string; maxPrice?: number;
  personalizable?: boolean; sort?: string; recipient?: string;
}) {
  const query = filters.query?.toLocaleLowerCase().trim() ?? "";
  const result = products.filter((p) =>
    p.active &&
    (!query || `${p.name} ${p.subtitle} ${p.category} ${p.occasions.join(" ")} ${p.includes.join(" ")}`.toLowerCase().includes(query)) &&
    (!filters.category || filters.category === "All gifts" || p.category === filters.category) &&
    (!filters.occasion || p.occasions.includes(filters.occasion)) &&
    (!filters.recipient || p.recipients.includes(filters.recipient)) &&
    (!filters.maxPrice || p.price <= filters.maxPrice) &&
    (!filters.personalizable || p.personalizable)
  );
  if (filters.sort === "price-asc") result.sort((a, b) => a.price - b.price);
  else if (filters.sort === "price-desc") result.sort((a, b) => b.price - a.price);
  else result.sort((a, b) => Number(b.featured) - Number(a.featured));
  return result;
}
