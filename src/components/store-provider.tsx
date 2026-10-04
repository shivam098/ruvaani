"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { Check, X } from "lucide-react";
import { cartLineSchema } from "@/lib/validation";
import { cartLineKey } from "@/lib/commerce";
import type { CartLine, Product } from "@/lib/types";

const KEY = "ruvaani-bag-v1";
const EMPTY = '{"cart":[],"wishlist":[]}';
const stateSchema = z.object({ cart: z.array(cartLineSchema).max(30), wishlist: z.array(z.string()).max(100) });
type State = z.infer<typeof stateSchema>;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("ruvaani-store", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("ruvaani-store", callback); };
}
function snapshot() {
  try { return localStorage.getItem(KEY) || EMPTY; }
  catch { return EMPTY; }
}
function decode(raw: string): State | null {
  try {
    const result = stateSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch { return null; }
}

interface Store {
  products: Product[];
  demo: boolean;
  cart: CartLine[];
  wishlist: string[];
  add: (line: CartLine) => boolean;
  updateQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toggleWishlist: (id: string) => void;
  notify: (message: string) => void;
}
const Context = createContext<Store | null>(null);

export function StoreProvider({ children, products, demo }: { children: React.ReactNode; products: Product[]; demo: boolean }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const parsed = useMemo(() => decode(raw), [raw]);
  const state = parsed ?? { cart: [], wishlist: [] };
  const [toast, setToast] = useState("");
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 4500); return () => clearTimeout(timer); }, [toast]);

  function persist(next: State) {
    try { localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new Event("ruvaani-store")); return true; }
    catch { setToast("Browser storage is unavailable. Please allow site storage to save your bag."); return false; }
  }
  function latest() { return decode(snapshot()) ?? { cart: [], wishlist: [] }; }
  function add(line: CartLine) {
    const checked = cartLineSchema.safeParse(line);
    if (!checked.success) { setToast("Please check the gift quantity and personalization."); return false; }
    const next = latest();
    const product = products.find((p) => p.id === line.productId);
    const total = next.cart.filter((c) => c.productId === line.productId).reduce((sum, c) => sum + c.quantity, 0) + line.quantity;
    if (!product || !product.active || total > product.stock) { setToast("That quantity is not available. Please choose fewer gifts."); return false; }
    const existing = next.cart.find((c) => cartLineKey(c) === cartLineKey(line));
    if (existing) existing.quantity += line.quantity;
    else {
      if (next.cart.length >= 30) { setToast("Your bag supports 30 selections. Contact us for a larger collection."); return false; }
      next.cart.push(checked.data);
    }
    const success = persist(next);
    if (success) setToast(`${product.name} added to your bag.`);
    return success;
  }

  return (
    <Context.Provider value={{
      products, demo, cart: state.cart, wishlist: state.wishlist, add, notify: setToast,
      updateQuantity: (key, quantity) => {
        const next = latest();
        const line = next.cart.find((c) => cartLineKey(c) === key);
        const product = products.find((p) => p.id === line?.productId);
        if (!line || !product) return;
        const other = next.cart.filter((c) => c.productId === line.productId && cartLineKey(c) !== key).reduce((sum, c) => sum + c.quantity, 0);
        if (!Number.isInteger(quantity) || quantity < product.minimumOrderQuantity || quantity + other > product.stock || quantity > 1000) {
          setToast("Please choose a quantity within the available stock."); return;
        }
        line.quantity = quantity;
        persist(next);
      },
      remove: (key) => { const next = latest(); persist({ ...next, cart: next.cart.filter((c) => cartLineKey(c) !== key) }); },
      clear: () => { persist({ ...latest(), cart: [] }); },
      toggleWishlist: (id) => {
        const next = latest();
        if (!next.wishlist.includes(id) && next.wishlist.length >= 100) { setToast("Your wishlist is full. Remove a gift to save another."); return; }
        const saved = !next.wishlist.includes(id);
        if (persist({ ...next, wishlist: saved ? [...next.wishlist, id] : next.wishlist.filter((v) => v !== id) })) {
          setToast(saved ? "Saved to your wishlist." : "Removed from your wishlist.");
        }
      },
    }}>
      {children}
      {!parsed && <div className="storage-notice" role="alert">Your saved bag could not be read. <button onClick={() => persist({ cart: [], wishlist: [] })}>Reset saved bag</button></div>}
      {toast && <div className="toast" role="status"><Check size={18} /><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast("")}><X size={16} /></button></div>}
    </Context.Provider>
  );
}

export function useStore() {
  const context = useContext(Context);
  if (!context) throw new Error("StoreProvider is missing.");
  return context;
}
