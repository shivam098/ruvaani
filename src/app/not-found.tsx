import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";
export default function NotFound() { return <section className="empty-state wrap not-found"><Gift size={48} strokeWidth={1} /><span className="eyebrow">THIS LITTLE PATH LED SOMEWHERE ELSE</span><h1>A gift of a fresh <em>start.</em></h1><p>We couldn&apos;t find that page. Something lovely is still waiting in our collection.</p><Link href="/shop" className="button button-primary"><ArrowLeft size={17} />Back to the thoughtful things</Link></section>; }
