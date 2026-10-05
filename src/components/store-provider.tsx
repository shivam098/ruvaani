"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { Check, X } from "lucide-react";
import type { CatalogueItem } from "@/lib/catalog-data";

const KEY = "ruvaani-wishlist-v1";
const EMPTY = '{"wishlist":[]}';
const stateSchema = z.object({ wishlist: z.array(z.string().regex(/^rc-\d{3}$/)).max(100) });
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
  products: CatalogueItem[];
  demo: boolean;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  notify: (message: string) => void;
}
const Context = createContext<Store | null>(null);

export function StoreProvider({ children, products, demo }: { children: React.ReactNode; products: CatalogueItem[]; demo: boolean }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const parsed = useMemo(() => decode(raw), [raw]);
  const state = parsed ?? { wishlist: [] };
  const [toast, setToast] = useState("");
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 4500); return () => clearTimeout(timer); }, [toast]);

  function persist(next: State) {
    try { localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new Event("ruvaani-store")); return true; }
    catch { setToast("Browser storage is unavailable. Please allow site storage to save your wishlist."); return false; }
  }
  function latest() { return decode(snapshot()) ?? { wishlist: [] }; }

  return (
    <Context.Provider value={{
      products, demo, wishlist: state.wishlist.filter((id) => products.some((product) => product.id === id)), notify: setToast,
      toggleWishlist: (id) => {
        if (!products.some((product) => product.id === id)) { setToast("This gift is no longer in the catalogue."); return; }
        const next = latest();
        if (!next.wishlist.includes(id) && next.wishlist.length >= 100) { setToast("Your wishlist is full. Remove a gift to save another."); return; }
        const saved = !next.wishlist.includes(id);
        if (persist({ ...next, wishlist: saved ? [...next.wishlist, id] : next.wishlist.filter((v) => v !== id) })) {
          setToast(saved ? "Saved to your wishlist." : "Removed from your wishlist.");
        }
      },
    }}>
      {children}
      {!parsed && <div className="storage-notice" role="alert">Your saved wishlist could not be read. <button onClick={() => persist({ wishlist: [] })}>Reset saved wishlist</button></div>}
      {toast && <div className="toast" role="status"><Check size={18} /><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast("")}><X size={16} /></button></div>}
    </Context.Provider>
  );
}

export function useStore() {
  const context = useContext(Context);
  if (!context) throw new Error("StoreProvider is missing.");
  return context;
}
