import type { Metadata } from "next";
import { Wishlist } from "@/components/wishlist";
export const metadata: Metadata = { title: "Your gifting shortlist", robots: { index: false, follow: false } };
export default function WishlistPage() { return <><section className="page-heading compact"><div className="wrap"><span className="eyebrow">SAVE A LITTLE JOY FOR LATER</span><h1>Your kind of <em>lovely.</em></h1><p>A thoughtful shortlist, ready for your next gifting brief.</p></div></section><Wishlist /></>; }
