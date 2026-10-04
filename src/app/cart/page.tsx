import type { Metadata } from "next";
import { Bag } from "@/components/bag";
export const metadata: Metadata = { title: "Your gift bag", robots: { index: false, follow: false } };
export default function CartPage() { return <><section className="page-heading compact"><div className="wrap"><span className="eyebrow">A LITTLE THOUGHT, READY TO GO</span><h1>Your bag of <em>good feelings.</em></h1></div></section><Bag /></>; }
