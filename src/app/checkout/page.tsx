import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { Checkout } from "@/components/checkout";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The thoughtful checkout", robots: { index: false, follow: false } };
export default async function CheckoutPage() { return <><section className="page-heading compact"><div className="wrap"><span className="eyebrow">A FEW LITTLE DETAILS</span><h1>Let&apos;s make someone&apos;s <em>day.</em></h1></div></section><Checkout user={await currentUser()} /></>; }
