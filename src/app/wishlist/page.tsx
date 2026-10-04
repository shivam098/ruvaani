import type { Metadata } from "next";
import { Bag } from "@/components/bag";
export const metadata: Metadata = { title: "Your thoughtful wishlist", robots: { index: false, follow: false } };
export default function WishlistPage() { return <><section className="page-heading compact"><div className="wrap"><span className="eyebrow">SAVE A LITTLE JOY FOR LATER</span><h1>Your kind of <em>lovely.</em></h1><p>A collection of all the little things that caught your heart.</p></div></section><Bag wishlist /></>; }
